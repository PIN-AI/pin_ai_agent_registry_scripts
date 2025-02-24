import { HardhatUserConfig } from "hardhat/config";
// import "hardhat-contract-sizer";
// import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const ALCHEMY_API_KEY_MAINNET = process.env.ALCHEMY_API_KEY_MAINNET || "";
const ALCHEMY_API_KEY_MATIC = process.env.ALCHEMY_API_KEY_MATIC || "";
const ALCHEMY_API_KEY_SEPOLIA = process.env.ALCHEMY_API_KEY_SEPOLIA || "";
const ALCHEMY_API_KEY_AMOY = process.env.ALCHEMY_API_KEY_AMOY || "";
let TESTNET_MNEMONIC = process.env.TESTNET_MNEMONIC;

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

interface ExtendedHDAccountsConfig {
    mnemonic: string;
    path: string;
    initialIndex: number;
    count: number;
    accountsBalance?: string;
}

const accounts: ExtendedHDAccountsConfig = {
    mnemonic: TESTNET_MNEMONIC || "velvet deliver grief train result fortune travel voice over subject subject staff nominee bone name",
    path: "m/44'/60'/0'/0",
    initialIndex: 0,
    count: 20,
};

if (!TESTNET_MNEMONIC) {
    accounts.accountsBalance = "100000000000000000000000000";
}

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";
const GNOSISSCAN_API_KEY = process.env.GNOSISSCAN_API_KEY || "";
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY || "";
const OPSCAN_API_KEY = process.env.OPSCAN_API_KEY || "";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";
const CELOSCAN_API_KEY = process.env.CELOSCAN_API_KEY || "";

