import React, { useState } from 'react';
import { Wallet, ChevronDown } from 'lucide-react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { useAccount as useEVMAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { EnhancedWalletModal } from './EnhancedWalletModal';

/**
 * SplitWalletButton Component
 *
 * Provides separate connection options for:
 * - Aptos wallets (Petra, Martian, Pontem, etc.)
 * - EVM wallets via Reown (MetaMask, WalletConnect, Coinbase, etc.)
 */

export const SplitWalletButton: React.FC = () => {
  const [showAptosModal, setShowAptosModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { connected: aptosConnected } = useAptosWallet();
  const { isConnected: evmConnected } = useEVMAccount();

  // Get Reown AppKit modal hook
  const { open: openReownModal } = useAppKit();

  // Check if Reown is configured
  const reownProjectId = import.meta.env.VITE_REOWN_PROJECT_ID;
  const evmEnabled = !!reownProjectId;

  // Determine if any wallet is connected
  const isAnyConnected = aptosConnected || evmConnected;

  const handleAptosConnect = () => {
    setShowAptosModal(true);
    setIsDropdownOpen(false);
  };

  const handleEVMConnect = () => {
    if (evmEnabled) {
      openReownModal();
      setIsDropdownOpen(false);
    }
  };

  // If not connected, show split button
  if (!isAnyConnected) {
    return (
      <>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all font-semibold text-white shadow-lg hover:shadow-xl"
          >
            <Wallet size={18} />
            <span>Connect Wallet</span>
            <ChevronDown
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              size={16}
            />
          </button>

          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />

              {/* Dropdown Menu */}
              <div className="absolute top-full mt-2 right-0 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-800">
                  <p className="text-xs text-gray-400 font-medium">CHOOSE WALLET TYPE</p>
                </div>

                <div className="p-2">
                  {/* Aptos Wallet Option */}
                  <button
                    onClick={handleAptosConnect}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors text-left group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                      <span className="text-2xl">🟣</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">Aptos Wallet</div>
                      <div className="text-xs text-gray-400">Petra, Martian, Pontem, etc.</div>
                    </div>
                  </button>

                  {/* EVM Wallet Option */}
                  <button
                    onClick={handleEVMConnect}
                    disabled={!evmEnabled}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left group ${
                      evmEnabled
                        ? 'hover:bg-gray-800 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <span className="text-2xl">⟠</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">EVM Wallet</div>
                      <div className="text-xs text-gray-400">
                        {evmEnabled
                          ? 'MetaMask, Coinbase, WalletConnect'
                          : 'Configure Reown to enable'
                        }
                      </div>
                    </div>
                  </button>
                </div>

                {!evmEnabled && (
                  <div className="p-3 border-t border-gray-800 bg-gray-800/50">
                    <p className="text-xs text-gray-400">
                      To enable EVM wallets, add VITE_REOWN_PROJECT_ID to your .env file.
                      <br />
                      <a
                        href="https://cloud.reown.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Get Project ID →
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Aptos Wallet Modal */}
        <EnhancedWalletModal
          isOpen={showAptosModal}
          onClose={() => setShowAptosModal(false)}
          onSuccess={() => setShowAptosModal(false)}
        />
      </>
    );
  }

  // If connected, show the connected wallet info
  // For now, just use UnifiedWalletButton for connected state
  const connectedWalletType = aptosConnected ? 'Aptos' : 'EVM';

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      <span className="text-white text-sm font-medium">{connectedWalletType} Connected</span>
    </div>
  );
};
