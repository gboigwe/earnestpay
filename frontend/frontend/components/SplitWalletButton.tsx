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
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all font-semibold text-white shadow-lg hover:shadow-xl border border-blue-400/20"
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 10px 25px -5px rgb(59 130 246 / 0.4), 0 8px 10px -6px rgb(59 130 246 / 0.2)",
            borderColor: 'rgba(96, 165, 250, 0.4)'
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 17,
            borderColor: { duration: 0.2 }
          }}
        >
          <Wallet size={18} className="text-blue-100" />
          <span className="text-white/95">Connect Wallet</span>
          <motion.div
            className="text-blue-100"
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <>
              {/* Backdrop with blur effect */}
              <motion.div
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={() => setIsDropdownOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />

              {/* Enhanced Dropdown Menu */}
              <motion.div
                className="absolute top-full mt-2 right-0 w-72 bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden"
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 400,
                  bounce: 0.2
                }}
              >
                {/* Header with gradient accent */}
                <div className="relative p-3 border-b border-gray-800 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
                  <p className="text-xs font-medium text-blue-300 uppercase tracking-wider">
                    Connect Your Wallet
                  </p>
                  <p className="text-xs text-blue-100/70 mt-0.5">
                    Select your preferred wallet type
                  </p>
                  {/* Decorative gradient dot */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse" />
                </div>

                <div className="p-2">
                  {/* Aptos Wallet Option */}
                  <motion.button
                    onClick={handleAptosConnect}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800/50 transition-all text-left group border border-transparent hover:border-blue-500/20"
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
                    <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  </motion.button>

                  {/* EVM Wallet Option */}
                  <motion.button
                    onClick={handleEVMConnect}
                    disabled={!evmEnabled}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left group border border-transparent ${
                      evmEnabled
                        ? 'hover:bg-gray-800/50 hover:border-blue-500/20 cursor-pointer'
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
                    <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
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
