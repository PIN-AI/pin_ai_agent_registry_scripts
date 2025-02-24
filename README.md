# PIN AI Agent Registry Scripts

This repository contains scripts for creating and managing AI agents on the PIN AI Smart Contract. Follow this guide to set up your environment and create your first agent.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- pnpm (v8 or higher)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/PIN-AI/pin_ai_agent_registry_scripts.git
cd pin_ai_agent_registry_scripts
```

### 2. Install Dependencies

If you haven't installed pnpm yet, install it using npm:

```bash
npm install -g pnpm
```

Then install the project dependencies:

```bash
pnpm install
```

### 3. Configure Environment

Create and configure your environment file:

```bash
cp .env.example .env
```

Edit the `.env` file and fill in your configuration details.

### 4. Configure Agent Settings

Before creating an agent, you need to configure the agent settings in `hackathon/scripts/create-agent.js`:

1. Open `create-agent.js` and locate these lines at the beginning of the file:

```javascript
const agentName = "Your Agent Name";
const serviceUrl = "https://your-service-url.com"; // Optional
```

2. Update the values:
   - Set `agentName` to your desired agent name
   - Set `serviceUrl` to your agent's service URL (optional)

## Creating an Agent

After configuring the agent settings, create your agent by running:

```bash
pnpm run agent:create
```

This command will:
1. Create a new agent with your specified name and service URL
2. Register it on the Base Sepolia network
3. Provide you with the agent ID and transaction details

## Using ABI Directly

If you want to interact with the smart contract directly using its ABI, you can find the contract artifacts in the `artifacts/contracts/AgentRegistry.sol/AgentRegistry.json` file. Here's an example of how to create an agent using ethers.js:

```javascript
const { ethers } = require('ethers');

// Load the AgentRegistry ABI
const agentRegistryArtifact = require('./artifacts/contracts/AgentRegistry.sol/AgentRegistry.json');
const agentRegistryABI = agentRegistryArtifact.abi;

// Configure your provider and signer
const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL');
const signer = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);

// Contract address on Base Sepolia network
const AGENT_REGISTRY_ADDRESS = 'PIN_AGENT_REGISTRY_CONTRACT_ADDRESS';

// Create contract instance
const agentRegistry = new ethers.Contract(AGENT_REGISTRY_ADDRESS, agentRegistryABI, signer);

async function createAgent() {
    try {
        // Prepare agent creation parameters
        const agentHash = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ["uint256", "string", "string", "address"],
                [Date.now(), "Your Agent Name", "https://your-service-url.com", owner]
            )
        );
        
        // Set registration fee
        const registrationFee = "10000000000000000"; // 0.01 ETH, adjust according to actual fee
        
        // Call create function
        const tx = await agentRegistry.create(
            owner, // owner address
            agentHash, // unique hash for the agent
            [1], // array of component IDs your agent depends on
            { value: registrationFee } // registration fee
        );
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log('Agent created successfully:', receipt);
    } catch (error) {
        console.error('Error creating agent:', error);
    }
}
```

## Related Smart Contracts on Chain

- [PIN Agent Registry](https://sepolia.basescan.org/address/0x926ade85abb91daec964f0e6d399c076cb0f84e3)

## Support

If you encounter any issues or need assistance, please open an issue in the GitHub repository.

## License

This project is licensed under the ISC License - see the LICENSE file for details.