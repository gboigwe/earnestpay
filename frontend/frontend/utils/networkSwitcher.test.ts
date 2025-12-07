/**
 * Network Switcher Test Utilities
 * Helper functions for testing network switching
 */

import { base } from 'wagmi/chains';

export const NETWORK_TEST_IDS = {
  BASE: 8453,
  ETHEREUM: 1,
  ARBITRUM: 42161,
  POLYGON: 137,
} as const;

export const isBaseNetwork = (chainId: number): boolean => {
  return chainId === base.id;
};

export const getNetworkName = (chainId: number): string => {
  const networks: Record<number, string> = {
    1: 'Ethereum',
    42161: 'Arbitrum',
    8453: 'Base',
    137: 'Polygon',
  };
  return networks[chainId] || 'Unknown';
};

export const validateNetworkSwitch = (
  fromChainId: number,
  toChainId: number
): { valid: boolean; message: string } => {
  if (fromChainId === toChainId) {
    return { valid: false, message: 'Already on target network' };
  }
  
  if (!Object.values(NETWORK_TEST_IDS).includes(toChainId)) {
    return { valid: false, message: 'Unsupported network' };
  }
  
  return { valid: true, message: 'Network switch valid' };
};

export const mockNetworkSwitch = async (
  targetChainId: number,
  delay: number = 1000
): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, delay));
  return Object.values(NETWORK_TEST_IDS).includes(targetChainId);
};
