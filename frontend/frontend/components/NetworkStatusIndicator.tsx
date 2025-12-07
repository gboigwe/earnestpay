/**
 * Network Status Indicator
 * Displays current network status with visual feedback
 */

import { useChainId, useAccount } from 'wagmi';
import { base } from 'wagmi/chains';
import { useChain } from '@/contexts/ChainContext';
import { motion } from 'framer-motion';

export const NetworkStatusIndicator = () => {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { selectedChain } = useChain();

  if (!isConnected || selectedChain === 'aptos') return null;

  const isOnBase = chainId === base.id;
  const isCorrectNetwork = 
    (selectedChain === 'base' && chainId === 8453) ||
    (selectedChain === 'ethereum' && chainId === 1) ||
    (selectedChain === 'arbitrum' && chainId === 42161) ||
    (selectedChain === 'polygon' && chainId === 137);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
        isCorrectNetwork
          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
      }`}
    >
      <span className="relative flex h-2 w-2">
        {isCorrectNetwork && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          isCorrectNetwork ? 'bg-green-500' : 'bg-yellow-500'
        }`}></span>
      </span>
      {isOnBase ? 'Base Network' : `Chain ${chainId}`}
    </motion.div>
  );
};