const config: HardhatUserConfig = {
    networks: {
        local: {
            url: "http://localhost:8545",
        },
        mainnet: {
            url: "https://eth-mainnet.g.alchemy.com/v2/" + ALCHEMY_API_KEY_MAINNET,
            accounts: accounts,
            chainId: 1,
        },
        polygon: {
            url: "https://polygon-mainnet.g.alchemy.com/v2/" + ALCHEMY_API_KEY_MATIC,
            accounts: accounts,
            chainId: 137,
        },
        gnosis: {
            url: "https://rpc.gnosischain.com",
            accounts: accounts,
            chainId: 100,
        },
        arbitrumOne: {
            url: "https://arb1.arbitrum.io/rpc",
            accounts: accounts,
            chainId: 42161,
        },
        optimistic: {
            url: "https://optimism.drpc.org",
            accounts: accounts,
            chainId: 10,
        },
        base: {
            url: "https://mainnet.base.org",
            accounts: accounts,
            chainId: 8453,
        },
        celo: {
            url: "https://forno.celo.org",
            accounts: accounts,
            chainId: 42220,
        },
        mode: {
            url: "https://mainnet.mode.network",
            accounts: accounts,
            chainId: 34443,
        },
        sepolia: {
            url: "https://eth-sepolia.g.alchemy.com/v2/" + ALCHEMY_API_KEY_SEPOLIA,
            accounts: accounts,
            chainId: 11155111,
        },
        polygonAmoy: {
            url: "https://polygon-amoy.g.alchemy.com/v2/" + ALCHEMY_API_KEY_AMOY,
            accounts: accounts,
            chainId: 80002
        },
        chiado: {
            url: "https://rpc.chiadochain.net",
            accounts: accounts,
            chainId: 10200
        },
        arbitrumSepolia: {
            url: "https://sepolia-rollup.arbitrum.io/rpc",
            accounts: accounts,
            chainId: 421614,
        },
        optimisticSepolia: {
            url: "https://sepolia.optimism.io",
            accounts: accounts,
            chainId: 11155420,
        },
        baseSepolia: {
            url: process.env.BASE_SEPOLIA_RPC_URL || "https://base-sepolia-rpc.publicnode.com",
            accounts: [PRIVATE_KEY],
            chainId: 84532,
            timeout: 120000,
            gas: 2100000,
            gasPrice: 8000000000
        },
        celoAlfajores: {
            url: "https://alfajores-forno.celo-testnet.org",
            accounts: accounts,
            chainId: 44787,
        },
        modeSepolia: {
            url: "https://sepolia.mode.network",
            accounts: accounts,
            chainId: 919,
        },
        hardhat: {
            allowUnlimitedContractSize: true
        },
    },
    etherscan: {
        customChains: [
            {
                network: "polygonAmoy",
                chainId: 80002,
                urls: {
                    apiURL: "https://api-amoy.polygonscan.com/api",
                    browserURL: "https://amoy.polygonscan.com/"
                }
            },
            {
                network: "chiado",
                chainId: 10200,
                urls: {
                    apiURL: "https://gnosis-chiado.blockscout.com/api",
                    browserURL: "https://gnosis-chiado.blockscout.com/",
                },
            },
            {
                network: "gnosis",
                chainId: 100,
                urls: {
                    apiURL: "https://api.gnosisscan.io/api",
                    browserURL: "https://gnosisscan.io/"
                },
            },
            {
                network: "arbitrumSepolia",
                chainId: 421614,
                urls: {
                    apiURL: "https://api-sepolia.arbiscan.io/api",
                    browserURL: "https://sepolia.arbiscan.io"
                },
            },
            {
                network: "optimistic",
                chainId: 10,
                urls: {
                    apiURL: "https://api-optimistic.etherscan.io/api",
                    browserURL: "https://optimistic.etherscan.io"
                },
            },
            {
                network: "optimisticSepolia",
                chainId: 11155420,
                urls: {
                    apiURL: "https://api-sepolia-optimism.etherscan.io/api",
                    browserURL: "https://sepolia-optimistic.etherscan.io"
                },
            },
            {
                network: "base",
                chainId: 8453,
                urls: {
                    apiURL: "https://api.basescan.org/api",
                    browserURL: "https://basescan.org"
                },
            },
            {
                network: "baseSepolia",
                chainId: 84532,
                urls: {
                    apiURL: "https://base-sepolia.blockscout.com/api",
                    browserURL: "https://base-sepolia.blockscout.com/"
                },
            },
            {
                network: "celo",
                chainId: 42220,
                urls: {
                    apiURL: "https://api.celoscan.io/api",
                    browserURL: "https://explorer.celo.org/"
                },
            },
            {
                network: "celoAlfajores",
                chainId: 44787,
                urls: {
                    apiURL: "https://api-alfajores.celoscan.io/api",
                    browserURL: "https://alfajores-blockscout.celo-testnet.org/"
                },
            },
            {
                network: "mode",
                chainId: 34443,
                urls: {
                    apiURL: "https://explorer.mode.network/api",
                    browserURL: "https://explorer.mode.network"
                },
            },
            {
                network: "modeSepolia",
                chainId: 919,
                urls: {
                    apiURL: "https://sepolia.explorer.mode.network/api",
                    browserURL: "https://sepolia.explorer.mode.network"
                },
            },
        ],
        apiKey: {
            mainnet: ETHERSCAN_API_KEY,
            polygon: POLYGONSCAN_API_KEY,
            gnosis: GNOSISSCAN_API_KEY,
            arbitrumOne: ARBISCAN_API_KEY,
            optimistic: OPSCAN_API_KEY,
            base: BASESCAN_API_KEY,
            celo: CELOSCAN_API_KEY,
            sepolia: ETHERSCAN_API_KEY,
            polygonAmoy: POLYGONSCAN_API_KEY,
            chiado: GNOSISSCAN_API_KEY,
            arbitrumSepolia: ARBISCAN_API_KEY,
            optimisticSepolia: OPSCAN_API_KEY,
            baseSepolia: process.env.BASESCAN_API_KEY || "",
            celoAlfajores: CELOSCAN_API_KEY,
            mode: OPSCAN_API_KEY,
            modeSepolia: OPSCAN_API_KEY,
        }
    }
};

export default config; 