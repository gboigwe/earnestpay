import React, { useState, useEffect } from 'react';
import { Wallet, Copy, ExternalLink, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { useAccount as useEVMAccount, useDisconnect, useConnect } from 'wagmi';
import { useChain } from '@/contexts/ChainContext';
import { EnhancedWalletModal } from './EnhancedWalletModal';
import { EVMWalletModal } from './EVMWalletModal';
import { toast } from './ui/use-toast';
import { reconnect } from '@wagmi/core';

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * UnifiedWalletButton Component
 *
 * Smart wallet connection button that:
 * - Detects selected chain (Aptos or EVM)
 * - Shows appropriate wallet modal
 * - Displays connected wallet address
 * - Supports simultaneous Aptos + EVM connections
 * - Provides disconnect and copy address functionality
 */

const truncateAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

const getExplorerUrl = (address: string, chain: string): string => {
  switch (chain) {
    case 'aptos':
      return `https://explorer.aptoslabs.com/account/${address}?network=testnet`;
    case 'ethereum':
      return `https://etherscan.io/address/${address}`;
    case 'arbitrum':
      return `https://arbiscan.io/address/${address}`;
    case 'base':
      return `https://basescan.org/address/${address}`;
    case 'polygon':
      return `https://polygonscan.com/address/${address}`;
    default:
      return '#';
  }
};

export const UnifiedWalletButton: React.FC = () => {
  const { selectedChain, isAptosChain, isEVMChain } = useChain();
  const [isLoading, setIsLoading] = useState(true);
  const { connect, connectors } = useConnect();

  // Aptos wallet state
  const { connected: aptosConnected, account: aptosAccount, disconnect: aptosDisconnect } = useAptosWallet();

  // EVM wallet state
  const { address: evmAddress, isConnected: evmConnected } = useEVMAccount();
  const { disconnect: evmDisconnect } = useDisconnect();

  // Handle session restoration on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (!isBrowser) return;
      
      try {
        const storedSession = localStorage.getItem('walletconnect');
        if (storedSession && !evmConnected) {
          const session = JSON.parse(storedSession);
          const walletConnectConnector = connectors.find(
            (c) => c.id === 'walletConnect' || c.name === 'WalletConnect'
          );
          
          if (walletConnectConnector) {
            await reconnect();
          } else {
            // Clear invalid session if connector not found
            localStorage.removeItem('walletconnect');
          }
        }
      } catch (error) {
        console.error('Failed to restore WalletConnect session:', error);
        // Clear corrupted session
        localStorage.removeItem('walletconnect');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [connect, evmConnected, connectors]);

  // Show loading state while restoring session
  if (isLoading) {
    return (
      <button className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Restoring session...
      </button>
    );
  }
  const { disconnect: evmDisconnect } = useDisconnect();

  // Modal states
  const [showAptosModal, setShowAptosModal] = useState(false);
  const [showEVMModal, setShowEVMModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Determine which wallet is connected for the current chain
  const isConnectedToCurrentChain = isAptosChain ? aptosConnected : evmConnected;
  const currentAddress = isAptosChain ? aptosAccount?.address?.toString() : evmAddress;

  // Check if connected to both chains
  const isBothConnected = aptosConnected && evmConnected;

  const handleConnect = () => {
    if (isAptosChain) {
      setShowAptosModal(true);
    } else if (isEVMChain) {
      setShowEVMModal(true);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (isAptosChain && aptosConnected) {
        await aptosDisconnect();
        toast({
          title: "Wallet Disconnected",
          description: "Aptos wallet has been disconnected",
        });
      } else if (isEVMChain && evmConnected) {
        evmDisconnect();
        toast({
          title: "Wallet Disconnected",
          description: "EVM wallet has been disconnected",
        });
      }
      setShowDropdown(false);
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Disconnect Error",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  const handleCopyAddress = () => {
    if (currentAddress) {
      navigator.clipboard.writeText(currentAddress);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setShowDropdown(false);
    }
  };

  const handleViewExplorer = () => {
    if (currentAddress) {
      window.open(getExplorerUrl(currentAddress, selectedChain), '_blank');
      setShowDropdown(false);
    }
  };

  // Disconnected state - show "Connect Wallet" button
  if (!isConnectedToCurrentChain) {
    return (
      <>
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all font-semibold text-white shadow-lg hover:shadow-xl"
        >
          <Wallet size={18} />
          <span>Connect Wallet</span>
        </button>

        <EnhancedWalletModal
          isOpen={showAptosModal}
          onClose={() => setShowAptosModal(false)}
          onSuccess={() => setShowAptosModal(false)}
        />

        <EVMWalletModal
          isOpen={showEVMModal}
          onClose={() => setShowEVMModal(false)}
          onSuccess={() => setShowEVMModal(false)}
        />
      </>
    );
  }

  // Connected state - show wallet address with dropdown
  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-white"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="font-mono text-sm">{truncateAddress(currentAddress || '')}</span>
          <ChevronDown
            className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            size={16}
          />
        </button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown Menu */}
            <div className="absolute top-full mt-2 right-0 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
              {/* Current Chain Connection */}
              <div className="p-3 border-b border-gray-800 bg-gray-800/50">
                <div className="text-xs text-gray-400 mb-1">
                  {isAptosChain ? 'Aptos Network' : `${selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)} Network`}
                </div>
                <div className="font-mono text-sm text-white break-all">
                  {currentAddress}
                </div>
              </div>

              {/* Multi-Chain Status */}
              {isBothConnected && (
                <div className="p-3 border-b border-gray-800 bg-blue-500/10">
                  <div className="flex items-center gap-2 text-xs text-blue-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span>Connected to both Aptos & EVM chains</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {aptosConnected && (
                      <div className="text-xs text-gray-400">
                        Aptos: {truncateAddress(aptosAccount?.address?.toString() || '', 6)}
                      </div>
                    )}
                    {evmConnected && (
                      <div className="text-xs text-gray-400">
                        EVM: {truncateAddress(evmAddress || '', 6)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={handleCopyAddress}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-left"
                >
                  <Copy size={16} className="text-gray-400" />
                  <span className="text-white text-sm">Copy Address</span>
                </button>

                <button
                  onClick={handleViewExplorer}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-left"
                >
                  <ExternalLink size={16} className="text-gray-400" />
                  <span className="text-white text-sm">View on Explorer</span>
                </button>

                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors text-left group"
                >
                  <LogOut size={16} className="text-gray-400 group-hover:text-red-400" />
                  <span className="text-white text-sm group-hover:text-red-400">
                    Disconnect {isAptosChain ? 'Aptos' : 'EVM'} Wallet
                  </span>
                </button>
              </div>

              {/* Connect to Other Chain */}
              {!isBothConnected && (
                <div className="p-3 border-t border-gray-800">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      if (isAptosChain && !evmConnected) {
                        setShowEVMModal(true);
                      } else if (isEVMChain && !aptosConnected) {
                        setShowAptosModal(true);
                      }
                    }}
                    className="w-full text-xs text-blue-400 hover:text-blue-300 transition-colors text-left"
                  >
                    + Connect to {isAptosChain ? 'EVM' : 'Aptos'} chain
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <EnhancedWalletModal
        isOpen={showAptosModal}
        onClose={() => setShowAptosModal(false)}
        onSuccess={() => setShowAptosModal(false)}
      />

      <EVMWalletModal
        isOpen={showEVMModal}
        onClose={() => setShowEVMModal(false)}
        onSuccess={() => setShowEVMModal(false)}
      />
    </>
  );
};
