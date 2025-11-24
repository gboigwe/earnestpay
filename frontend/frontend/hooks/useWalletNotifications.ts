import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { useNotifications, type NotificationType } from '@/contexts/NotificationContext';
import { useChain } from '@/contexts/ChainContext';

export const useWalletNotifications = () => {
  const { addNotification } = useNotifications();
  const { isAptosChain, isEVMChain } = useChain();
  
  // EVM Wallet
  const { isConnected: isEvmConnected, address: evmAddress, chain } = useAccount();
  
  // Aptos Wallet
  const { connected: isAptosConnected, account: aptosAccount } = useAptosWallet();
  
  // Detect wallet connection changes
  useEffect(() => {
    if (isEVMChain && isEvmConnected && evmAddress) {
      addNotification({
        type: 'success',
        title: 'Wallet Connected',
        message: `Connected to ${chain?.name || 'Ethereum'} with ${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`,
      });
    }
    
    if (isAptosChain && isAptosConnected && aptosAccount?.address) {
      const address = aptosAccount.address.toString();
      addNotification({
        type: 'success',
        title: 'Wallet Connected',
        message: `Connected to Aptos with ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    }
  }, [isEvmConnected, isAptosConnected, evmAddress, aptosAccount]);
  
  // Detect network changes
  useEffect(() => {
    if (isEVMChain && isEvmConnected && chain) {
      addNotification({
        type: 'info',
        title: 'Network Changed',
        message: `Switched to ${chain.name} network`,
      });
    }
  }, [chain]);
  
  // Add a method to show transaction notifications
  const notifyTransaction = (
    type: NotificationType,
    title: string,
    message: string,
    txHash?: string,
    explorerUrl?: string
  ) => {
    addNotification({
      type,
      title,
      message,
      action: txHash && explorerUrl ? {
        label: 'View on Explorer',
        onClick: () => window.open(`${explorerUrl}/tx/${txHash}`, '_blank')
      } : undefined
    });
  };
  
  // Add a method to show wallet action notifications
  const notifyWalletAction = (
    type: NotificationType,
    title: string,
    message: string
  ) => {
    addNotification({ type, title, message });
  };
  
  return {
    notifyTransaction,
    notifyWalletAction
  };
};

export default useWalletNotifications;
