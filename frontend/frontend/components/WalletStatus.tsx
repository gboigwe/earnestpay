import { useAccount, useBalance, useChainId } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { motion } from 'framer-motion';
import { Wallet, AlertCircle, CheckCircle2, Network } from 'lucide-react';
import { formatEther } from 'viem';

/**
 * Wallet status indicator component
 * Shows connection status, network, and balance
 */
export const WalletStatus = () => {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
  });

  // Get chain info
  const getChainInfo = () => {
    if (chainId === base.id) {
      return { name: 'Base', color: 'text-green-600', icon: '🟢' };
    }
    if (chainId === baseSepolia.id) {
      return { name: 'Base Sepolia', color: 'text-green-500', icon: '💚' };
    }
    return { name: 'Unknown', color: 'text-gray-400', icon: '❓' };
  };

  const chainInfo = getChainInfo();

  if (!isConnected || !address) {
    return (
      <motion.div
        className="flex items-center gap-2 px-4 py-2 bg-white border border-yellow-200 rounded-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <AlertCircle className="w-4 h-4 text-yellow-600" />
        <span className="text-sm text-gray-600">Not Connected</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-2 bg-white border border-green-200 rounded-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Connection indicator */}
      <div className="flex items-center gap-2">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </div>
        <CheckCircle2 className="w-4 h-4 text-green-400" />
      </div>

      {/* Wallet info */}
      <div className="flex items-center gap-2 border-l border-green-200 pl-3">
        <Wallet className="w-4 h-4 text-green-600" />
        <div className="flex flex-col">
          <span className="text-xs text-green-600">
            {connector?.name || 'Wallet'}
          </span>
          <span className="text-sm font-medium text-green-700">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </span>
        </div>
      </div>

      {/* Network info */}
      <div className="flex items-center gap-2 border-l border-green-200 pl-3">
        <Network className="w-4 h-4 text-green-600" />
        <div className="flex flex-col">
          <span className="text-xs text-green-600">Network</span>
          <div className="flex items-center gap-1">
            <span className="text-sm">{chainInfo.icon}</span>
            <span className={`text-sm font-medium ${chainInfo.color}`}>
              {chainInfo.name}
            </span>
          </div>
        </div>
      </div>

      {/* Balance info */}
      {balance && (
        <div className="flex items-center gap-2 border-l border-green-200 pl-3">
          <div className="flex flex-col">
            <span className="text-xs text-green-600">Balance</span>
            <span className="text-sm font-medium text-green-700">
              {parseFloat(formatEther(balance.value)).toFixed(4)} ETH
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Compact wallet status for mobile/small screens
 */
export const WalletStatusCompact = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const getChainIcon = () => {
    if (chainId === base.id) return '🟢';
    if (chainId === baseSepolia.id) return '💚';
    return '❓';
  };

  if (!isConnected || !address) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg">
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <span className="text-xs text-gray-400">Disconnected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </div>
      <span className="text-sm">{getChainIcon()}</span>
      <span className="text-xs font-medium text-green-400">
        {`${address.slice(0, 4)}...${address.slice(-4)}`}
      </span>
    </div>
  );
};
