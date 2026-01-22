/**
 * Token Configuration for Base Network
 * Supported tokens and their contract addresses
 */

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
  isNative?: boolean;
  chainId: number;
}

/**
 * Base Mainnet Tokens
 */
export const BASE_MAINNET_TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    isNative: true,
    chainId: 8453,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    chainId: 8453,
  },
  {
    symbol: 'USDbC',
    name: 'USD Base Coin',
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    decimals: 6,
    chainId: 8453,
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    decimals: 18,
    chainId: 8453,
  },
  {
    symbol: 'cbETH',
    name: 'Coinbase Wrapped Staked ETH',
    address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
    decimals: 18,
    chainId: 8453,
  },
];

/**
 * Base Sepolia Testnet Tokens
 */
export const BASE_SEPOLIA_TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    isNative: true,
    chainId: 84532,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (Test)',
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    decimals: 6,
    chainId: 84532,
  },
];

/**
 * All supported tokens by chain ID
 */
export const TOKENS_BY_CHAIN: Record<number, Token[]> = {
  8453: BASE_MAINNET_TOKENS,
  84532: BASE_SEPOLIA_TOKENS,
};

/**
 * Legacy export for backwards compatibility
 */
export const BASE_TOKENS = BASE_MAINNET_TOKENS;

/**
 * Get tokens for a specific chain
 */
export function getTokensByChainId(chainId: number): Token[] {
  return TOKENS_BY_CHAIN[chainId] || [];
}

/**
 * Get token by symbol for a specific chain
 */
export function getTokenBySymbol(symbol: string, chainId: number): Token | undefined {
  const tokens = getTokensByChainId(chainId);
  return tokens.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());
}

/**
 * Get token by address for a specific chain
 */
export function getTokenByAddress(address: string, chainId: number): Token | undefined {
  const tokens = getTokensByChainId(chainId);
  return tokens.find(t => t.address.toLowerCase() === address.toLowerCase());
}

/**
 * Check if address is native token
 */
export function isNativeToken(address: string): boolean {
  return address === '0x0000000000000000000000000000000000000000';
}

/**
 * Get native token for chain
 */
export function getNativeToken(chainId: number): Token | undefined {
  const tokens = getTokensByChainId(chainId);
  return tokens.find(t => t.isNative);
}

/**
 * Get stablecoins for chain
 */
export function getStablecoins(chainId: number): Token[] {
  const tokens = getTokensByChainId(chainId);
  return tokens.filter(t => ['USDC', 'USDbC', 'DAI', 'USDT'].includes(t.symbol));
}
