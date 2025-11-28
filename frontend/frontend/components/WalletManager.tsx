import React, { useState } from 'react';
import { X, Check, LogOut, Plus, Wallet, ChevronRight, Copy, ExternalLink } from 'lucide-react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { useAccount, useDisconnect } from 'wagmi';
import { useChain } from '@/contexts/ChainContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from './ui/use-toast';
import { EnhancedWalletModal } from './EnhancedWalletModal';
import { EVMWalletModal } from './EVMWalletModal';
import { EnsDisplay } from './EnsDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import { getExplorerAccountUrl, NetworkType } from '@/config/networks';

interface WalletManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * WalletManager Component
 *
 * Comprehensive wallet management UI that allows users to:
 * - View all connected wallets (Aptos + EVM)
 * - Switch between connected wallets
 * - Disconnect individual wallets
 * - Connect new wallets
 * - Copy addresses and view on explorers
 */
export const WalletManager: React.FC<WalletManagerProps> = ({ isOpen, onClose }) => {
  const { selectedChain, isAptosChain, setSelectedChain } = useChain();
  const [showAptosModal, setShowAptosModal] = useState(false);
  const [showEVMModal, setShowEVMModal] = useState(false);

  // Aptos wallet state
  const {
    connected: aptosConnected,
    account: aptosAccount,
    disconnect: aptosDisconnect,
    wallet: aptosWallet,
  } = useAptosWallet();

  // EVM wallet state
  const { address: evmAddress, isConnected: evmConnected, connector: activeConnector } = useAccount();
  const { disconnect: evmDisconnect } = useDisconnect();

  const handleDisconnectAptos = async () => {
    try {
      await aptosDisconnect();
      toast({
        title: "Wallet Disconnected",
        description: "Aptos wallet has been disconnected",
      });
    } catch (error) {
      console.error('Error disconnecting Aptos wallet:', error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect Aptos wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectEVM = async () => {
    try {
      evmDisconnect();
      toast({
        title: "Wallet Disconnected",
        description: "EVM wallet has been disconnected",
      });
    } catch (error) {
      console.error('Error disconnecting EVM wallet:', error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect EVM wallet",
        variant: "destructive",
      });
    }
  };

  const handleSwitchToAptos = () => {
    if (aptosConnected && !isAptosChain) {
      setSelectedChain('aptos');
      toast({
        title: "Switched to Aptos",
        description: "Now using Aptos wallet",
      });
    }
  };

  const handleSwitchToEVM = (chain: string) => {
    if (evmConnected && isAptosChain) {
      setSelectedChain(chain as any);
      toast({
        title: `Switched to ${chain}`,
        description: `Now using EVM wallet on ${chain}`,
      });
    }
  };

  const handleCopyAddress = (address: string, label: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: `${label} address copied to clipboard`,
    });
  };

  const handleViewExplorer = (address: string, chain: string) => {
    window.open(getExplorerAccountUrl(chain as NetworkType, address), '_blank');
  };

  const handleConnectNewWallet = (type: 'aptos' | 'evm') => {
    if (type === 'aptos') {
      setShowAptosModal(true);
    } else {
      setShowEVMModal(true);
    }
    onClose();
  };

  if (!isOpen) return null;

  const totalConnected = (aptosConnected ? 1 : 0) + (evmConnected ? 1 : 0);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="w-full max-w-2xl bg-gray-900 border border-gray-800 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                  <div>
                    <h2 className="text-xl font-bold text-white">Wallet Manager</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {totalConnected} wallet{totalConnected !== 1 ? 's' : ''} connected
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {/* Connected Wallets Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Connected Wallets
                    </h3>

                    {totalConnected === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No wallets connected</p>
                        <p className="text-sm mt-1">Connect a wallet to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Aptos Wallet */}
                        {aptosConnected && aptosAccount && (
                          <motion.div
                            className={`p-4 rounded-lg border transition-all ${
                              isAptosChain
                                ? 'bg-purple-500/10 border-purple-500/50'
                                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-lg">
                                  <span className="text-2xl">🟣</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-semibold">
                                      {aptosWallet?.name || 'Aptos Wallet'}
                                    </span>
                                    {isAptosChain && (
                                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                        <Check className="h-3 w-3" />
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-400 break-all">
                                    <EnsDisplay
                                      address={aptosAccount.address.toString()}
                                      showAddress={true}
                                      avatarSize="xs"
                                    />
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">Aptos Network</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 ml-2">
                                {!isAptosChain && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSwitchToAptos}
                                    className="h-8 px-3 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                  >
                                    <ChevronRight className="h-3 w-3 mr-1" />
                                    Switch
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleCopyAddress(aptosAccount.address.toString(), 'Aptos')
                                  }
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                  title="Copy address"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleViewExplorer(aptosAccount.address.toString(), 'aptos')
                                  }
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                  title="View on explorer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleDisconnectAptos}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                                  title="Disconnect"
                                >
                                  <LogOut className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* EVM Wallet */}
                        {evmConnected && evmAddress && (
                          <motion.div
                            className={`p-4 rounded-lg border transition-all ${
                              !isAptosChain
                                ? 'bg-blue-500/10 border-blue-500/50'
                                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg">
                                  <span className="text-2xl">⟠</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-semibold">
                                      {activeConnector?.name || 'EVM Wallet'}
                                    </span>
                                    {!isAptosChain && (
                                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                        <Check className="h-3 w-3" />
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-400 break-all">
                                    <EnsDisplay
                                      address={evmAddress}
                                      showAddress={true}
                                      avatarSize="xs"
                                    />
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)}{' '}
                                    Network
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 ml-2">
                                {isAptosChain && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSwitchToEVM('ethereum')}
                                    className="h-8 px-3 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                  >
                                    <ChevronRight className="h-3 w-3 mr-1" />
                                    Switch
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyAddress(evmAddress, 'EVM')}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                  title="Copy address"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewExplorer(evmAddress, selectedChain)}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                  title="View on explorer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleDisconnectEVM}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                                  title="Disconnect"
                                >
                                  <LogOut className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Connect New Wallet Section */}
                  <div className="pt-4 border-t border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Connect New Wallet
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {!aptosConnected && (
                        <Button
                          variant="outline"
                          onClick={() => handleConnectNewWallet('aptos')}
                          className="h-auto p-4 flex flex-col items-center gap-2 border-gray-700 hover:border-purple-500 hover:bg-purple-500/5 transition-all group"
                        >
                          <div className="flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                            <span className="text-3xl">🟣</span>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-medium">Aptos Wallet</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Petra, Martian, Pontem
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-purple-400" />
                        </Button>
                      )}

                      {!evmConnected && (
                        <Button
                          variant="outline"
                          onClick={() => handleConnectNewWallet('evm')}
                          className="h-auto p-4 flex flex-col items-center gap-2 border-gray-700 hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                        >
                          <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <span className="text-3xl">⟠</span>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-medium">EVM Wallet</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              MetaMask, Coinbase, etc.
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-blue-400" />
                        </Button>
                      )}
                    </div>

                    {aptosConnected && evmConnected && (
                      <div className="text-center py-4 text-sm text-gray-500">
                        All wallet types connected
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="pt-4 border-t border-gray-800">
                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                      <p className="text-xs text-blue-400 leading-relaxed">
                        💡 <strong>Tip:</strong> You can connect both Aptos and EVM wallets
                        simultaneously. Switch between them using the network selector or the
                        "Switch" button above.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Wallet Connection Modals */}
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
