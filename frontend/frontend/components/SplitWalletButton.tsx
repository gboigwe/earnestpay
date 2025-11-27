import React, { useState, lazy, Suspense } from 'react';
import { Wallet, ChevronDown } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiChainErrorHandler } from '@/hooks/useMultiChainErrorHandler.tsx';
import { useChain } from '@/contexts/ChainContext';

/**
 * Lazy load EnhancedWalletModal to reduce initial bundle
 * Only loads when user clicks to connect Aptos wallet
 */
const EnhancedWalletModal = lazy(() =>
  import('./EnhancedWalletModal').then(module => ({
    default: module.EnhancedWalletModal
  }))
);

/**
 * SplitWalletButton Component
 *
 * Provides separate connection options for:
 * - Aptos wallets (Petra, Martian, Pontem, etc.)
 * - EVM wallets via Reown (MetaMask, WalletConnect, Coinbase, etc.)
 *
 * Performance:
 * - Uses lazy loading for wallet modals
 * - Only loads code when user initiates connection
 */

export const SplitWalletButton: React.FC = () => {
  const [showAptosModal, setShowAptosModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get Reown AppKit modal hook
  const { open: openReownModal } = useAppKit();

  // Get error handler and chain context
  const { handleWalletError } = useMultiChainErrorHandler();
  const { selectedChain } = useChain();

  // Check if Reown is configured
  const reownProjectId = import.meta.env.VITE_REOWN_PROJECT_ID;
  const evmEnabled = !!reownProjectId;

  const handleAptosConnect = () => {
    setShowAptosModal(true);
    setIsDropdownOpen(false);
  };

  const handleEVMConnect = async () => {
    if (!evmEnabled) return;

    try {
      await openReownModal();
      setIsDropdownOpen(false);
    } catch (error) {
      // Use MultiChainError system for consistent error handling
      handleWalletError(error, selectedChain, () => handleEVMConnect());
    }
  };

  // Always show split button for wallet selection
  return (
    <>
      <div className="relative">
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all font-semibold text-white shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Wallet size={18} />
          <span>Connect Wallet</span>
          <motion.div
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />

              {/* Dropdown Menu */}
              <motion.div
                className="absolute top-full mt-2 right-0 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="p-3 border-b border-gray-800">
                  <p className="text-xs text-gray-400 font-medium">CHOOSE WALLET TYPE</p>
                </div>

                <div className="p-2">
                  {/* Aptos Wallet Option */}
                  <motion.button
                    onClick={handleAptosConnect}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors text-left group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05, duration: 0.2 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="flex items-center justify-center w-10 h-10 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors"
                      whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
                    >
                      <span className="text-2xl">🟣</span>
                    </motion.div>
                    <div className="flex-1">
                      <div className="text-white font-medium">Aptos Wallet</div>
                      <div className="text-xs text-gray-400">Petra, Martian, Pontem, etc.</div>
                    </div>
                  </motion.button>

                  {/* EVM Wallet Option */}
                  <motion.button
                    onClick={handleEVMConnect}
                    disabled={!evmEnabled}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left group ${
                      evmEnabled
                        ? 'hover:bg-gray-800 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    whileHover={evmEnabled ? { x: 4, scale: 1.01 } : {}}
                    whileTap={evmEnabled ? { scale: 0.98 } : {}}
                  >
                    <motion.div
                      className="flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors"
                      whileHover={evmEnabled ? { rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } } : {}}
                    >
                      <span className="text-2xl">⟠</span>
                    </motion.div>
                    <div className="flex-1">
                      <div className="text-white font-medium">EVM Wallet</div>
                      <div className="text-xs text-gray-400">
                        {evmEnabled
                          ? 'MetaMask, Coinbase, WalletConnect'
                          : 'Configure Reown to enable'
                        }
                      </div>
                    </div>
                  </motion.button>
                </div>

                {!evmEnabled && (
                  <motion.div
                    className="p-3 border-t border-gray-800 bg-gray-800/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <p className="text-xs text-gray-400">
                      To enable EVM wallets, add VITE_REOWN_PROJECT_ID to your .env file.
                      <br />
                      <a
                        href="https://cloud.reown.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Get Project ID →
                      </a>
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Aptos Wallet Modal - Lazy Loaded */}
      {showAptosModal && (
        <Suspense fallback={
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.p
                className="text-white text-sm font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Loading wallet...
              </motion.p>
            </motion.div>
          </motion.div>
        }>
          <EnhancedWalletModal
            isOpen={showAptosModal}
            onClose={() => setShowAptosModal(false)}
            onSuccess={() => setShowAptosModal(false)}
          />
        </Suspense>
      )}
    </>
  );
};
