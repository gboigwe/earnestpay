import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useSwitchChain, useChainId } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { useChain, ChainType } from '@/contexts/ChainContext';
import { toast } from './ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ChainSelector Component for Base Networks
 *
 * Allows users to switch between:
 * - Base mainnet
 * - Base Sepolia testnet
 */

type Chain = {
  id: ChainType;
  name: string;
  icon: string;
  chainId: number;
  color: string;
};

const CHAINS: Chain[] = [
  {
    id: 'base',
    name: 'Base',
    icon: '🔵',
    chainId: base.id,
    color: '#0052FF',
  },
  {
    id: 'base-sepolia',
    name: 'Base Sepolia',
    icon: '🔷',
    chainId: baseSepolia.id,
    color: '#0052FF',
  },
];

export const ChainSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const { selectedChain: selectedChainId, setSelectedChain } = useChain();

  // Network switching
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();

  // Find the selected chain object
  const selectedChain = CHAINS.find(c => c.id === selectedChainId) || CHAINS[0];

  const handleChainSelect = async (chain: Chain) => {
    if (!switchChain) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first to switch networks.",
        variant: "destructive",
      });
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    try {
      await switchChain({ chainId: chain.chainId });

      // Update the context after successful switch
      setSelectedChain(chain.id);

      toast({
        title: "Network Switched",
        description: `Successfully switched to ${chain.name}`,
      });
    } catch (error: any) {
      console.error('Network switch error:', error);

      let errorMessage = "Failed to switch network";
      if (error?.message?.includes("User rejected")) {
        errorMessage = "Network switch cancelled";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Network Switch Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }

    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all duration-300 disabled:opacity-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        layout
      >
        <motion.span
          className="text-xl"
          key={selectedChain.id}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {selectedChain.icon}
        </motion.span>
        <motion.span
          className="text-white font-medium"
          key={`name-${selectedChain.id}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {selectedChain.name}
        </motion.span>
        {currentChainId === selectedChain.chainId && (
          <span className="relative flex h-2 w-2" title="Connected">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
        {isSwitching ? (
          <motion.div
            className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="text-gray-400" size={16} />
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />

            {/* Dropdown */}
            <motion.div
              className="absolute top-full mt-2 right-0 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="p-3 border-b border-gray-800">
                <p className="text-xs text-gray-400 font-medium">SELECT BASE NETWORK</p>
              </div>

              <div className="p-2">
                {CHAINS.map((chain, index) => {
                  const isSelected = chain.id === selectedChainId;
                  const isCurrentNetwork = chain.chainId === currentChainId;

                  return (
                    <motion.button
                      key={chain.id}
                      onClick={() => handleChainSelect(chain)}
                      disabled={isSwitching}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                        ${isSelected ? 'bg-blue-500/10 border border-blue-500/30' : 'hover:bg-gray-800 hover:scale-[1.02]'}
                        cursor-pointer
                      `}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      whileHover={!isSwitching ? { x: 4 } : {}}
                      whileTap={!isSwitching ? { scale: 0.98 } : {}}
                    >
                      <span className="text-2xl">{chain.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{chain.name}</span>
                          {isCurrentNetwork && (
                            <motion.span
                              className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring" }}
                            >
                              Active
                            </motion.span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <Check className="text-blue-400" size={18} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
