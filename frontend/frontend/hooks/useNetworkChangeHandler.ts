/**
 * Network Change Handler Hook
 * Listens and responds to network change events
 */

import { useEffect } from 'react';
import { useChainId, useAccount } from 'wagmi';
import { base } from 'wagmi/chains';
import { useChain } from '@/contexts/ChainContext';
import { toast } from '@/components/ui/use-toast';

export const useNetworkChangeHandler = () => {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { selectedChain, setSelectedChain } = useChain();

  useEffect(() => {
    if (!isConnected || !chainId) return;

    const handleNetworkChange = () => {
      let newChain: 'ethereum' | 'arbitrum' | 'base' | 'polygon' | null = null;

      switch (chainId) {
        case 1:
          newChain = 'ethereum';
          break;
        case 42161:
          newChain = 'arbitrum';
          break;
        case 8453:
          newChain = 'base';
          break;
        case 137:
          newChain = 'polygon';
          break;
      }

      if (newChain && newChain !== selectedChain) {
        setSelectedChain(newChain);
        
        toast({
          title: 'Network Changed',
          description: `Switched to ${newChain.charAt(0).toUpperCase() + newChain.slice(1)}`,
        });
      }
    };

    handleNetworkChange();
  }, [chainId, isConnected, selectedChain, setSelectedChain]);

  return {
    currentChainId: chainId,
    isOnBase: chainId === base.id,
  };
};
