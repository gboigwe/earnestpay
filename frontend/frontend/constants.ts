import { getExplorerTxUrl, getExplorerAccountUrl as getCentralizedExplorerAccountUrl } from '@/config/networks';

// Base network configuration
export const NETWORK = import.meta.env.VITE_APP_NETWORK ?? "base-sepolia";
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? "";

// Base chain IDs
export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// Get current chain ID based on network
export const CURRENT_CHAIN_ID = NETWORK === "base" ? BASE_MAINNET_CHAIN_ID : BASE_SEPOLIA_CHAIN_ID;

// Explorer URL helpers - using centralized config
export const getExplorerTxnUrl = (txnHash: string) => {
  const chainType = NETWORK === "base" ? "base" : "base-sepolia";
  return getExplorerTxUrl(chainType, txnHash);
};

export const getExplorerAccountUrl = (address: string) => {
  const chainType = NETWORK === "base" ? "base" : "base-sepolia";
  return getCentralizedExplorerAccountUrl(chainType, address);
};
