import { useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface WalletEventHandlers {
  onConnect?: (data: any) => void;
  onDisconnect?: () => void;
  onNetworkChange?: (network: any) => void;
  onAccountChange?: (account: string) => void;
  onError?: (error: Error) => void;
}

export function useWalletEvents({
  onConnect,
  onDisconnect,
  onNetworkChange,
  onAccountChange,
}: Partial<WalletEventHandlers> = {}) {
  const navigate = useNavigate();
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();

  // Monitor connection status
  useEffect(() => {
    if (isConnected && address) {
      console.log('Wallet connected:', address);
      toast({
        title: 'Wallet Connected',
        description: 'Your wallet has been connected successfully.',
        variant: 'default',
      });
      onConnect?.({ address, chainId });
      navigate('/dashboard');
    } else if (!isConnected) {
      console.log('Wallet disconnected');
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected.',
        variant: 'default',
      });
      onDisconnect?.();
      navigate('/');
    }
  }, [isConnected, address]);

  // Monitor network changes
  useEffect(() => {
    if (chainId) {
      console.log('Network changed:', chainId);
      toast({
        title: 'Network Changed',
        description: `Connected to chain ${chainId}`,
      });
      onNetworkChange?.({ chainId });
    }
  }, [chainId]);

  // Monitor account changes
  useEffect(() => {
    if (address) {
      console.log('Account changed:', address);
      toast({
        title: 'Account Changed',
        description: 'Wallet account has been changed',
      });
      onAccountChange?.(address);
    }
  }, [address]);
}
