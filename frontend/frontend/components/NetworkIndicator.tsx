/**
 * Network Indicator Component
 * Shows current network and allows switching
 */

import { useState } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'viem/chains';
import { AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getNetworkName,
  isTestnet,
  isSupportedChain,
  getNetworkColors,
} from '@/config/networks.config';

export const NetworkIndicator = () => {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);

  const isSupported = isSupportedChain(chainId);
  const networkName = getNetworkName(chainId);
  const isTest = isTestnet(chainId);
  const colors = getNetworkColors(chainId);

  const handleSwitchNetwork = (targetChainId: number) => {
    switchChain({ chainId: targetChainId });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Network Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
          isSupported
            ? `${colors.bg} ${colors.text} ${colors.border} hover:bg-opacity-80`
            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
        }`}
        disabled={isPending}
      >
        {/* Status Indicator */}
        {isSupported ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        )}

        {/* Network Name */}
        <span className="text-sm font-medium">
          {isPending ? 'Switching...' : networkName}
        </span>

        {/* Testnet Badge */}
        {isTest && isSupported && (
          <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded">
            Testnet
          </span>
        )}

        {/* Dropdown Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Network Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden"
            >
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Select Network
                </div>

                {/* Base Mainnet */}
                <button
                  onClick={() => handleSwitchNetwork(base.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    chainId === base.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                  disabled={isPending}
                >
                  {chainId === base.id && <CheckCircle className="w-4 h-4" />}
                  {chainId !== base.id && <div className="w-4" />}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">Base Mainnet</div>
                    <div className="text-xs text-gray-500">Chain ID: 8453</div>
                  </div>
                </button>

                {/* Base Sepolia */}
                <button
                  onClick={() => handleSwitchNetwork(baseSepolia.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    chainId === baseSepolia.id
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'hover:bg-gray-50'
                  }`}
                  disabled={isPending}
                >
                  {chainId === baseSepolia.id && <CheckCircle className="w-4 h-4" />}
                  {chainId !== baseSepolia.id && <div className="w-4" />}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">Base Sepolia</div>
                    <div className="text-xs text-gray-500">
                      Chain ID: 84532 • Testnet
                    </div>
                  </div>
                </button>
              </div>

              {/* Unsupported Network Warning */}
              {!isSupported && (
                <div className="border-t border-gray-200 p-3 bg-red-50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-red-700">
                      <div className="font-semibold mb-1">Unsupported Network</div>
                      <div>Please switch to Base Mainnet or Base Sepolia.</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Compact Network Indicator (for mobile)
 */
export const NetworkIndicatorCompact = () => {
  const chainId = useChainId();
  const isSupported = isSupportedChain(chainId);
  const isTest = isTestnet(chainId);
  const colors = getNetworkColors(chainId);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
        isSupported
          ? `${colors.bg} ${colors.text}`
          : 'bg-red-50 text-red-700'
      }`}
    >
      {isSupported ? (
        <div className="w-2 h-2 rounded-full bg-current" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      <span>
        {isTest ? 'Testnet' : 'Mainnet'}
      </span>
    </div>
  );
};

/**
 * Network Guard Component
 * Blocks content if on wrong network
 */
export const NetworkGuard = ({
  children,
  requiredChainId,
}: {
  children: React.ReactNode;
  requiredChainId?: number;
}) => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // If no required chain, just check if supported
  if (!requiredChainId) {
    if (!isSupportedChain(chainId)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  Unsupported Network
                </h3>
                <p className="text-sm text-red-600 mb-4">
                  You're connected to an unsupported network. Please switch to
                  Base Mainnet or Base Sepolia to continue.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => switchChain({ chainId: base.id })}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Switch to Base
              </button>
              <button
                onClick={() => switchChain({ chainId: baseSepolia.id })}
                className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm transition-colors"
              >
                Use Testnet
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  }

  // Check specific required chain
  if (chainId !== requiredChainId) {
    const requiredNetworkName = getNetworkName(requiredChainId);

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="max-w-md w-full bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-700 mb-2">
                Wrong Network
              </h3>
              <p className="text-sm text-yellow-600 mb-4">
                This feature requires you to be on {requiredNetworkName}. Please
                switch networks to continue.
              </p>
            </div>
          </div>

          <button
            onClick={() => switchChain({ chainId: requiredChainId })}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Switch to {requiredNetworkName}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
