import { Address } from 'viem';

type NetworkConfig = {
  chainId: number;
  name: string;
  address: Address;
  blockExplorer: string;
};

type ChainConfig = {
  [key: string]: {
    testnet?: NetworkConfig;
    mainnet: NetworkConfig;
  };
};

export const PAYROLL_CONTRACTS: ChainConfig = {
  aptos: {
    testnet: {
      chainId: 1, // Aptos testnet chain ID
      name: 'Aptos Testnet',
      address: '0x4f5ccbe1c0d287233e5d0bdf4d884c2558dbfa43816f96c4286fbab9f0047e44' as Address,
      blockExplorer: 'https://explorer.aptoslabs.com',
    },
    mainnet: {
      chainId: 1, // Update with actual mainnet chain ID
      name: 'Aptos Mainnet',
      address: '0x...' as Address,
      blockExplorer: 'https://explorer.aptoslabs.com',
    },
  },
  ethereum: {
    sepolia: {
      chainId: 11155111,
      name: 'Ethereum Sepolia',
      address: '0x...' as Address,
      blockExplorer: 'https://sepolia.etherscan.io',
    },
    mainnet: {
      chainId: 1,
      name: 'Ethereum Mainnet',
      address: '0x...' as Address,
      blockExplorer: 'https://etherscan.io',
    },
  },
  arbitrum: {
    sepolia: {
      chainId: 421614,
      name: 'Arbitrum Sepolia',
      address: '0x...' as Address,
      blockExplorer: 'https://sepolia.arbiscan.io',
    },
    mainnet: {
      chainId: 42161,
      name: 'Arbitrum One',
      address: '0x...' as Address,
      blockExplorer: 'https://arbiscan.io',
    },
  },
  base: {
    sepolia: {
      chainId: 84532,
      name: 'Base Sepolia',
      address: '0x...' as Address,
      blockExplorer: 'https://sepolia.basescan.org',
    },
    mainnet: {
      chainId: 8453,
      name: 'Base',
      address: '0x...' as Address,
      blockExplorer: 'https://basescan.org',
    },
  },
  polygon: {
    amoy: {
      chainId: 80002,
      name: 'Polygon Amoy',
      address: '0x...' as Address,
      blockExplorer: 'https://amoy.polygonscan.com',
    },
    mainnet: {
      chainId: 137,
      name: 'Polygon',
      address: '0x...' as Address,
      blockExplorer: 'https://polygonscan.com',
    },
  },
};

// Helper function to get contract config by chain ID
export const getContractConfig = (chainId: number): NetworkConfig | undefined => {
  for (const chain of Object.values(PAYROLL_CONTRACTS)) {
    const network = Object.values(chain).find(
      (net) => net?.chainId === chainId
    );
    if (network) return network;
  }
  return undefined;
};

// Get all supported chain IDs
export const getSupportedChainIds = (): number[] => {
  const chainIds = new Set<number>();
  
  Object.values(PAYROLL_CONTRACTS).forEach((networks) => {
    Object.values(networks).forEach((network) => {
      if (network) {
        chainIds.add(network.chainId);
      }
    });
  });
  
  return Array.from(chainIds);
};
