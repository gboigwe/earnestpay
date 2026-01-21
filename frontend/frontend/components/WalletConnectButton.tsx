import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from './ui/button';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Wallet connection button with Coinbase Wallet integration
 * Displays connection status and handles connect/disconnect
 */
export const WalletConnectButton = () => {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect();
    setShowConnectors(false);
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 rounded-lg shadow-sm">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <span className="text-sm font-medium text-green-600">
            {formatAddress(address)}
          </span>
          {connector && (
            <span className="text-xs text-green-500">
              via {connector.name}
            </span>
          )}
        </div>
        <Button
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
          className="border-red-200 hover:bg-red-50 text-red-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowConnectors(!showConnectors)}
        disabled={isPending}
        className="bg-green-600 hover:bg-green-700"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>

      <AnimatePresence>
        {showConnectors && !isConnected && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              onClick={() => setShowConnectors(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Connector dropdown */}
            <motion.div
              className="absolute top-full mt-2 right-0 w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 border-b border-gray-800">
                <p className="text-xs text-gray-400 font-medium">
                  CONNECT WALLET
                </p>
              </div>

              <div className="p-2">
                {connectors.map((connector, index) => (
                  <motion.button
                    key={connector.id}
                    onClick={() => {
                      connect({ connector });
                      setShowConnectors(false);
                    }}
                    disabled={isPending}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                      {connector.id === 'coinbaseWallet' && (
                        <span className="text-2xl">🔵</span>
                      )}
                      {connector.id === 'walletConnect' && (
                        <span className="text-2xl">🔗</span>
                      )}
                      {connector.id === 'injected' && (
                        <span className="text-2xl">🦊</span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">
                        {connector.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {connector.id === 'coinbaseWallet' && 'Recommended for Base'}
                        {connector.id === 'walletConnect' && 'Mobile wallets'}
                        {connector.id === 'injected' && 'Browser extension'}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="p-3 border-t border-gray-800 bg-gray-800/50">
                <p className="text-xs text-gray-400">
                  New to Ethereum wallets?{' '}
                  <a
                    href="https://ethereum.org/en/wallets/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Learn more
                  </a>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
