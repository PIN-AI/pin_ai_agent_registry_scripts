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

async function createComponent(componentRegistry, owner) {
    // Generate unique hash for component
    const componentHash = hre.ethers.utils.keccak256(
        hre.ethers.utils.defaultAbiCoder.encode(
            ["uint256", "string", "address"],
            [Date.now(), "component", owner]
        )
    );

    // Create component
    const tx = await componentRegistry.create(owner, componentHash, []);
    const receipt = await tx.wait();
    const createEvent = receipt.events.find(e => e.event === "CreateUnit");
    const componentId = createEvent.args.unitId;
    
    console.log("Component created successfully:");
    console.log("- Component ID:", componentId.toString());
    console.log("- Owner:", owner);
    console.log("- Hash:", componentHash);

    return componentId;
}

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Executing with account:", deployer.address);
    console.log("Network:", hre.network.name);

    // Get contract instance
    const ComponentRegistry = await hre.ethers.getContractFactory("ComponentRegistry");
    const componentRegistry = await ComponentRegistry.attach(deployInfo.componentRegistry);

    // Create multiple components for testing
    const count = parseInt(process.env.COUNT || "3");
    console.log(`\nCreating ${count} test components...`);
    
    const componentIds = [];
    for(let i = 0; i < count; i++) {
        const componentId = await createComponent(componentRegistry, deployer.address);
        componentIds.push(componentId);
    }

    console.log("\nAll components created successfully:");
    console.log("Component IDs:", componentIds.map(id => id.toString()));
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
} 