import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface NetworkGuardProps {
  children: React.ReactNode;
  requireMainnet?: boolean;
}

/**
 * Network guard component
 * Ensures users are connected to Base or Base Sepolia
 * Shows prompt to switch networks if on wrong chain
 */
export const NetworkGuard = ({ children, requireMainnet = false }: NetworkGuardProps) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  // If not connected, show children (wallet connect prompt will handle)
  if (!isConnected) {
    return <>{children}</>;
  }

  // Check if on correct network
  const isOnBase = chainId === base.id;
  const isOnBaseSepolia = chainId === baseSepolia.id;
  const isOnCorrectNetwork = requireMainnet ? isOnBase : (isOnBase || isOnBaseSepolia);

  // If on correct network, show children
  if (isOnCorrectNetwork) {
    return <>{children}</>;
  }

  // Show network switch prompt
  const targetChain = requireMainnet ? base : baseSepolia;
  const targetChainName = requireMainnet ? 'Base' : 'Base Sepolia';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full bg-white border border-yellow-300 rounded-xl p-6 shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-700">Wrong Network</h2>
            <p className="text-sm text-gray-600">Network switch required</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 mb-2">
              You're currently connected to an unsupported network.
            </p>
            <p className="text-sm text-green-600">
              Please switch to <span className="text-green-700 font-semibold">{targetChainName}</span> to use this application.
            </p>
          </div>

          <Button
            onClick={() => switchChain({ chainId: targetChain.id })}
            disabled={isPending}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Switching Network...
              </>
            ) : (
              <>
                Switch to {targetChainName}
              </>
            )}
          </Button>

          <div className="pt-4 border-t border-green-100">
            <p className="text-xs text-green-600">
              Having trouble switching networks?{' '}
              <a
                href="https://docs.base.org/using-base"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:underline font-medium"
              >
                Learn how to add Base to your wallet
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Inline network warning (less intrusive)
 */
export const NetworkWarning = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) return null;

  const isOnBase = chainId === base.id;
  const isOnBaseSepolia = chainId === baseSepolia.id;

  if (isOnBase || isOnBaseSepolia) return null;

  return (
    <motion.div
      className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-700 mb-1">
            Wrong Network
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            You're on an unsupported network. Switch to Base or Base Sepolia to continue.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => switchChain({ chainId: base.id })}
              disabled={isPending}
              size="sm"
              variant="outline"
              className="border-green-300 hover:bg-green-50 text-green-700"
            >
              {isPending ? 'Switching...' : 'Switch to Base'}
            </Button>
            <Button
              onClick={() => switchChain({ chainId: baseSepolia.id })}
              disabled={isPending}
              size="sm"
              variant="outline"
              className="border-green-300 hover:bg-green-50 text-green-700"
            >
              {isPending ? 'Switching...' : 'Switch to Base Sepolia'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
