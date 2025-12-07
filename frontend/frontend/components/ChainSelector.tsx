import { useState } from 'react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useSwitchChain, useChainId } from 'wagmi';
import { mainnet, arbitrum, base, polygon } from 'wagmi/chains';
import { useChain, ChainType } from '@/contexts/ChainContext';
import { toast } from './ui/use-toast';
import { useMultiChainErrorHandler } from '@/hooks/useMultiChainErrorHandler.tsx';
import { NetworkSwitchError } from '@/errors/MultiChainErrors';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ChainSelector Component with EVM Network Switching
 *
 * Allows users to switch between:
 * - Aptos blockchain
 * - EVM networks (Ethereum, Arbitrum, Base, Polygon)
 */

type Chain = {
  id: string;
  name: string;
  icon: string;
  type: 'aptos' | 'evm';
  enabled: boolean;
  chainId?: number;
  color?: string;
};

const CHAINS: Chain[] = [
  {
    id: 'aptos',
    name: 'Aptos',
    icon: '🟣',
    type: 'aptos',
    enabled: true,
    color: '#00D1B2',
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    icon: '⟠',
    type: 'evm',
    enabled: true,
    chainId: mainnet.id,
    color: '#627EEA',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    icon: '🔷',
    type: 'evm',
    enabled: true,
    chainId: arbitrum.id,
    color: '#28A0F0',
  },
  {
    id: 'base',
    name: 'Base',
    icon: '🔵',
    type: 'evm',
    enabled: true,
    chainId: base.id,
    color: '#0052FF',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    icon: '🟪',
    type: 'evm',
    enabled: true,
    chainId: polygon.id,
    color: '#8247E5',
  },
];

export const ChainSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const { selectedChain: selectedChainId, setSelectedChain } = useChain();
  const { connected: aptosConnected } = useWallet();

  // EVM network switching
  const { switchChain: switchEVMChain } = useSwitchChain();
  const currentEVMChainId = useChainId();

  // Multi-chain error handling
  const { handleNetworkError } = useMultiChainErrorHandler();

  // Check if Reown is configured
  const reownProjectId = import.meta.env.VITE_REOWN_PROJECT_ID;
  const evmEnabled = !!reownProjectId;

  // Find the selected chain object
  const selectedChain = CHAINS.find(c => c.id === selectedChainId) || CHAINS[0];

  const handleChainSelect = async (chain: Chain) => {
    if (!chain.enabled) {
      return;
    }

    // If selecting an EVM chain, switch the network
    if (chain.type === 'evm' && chain.chainId && evmEnabled) {
      if (!switchEVMChain) {
        // Create a custom error for wallet not connected
        const error = new NetworkSwitchError(
          'EVM wallet not connected',
          'Please connect an EVM wallet first to switch networks.',
          selectedChainId,
          chain.id as ChainType
        );

        handleNetworkError(
          error,
          selectedChainId,
          chain.id as ChainType
        );

        setIsOpen(false);
        return;
      }

      setIsSwitching(true);
      try {
        await switchEVMChain({ chainId: chain.chainId });

        // Update the context after successful switch
        setSelectedChain(chain.id as ChainType);

        toast({
          title: "Network Switched",
          description: `Successfully switched to ${chain.name}`,
        });
      } catch (error: any) {
        // Use the multi-chain error handler with retry action
        handleNetworkError(
          error,
          selectedChainId,
          chain.id as ChainType,
          () => handleChainSelect(chain) // Retry action
        );
      } finally {
        setIsSwitching(false);
      }
    } else {
      // Aptos chain or EVM when Reown not configured
      setSelectedChain(chain.id as ChainType);
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
        {selectedChain.type === 'aptos' && aptosConnected && (
          <span className="relative flex h-2 w-2" title="Connected">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
        {selectedChain.type === 'evm' && currentEVMChainId === selectedChain.chainId && (
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
                <p className="text-xs text-gray-400 font-medium">SELECT NETWORK</p>
              </div>

              <div className="p-2">
                {CHAINS.map((chain, index) => {
                  const isSelected = chain.id === selectedChainId;
                  const isCurrentEVMNetwork = chain.type === 'evm' && chain.chainId === currentEVMChainId;
                  const isDisabled = chain.type === 'evm' && !evmEnabled;

                  return (
                    <motion.button
                      key={chain.id}
                      onClick={() => handleChainSelect(chain)}
                      disabled={isDisabled || isSwitching}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                        ${isSelected ? 'bg-blue-500/10 border border-blue-500/30' : 'hover:bg-gray-800 hover:scale-[1.02]'}
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      whileHover={!isDisabled && !isSwitching ? { x: 4 } : {}}
                      whileTap={!isDisabled && !isSwitching ? { scale: 0.98 } : {}}
                    >
                      <span className="text-2xl">{chain.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{chain.name}</span>
                          {isCurrentEVMNetwork && (
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
                        {isDisabled && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Configure Reown to enable
                          </p>
                        )}
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

              {!evmEnabled && (
                <motion.div
                  className="p-3 border-t border-gray-800 bg-gray-800/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: CHAINS.length * 0.05 + 0.1 }}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle size={16} className="text-yellow-400 mt-0.5" />
                    <p className="text-xs text-gray-400">
                      To enable EVM networks:
                    </p>
                  </div>
                  <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside ml-4">
                    <li>Sign up at <span className="text-blue-400">cloud.reown.com</span></li>
                    <li>Add project ID to .env file</li>
                    <li>Restart development server</li>
                  </ol>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
