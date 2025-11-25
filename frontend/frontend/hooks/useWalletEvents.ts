import { useEffect } from 'react';
import { useAppKitEvents } from '@reown/appkit/react';
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
  onError,
}: Partial<WalletEventHandlers> = {}) {
  const navigate = useNavigate();

  useAppKitEvents((event) => {
    try {
      switch (event.type) {
        case 'MODAL_OPEN':
          console.log('Wallet connection modal opened');
          break;
          
        case 'MODAL_CLOSE':
          console.log('Wallet connection modal closed');
          break;
          
        case 'CONNECT_SUCCESS':
          console.log('Wallet connected successfully', event);
          toast({
            title: 'Wallet Connected',
            description: 'Your wallet has been connected successfully.',
            variant: 'default',
          });
          onConnect?.(event);
          // Optionally redirect after successful connection
          navigate('/dashboard');
          break;
          
        case 'CONNECT_ERROR':
          console.error('Wallet connection error:', event.error);
          toast({
            title: 'Connection Error',
            description: event.error?.message || 'Failed to connect wallet',
            variant: 'destructive',
          });
          onError?.(event.error);
          break;
          
        case 'DISCONNECT':
          console.log('Wallet disconnected');
          toast({
            title: 'Wallet Disconnected',
            description: 'Your wallet has been disconnected.',
            variant: 'default',
          });
          onDisconnect?.();
          // Optionally redirect after disconnection
          navigate('/');
          break;
          
        case 'NETWORK_CHANGE':
          console.log('Network changed:', event.network);
          toast({
            title: 'Network Changed',
            description: `Connected to ${event.network?.name || 'unknown network'}`,
          });
          onNetworkChange?.(event.network);
          break;
          
        case 'ACCOUNT_CHANGE':
          console.log('Account changed:', event.account);
          toast({
            title: 'Account Changed',
            description: 'Wallet account has been changed',
          });
          onAccountChange?.(event.account);
          break;
          
        default:
          console.log('Unhandled wallet event:', event);
      }
    } catch (error) {
      console.error('Error handling wallet event:', error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  });

  // Cleanup function
  useEffect(() => {
    return () => {
      // Any cleanup logic if needed
    };
  }, []);
}
