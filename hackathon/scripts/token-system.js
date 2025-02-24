const hre = require("hardhat");
const fs = require("fs");
const process = require("process");

// Load deployment info
let deployInfo;
try {
    deployInfo = JSON.parse(fs.readFileSync("./hackathon/deployment.json"));
} catch (error) {
    console.error("Error loading deployment info. Please run deploy.js first");
    process.exit(1);
}

async function setTokenSystem(agentRegistry, tokenImpl, assetToken, router, threshold) {
    const tx = await agentRegistry.setTokenSystem(
        tokenImpl,
        assetToken,
        router,
        hre.ethers.utils.parseEther(threshold.toString())
    );
    await tx.wait();
    console.log("Token system parameters updated successfully");
}

async function setDefaultTokenParams(agentRegistry, params) {
    const tx = await agentRegistry.setDefaultTokenParams({
        maxSupply: hre.ethers.utils.parseEther(params.maxSupply.toString()),
        lpSupply: hre.ethers.utils.parseEther(params.lpSupply.toString()),
        vaultSupply: hre.ethers.utils.parseEther(params.vaultSupply.toString()),
        maxTokensPerWallet: hre.ethers.utils.parseEther(params.maxTokensPerWallet.toString()),
        maxTokensPerTxn: hre.ethers.utils.parseEther(params.maxTokensPerTxn.toString()),
        botProtectionDurationInSeconds: params.botProtectionDuration,
        vault: params.vault
    });
    await tx.wait();
    console.log("Default token parameters updated successfully");
}

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Executing with account:", deployer.address);
    console.log("Network:", hre.network.name);

    // Get contract instance
    const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
    const agentRegistry = await AgentRegistry.attach(deployInfo.agentRegistry);

    const command = process.env.COMMAND;
    if (!command) {
        console.log(`
Available commands:
------------------
COMMAND=setSystem IMPL=<addr> ASSET=<addr> ROUTER=<addr> THRESHOLD=<amount> : Set token system parameters
COMMAND=setParams MAX_SUPPLY=<amount> LP_SUPPLY=<amount> VAULT_SUPPLY=<amount> MAX_WALLET=<amount> MAX_TXN=<amount> BOT_PROTECTION=<seconds> VAULT=<addr> : Set default token parameters
        `);
        return;
    }

    try {
        switch (command) {
        case "setSystem": {
            const { IMPL, ASSET, ROUTER, THRESHOLD } = process.env;
            if (!IMPL || !ASSET || !ROUTER || !THRESHOLD) {
                throw new Error("Missing parameters for setSystem command");
            }
            await setTokenSystem(agentRegistry, IMPL, ASSET, ROUTER, parseFloat(THRESHOLD));
            break;
        }
        case "setParams": {
            const {
                MAX_SUPPLY,
                LP_SUPPLY,
                VAULT_SUPPLY,
                MAX_WALLET,
                MAX_TXN,
                BOT_PROTECTION,
                VAULT
            } = process.env;
                
            if (!MAX_SUPPLY || !LP_SUPPLY || !VAULT_SUPPLY || !MAX_WALLET || 
                    !MAX_TXN || !BOT_PROTECTION || !VAULT) {
                throw new Error("Missing parameters for setParams command");
            }

            await setDefaultTokenParams(agentRegistry, {
                maxSupply: parseFloat(MAX_SUPPLY),
                lpSupply: parseFloat(LP_SUPPLY),
                vaultSupply: parseFloat(VAULT_SUPPLY),
                maxTokensPerWallet: parseFloat(MAX_WALLET),
                maxTokensPerTxn: parseFloat(MAX_TXN),
                botProtectionDuration: parseInt(BOT_PROTECTION),
                vault: VAULT
            });
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

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
} 