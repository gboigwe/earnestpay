import { getExplorerTxUrl, getExplorerAccountUrl as getCentralizedExplorerAccountUrl } from '@/config/networks';

export const NETWORK = import.meta.env.VITE_APP_NETWORK ?? "testnet";
export const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS ??
  "0x4f5ccbe1c0d287233e5d0bdf4d884c2558dbfa43816f96c4286fbab9f0047e44";
export const APTOS_API_KEY = import.meta.env.VITE_APTOS_API_KEY;

// Explorer URL helpers - using centralized config
export const getExplorerTxnUrl = (txnHash: string) => {
  return getExplorerTxUrl('aptos', txnHash);
};

export const getExplorerAccountUrl = (address: string) => {
  return getCentralizedExplorerAccountUrl('aptos', address);
};
