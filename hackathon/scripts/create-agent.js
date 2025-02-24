const hre = require("hardhat");
const fs = require("fs");
const process = require("process");

const agentName = "Your Agent Name";
const serviceUrl = "https://your-service-url.com"; // Optional

// Load deployment info
let deployInfo;
try {
    deployInfo = JSON.parse(fs.readFileSync("./hackathon/deployment.json"));
} catch (error) {
    console.error("Error loading deployment info. Please run deploy.js first");
    process.exit(1);
}

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Executing with account:", deployer.address);
    console.log("Network:", hre.network.name);

    // Get contract instances
    const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
    const agentRegistry = await AgentRegistry.attach(deployInfo.agentRegistry);

    const ComponentRegistry = await hre.ethers.getContractFactory("ComponentRegistry");
    const componentRegistry = await ComponentRegistry.attach(deployInfo.componentRegistry);

    const MockToken = await hre.ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.attach(deployInfo.mockToken);

    // Parse command line arguments
    const command = process.env.COMMAND;
    if (!command) {
        console.log(`
Available commands:
------------------
COMMAND=createAgent DEPS=1,2,3                    : Create a new agent with dependencies
COMMAND=createToken AGENT_ID=1 NAME=Test SYMBOL=TST : Create token for existing agent
COMMAND=createBoth DEPS=1,2,3 NAME=Test SYMBOL=TST  : Create agent and token in one go
        `);
        return;
    }

    try {
        switch (command) {
        case "createAgent": {
            const dependencies = [1];
            await createAgent(agentRegistry, componentRegistry, deployer.address, dependencies);
            break;
        }
        case "createToken": {
            const { AGENT_ID, NAME, SYMBOL } = process.env;
            if (!AGENT_ID || !NAME || !SYMBOL) {
                throw new Error("Missing parameters for createToken command");
            }
            await createAgentToken(agentRegistry, mockToken, AGENT_ID, NAME, SYMBOL);
            break;
        }
        case "createBoth": {
            const { DEPS, NAME, SYMBOL } = process.env;
            if (!DEPS || !NAME || !SYMBOL) {
                throw new Error("Missing parameters for createBoth command");
            }
            const dependencies = DEPS.split(",").map(d => parseInt(d.trim()));
            
            // Create agent first
            const agentId = await createAgent(agentRegistry, componentRegistry, deployer.address, dependencies);
            
            // Then create token
            await createAgentToken(agentRegistry, mockToken, agentId, NAME, SYMBOL);
            break;
        }
        default: {
            throw new Error("Unknown command: " + command);
        }
        }
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}



async function createAgent(agentRegistry, componentRegistry, owner, dependencies) {
    // Generate unique hash for agent
    const agentHash = hre.ethers.utils.keccak256(
        hre.ethers.utils.defaultAbiCoder.encode(
            ["uint256", "string", "string", "address"],
            [Date.now(), agentName, serviceUrl, owner]
        )
    );

    // Create agent
    const tx = await agentRegistry.create(
        owner,
        agentHash,
        dependencies,
        { value: deployInfo.registrationFee }
    );
    const receipt = await tx.wait();
    const createEvent = receipt.events.find(e => e.event === "CreateUnit");
    const agentId = createEvent.args.unitId;
    
    console.log("Agent created successfully:");
    console.log("- Agent ID:", agentId.toString());
    console.log("- Owner:", owner);
    console.log("- AgentHash:", agentHash);
    console.log("- Dependencies:", dependencies);
    console.log("- Transaction Hash:", tx.hash);

    return agentId;
}

async function createAgentToken(agentRegistry, mockToken, agentId, name, symbol) {
    // Check token balance
    const balance = await mockToken.balanceOf(await mockToken.signer.getAddress());
    const applicationThreshold = deployInfo.applicationThreshold;
    
    // Mint more tokens if needed
    if (balance.lt(applicationThreshold)) {
        const amount = hre.ethers.utils.parseEther("1000.0");
        await mockToken.mint(await mockToken.signer.getAddress(), amount);
        console.log("Minted additional tokens. New balance:", 
            hre.ethers.utils.formatEther(await mockToken.balanceOf(await mockToken.signer.getAddress())));
    }
    
    // Set mock pair address
    const UniswapV2Router = await hre.ethers.getContractFactory("UniswapV2Router");
    const uniswapV2Router = await UniswapV2Router.attach(deployInfo.uniswapV2Router);
    const mockPairAddress = "0x0000000000000000000000000000000000000001";
    await uniswapV2Router.setMockPair(mockPairAddress);
    console.log("Set mock pair address:", mockPairAddress);
    
    // Approve asset tokens for proposal
    await mockToken.approve(agentRegistry.address, applicationThreshold);
    
    // Create proposal
    const proposeTx = await agentRegistry.proposeAgent(agentId, name, symbol);
    const proposeReceipt = await proposeTx.wait();
    const proposeEvent = proposeReceipt.events.find(e => e.event === "AgentProposed");
    const proposalId = proposeEvent.args.proposalId;
    
    console.log("\nProposal created successfully:");
    console.log("- Proposal ID:", proposalId.toString());
    console.log("- Token Name:", name);
    console.log("- Token Symbol:", symbol);
    console.log("- Vault Address:", deployInfo.defaultTokenParams.vault);

    // Execute proposal
    const executeTx = await agentRegistry.executeApplication(proposalId);
    const executeReceipt = await executeTx.wait();
    const tokenEvent = executeReceipt.events.find(e => e.event === "TokenCreated");
    
    console.log("\nToken created successfully:");
    console.log("- Token Address:", tokenEvent.args.token);
    console.log("- Liquidity Pool:", tokenEvent.args.liquidityPool);

    return {
        proposalId,
        tokenAddress: tokenEvent.args.token,
        liquidityPool: tokenEvent.args.liquidityPool
    };
}


if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
} 