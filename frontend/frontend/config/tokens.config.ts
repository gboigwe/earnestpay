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
}

export const BASE_TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    isNative: true,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
  },
  {
    symbol: 'USDbC',
    name: 'USD Base Coin',
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    decimals: 6,
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    decimals: 18,
  },
];

export const getTokenBySymbol = (symbol: string): Token | undefined => {
  return BASE_TOKENS.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());
};

export const getTokenByAddress = (address: string): Token | undefined => {
  return BASE_TOKENS.find(t => t.address.toLowerCase() === address.toLowerCase());
};

export const isNativeToken = (address: string): boolean => {
  return address === '0x0000000000000000000000000000000000000000';
};
