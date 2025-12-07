/**
 * Base Network Quick Switch Button
 * One-click switch to Base network
 */

import { motion } from 'framer-motion';
import { useNetworkSwitcher } from '@/hooks/useNetworkSwitcher';
import { Loader2 } from 'lucide-react';

export const BaseNetworkButton = () => {
  const { switchToBase, isSwitching, isOnBase } = useNetworkSwitcher();

  if (isOnBase) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-green-400 text-sm font-medium">Connected to Base</span>
      </motion.div>
    );
  }

  return (
    <motion.button
      onClick={switchToBase}
      disabled={isSwitching}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
    >
      {isSwitching ? (
        <>
          <Loader2 className="animate-spin" size={16} />
          <span className="text-white text-sm font-medium">Switching...</span>
        </>
      ) : (
        <>
          <span className="text-xl">🔵</span>
          <span className="text-white text-sm font-medium">Switch to Base</span>
        </>
      )}
    </motion.button>
  );
};
