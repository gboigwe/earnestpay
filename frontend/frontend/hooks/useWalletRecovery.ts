import { useEffect, useRef, useState } from 'react';
import { useAppKitEvents } from '@reown/appkit/react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { useAccount, useReconnect } from 'wagmi';
import { useChain } from '@/contexts/ChainContext';
import { toast } from '@/components/ui/use-toast';

interface RecoveryState {
  isRecovering: boolean;
  retryCount: number;
  lastAttempt: number | null;
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 3000; // 3 seconds

/**
 * useWalletRecovery Hook
 *
 * Automatic reconnection when wallet connection drops due to network issues
 *
 * Features:
 * - Detects connection loss for both Aptos and EVM wallets
 * - Exponential backoff retry strategy (3s, 6s, 12s)
 * - Maximum 3 retry attempts
 * - User notifications for recovery attempts
 * - Separate handling for Aptos and EVM chains
 */
export const useWalletRecovery = () => {
  const { isAptosChain } = useChain();
  const [recoveryState, setRecoveryState] = useState<RecoveryState>({
    isRecovering: false,
    retryCount: 0,
    lastAttempt: null,
  });

  // EVM wallet state
  const { isConnected: evmConnected } = useAccount();
  const { reconnect: evmReconnect } = useReconnect();
  const events = useAppKitEvents();

  // Aptos wallet state
  const { connected: aptosConnected, connect: aptosConnect, wallets } = useAptosWallet();

  // Track previous connection state
  const previousConnectionRef = useRef({
    evm: evmConnected,
    aptos: aptosConnected,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wasUserDisconnectRef = useRef(false);

  // Exponential backoff calculation
  const getRetryDelay = (retryCount: number): number => {
    return INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
  };

  // Clear retry timeout
  const clearRetryTimeout = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  // EVM wallet recovery
  const recoverEVMConnection = async (retryCount: number) => {
    if (retryCount >= MAX_RETRIES) {
      setRecoveryState({ isRecovering: false, retryCount: 0, lastAttempt: Date.now() });
      toast({
        title: 'Connection Lost',
        description: 'Unable to reconnect. Please reconnect manually.',
        variant: 'destructive',
      });
      return;
    }

    setRecoveryState({ isRecovering: true, retryCount, lastAttempt: Date.now() });

    toast({
      title: 'Connection Lost',
      description: `Attempting to reconnect... (${retryCount + 1}/${MAX_RETRIES})`,
    });

    try {
      await evmReconnect();

      // Check if reconnection was successful after a short delay
      setTimeout(() => {
        if (evmConnected) {
          setRecoveryState({ isRecovering: false, retryCount: 0, lastAttempt: Date.now() });
          toast({
            title: 'Reconnected Successfully',
            description: 'Your wallet connection has been restored.',
          });
        } else {
          // Schedule next retry with exponential backoff
          const delay = getRetryDelay(retryCount);
          retryTimeoutRef.current = setTimeout(() => {
            recoverEVMConnection(retryCount + 1);
          }, delay);
        }
      }, 1000);
    } catch (error) {
      console.error('EVM reconnection failed:', error);

      // Schedule next retry with exponential backoff
      const delay = getRetryDelay(retryCount);
      retryTimeoutRef.current = setTimeout(() => {
        recoverEVMConnection(retryCount + 1);
      }, delay);
    }
  };

  // Aptos wallet recovery
  const recoverAptosConnection = async (retryCount: number) => {
    if (retryCount >= MAX_RETRIES) {
      setRecoveryState({ isRecovering: false, retryCount: 0, lastAttempt: Date.now() });
      toast({
        title: 'Connection Lost',
        description: 'Unable to reconnect. Please reconnect manually.',
        variant: 'destructive',
      });
      return;
    }

    setRecoveryState({ isRecovering: true, retryCount, lastAttempt: Date.now() });

    toast({
      title: 'Connection Lost',
      description: `Attempting to reconnect... (${retryCount + 1}/${MAX_RETRIES})`,
    });

    try {
      // Try to reconnect to the last used wallet
      const lastWallet = wallets?.[0];
      if (lastWallet) {
        await aptosConnect(lastWallet.name);

        setTimeout(() => {
          if (aptosConnected) {
            setRecoveryState({ isRecovering: false, retryCount: 0, lastAttempt: Date.now() });
            toast({
              title: 'Reconnected Successfully',
              description: 'Your wallet connection has been restored.',
            });
          } else {
            // Schedule next retry
            const delay = getRetryDelay(retryCount);
            retryTimeoutRef.current = setTimeout(() => {
              recoverAptosConnection(retryCount + 1);
            }, delay);
          }
        }, 1000);
      } else {
        throw new Error('No wallet available to reconnect');
      }
    } catch (error) {
      console.error('Aptos reconnection failed:', error);

      // Schedule next retry
      const delay = getRetryDelay(retryCount);
      retryTimeoutRef.current = setTimeout(() => {
        recoverAptosConnection(retryCount + 1);
      }, delay);
    }
  };

  // Monitor EVM connection changes
  useEffect(() => {
    const previousEVM = previousConnectionRef.current.evm;

    if (previousEVM && !evmConnected && !wasUserDisconnectRef.current && !isAptosChain) {
      // Connection was lost unexpectedly
      clearRetryTimeout();
      setTimeout(() => recoverEVMConnection(0), INITIAL_RETRY_DELAY);
    }

    previousConnectionRef.current.evm = evmConnected;
  }, [evmConnected, isAptosChain]);

  // Monitor Aptos connection changes
  useEffect(() => {
    const previousAptos = previousConnectionRef.current.aptos;

    if (previousAptos && !aptosConnected && !wasUserDisconnectRef.current && isAptosChain) {
      // Connection was lost unexpectedly
      clearRetryTimeout();
      setTimeout(() => recoverAptosConnection(0), INITIAL_RETRY_DELAY);
    }

    previousConnectionRef.current.aptos = aptosConnected;
  }, [aptosConnected, isAptosChain]);

  // Listen to AppKit events for EVM wallets
  useEffect(() => {
    if (!events?.data?.event) return;

    const { event } = events.data;

    // Track user-initiated disconnections
    if (event === 'DISCONNECT') {
      wasUserDisconnectRef.current = true;
      clearRetryTimeout();
      setRecoveryState({ isRecovering: false, retryCount: 0, lastAttempt: null });

      // Reset flag after a delay
      setTimeout(() => {
        wasUserDisconnectRef.current = false;
      }, 5000);
    }

    // Connection restored
    if (event === 'CONNECT_SUCCESS' && recoveryState.isRecovering) {
      clearRetryTimeout();
      setRecoveryState({ isRecovering: false, retryCount: 0, lastAttempt: Date.now() });
    }
  }, [events, recoveryState.isRecovering]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRetryTimeout();
    };
  }, []);

  // Manual reconnect function
  const manualReconnect = () => {
    clearRetryTimeout();
    setRecoveryState({ isRecovering: false, retryCount: 0, lastAttempt: null });

    if (isAptosChain) {
      recoverAptosConnection(0);
    } else {
      recoverEVMConnection(0);
    }
  };

  return {
    isRecovering: recoveryState.isRecovering,
    retryCount: recoveryState.retryCount,
    manualReconnect,
  };
};

export default useWalletRecovery;
