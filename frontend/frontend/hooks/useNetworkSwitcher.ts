/**
 * Network Switcher Hook
 * Handles automatic network switching with Base support
 */

import { useState, useCallback } from 'react';
import { useSwitchChain, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { useChain, ChainType } from '@/contexts/ChainContext';
import { toast } from '@/components/ui/use-toast';

export const useNetworkSwitcher = () => {
  const [isSwitching, setIsSwitching] = useState(false);
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();
  const { selectedChain, setSelectedChain } = useChain();

  const switchToBase = useCallback(async () => {
    if (!switchChain) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect an EVM wallet first',
        variant: 'destructive',
      });
      return false;
    }

    setIsSwitching(true);
    try {
      await switchChain({ chainId: base.id });
      setSelectedChain('base');
      
      toast({
        title: 'Switched to Base',
        description: 'Successfully connected to Base network',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Switch Failed',
        description: error.message || 'Failed to switch to Base network',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSwitching(false);
    }
  }, [switchChain, setSelectedChain]);

  const isOnBase = currentChainId === base.id;

  return {
    switchToBase,
    isSwitching,
    isOnBase,
    currentChainId,
  };
};
