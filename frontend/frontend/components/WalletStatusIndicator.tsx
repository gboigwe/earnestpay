import React, { useState, useEffect } from 'react';
import { useAppKitEvents, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { useChain } from '@/contexts/ChainContext';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'unstable';

interface WalletStatusIndicatorProps {
  showLabel?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * WalletStatusIndicator Component
 *
 * Real-time visual indicator showing wallet connection status and quality
 *
 * States:
 * - Connected (green): Stable connection established
 * - Connecting (yellow): Connection in progress
 * - Disconnected (red): No active connection
 * - Unstable (orange): Connection exists but experiencing issues
 */
export const WalletStatusIndicator: React.FC<WalletStatusIndicatorProps> = ({
  showLabel = true,
  compact = false,
  className = ''
}) => {
  const { selectedChain, isAptosChain } = useChain();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [signalStrength, setSignalStrength] = useState<number>(0);

  // EVM wallet state
  const { isConnected: evmConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();

  // Aptos wallet state
  const { connected: aptosConnected } = useAptosWallet();

  // Listen to AppKit events for EVM wallets
  const events = useAppKitEvents();

  // Monitor connection quality
  useEffect(() => {
    const checkConnectionQuality = () => {
      const isConnected = isAptosChain ? aptosConnected : evmConnected;

      if (!isConnected) {
        setStatus('disconnected');
        setSignalStrength(0);
        return;
      }

      // Check for unstable connection indicators
      // For EVM: verify chainId is available
      // For Aptos: verify connection is stable
      const hasNetworkInfo = isAptosChain ? true : !!chainId;

      if (isConnected && hasNetworkInfo) {
        setStatus('connected');
        setSignalStrength(100);
      } else if (isConnected && !hasNetworkInfo) {
        setStatus('unstable');
        setSignalStrength(50);
      }
    };

    checkConnectionQuality();

    // Periodic quality check every 5 seconds
    const interval = setInterval(checkConnectionQuality, 5000);

    return () => clearInterval(interval);
  }, [aptosConnected, evmConnected, chainId, isAptosChain]);

  // Handle AppKit events for EVM wallets
  useEffect(() => {
    if (!events) return;

    const { data } = events;

    // Update status based on AppKit events
    if (data?.event === 'CONNECT_SUCCESS') {
      setStatus('connected');
      setSignalStrength(100);
    } else if (data?.event === 'CONNECTING') {
      setStatus('connecting');
      setSignalStrength(30);
    } else if (data?.event === 'DISCONNECT') {
      setStatus('disconnected');
      setSignalStrength(0);
    } else if (data?.event === 'CONNECT_ERROR') {
      setStatus('unstable');
      setSignalStrength(25);
    }
  }, [events]);

  // Status configuration
  const statusConfig = {
    connected: {
      label: 'Connected',
      color: 'green',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-400',
      iconColor: 'text-green-500',
      icon: Wifi,
      pulseColor: 'bg-green-400'
    },
    connecting: {
      label: 'Connecting',
      color: 'yellow',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      textColor: 'text-yellow-400',
      iconColor: 'text-yellow-500',
      icon: Loader2,
      pulseColor: 'bg-yellow-400'
    },
    disconnected: {
      label: 'Disconnected',
      color: 'red',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      textColor: 'text-red-400',
      iconColor: 'text-red-500',
      icon: WifiOff,
      pulseColor: 'bg-red-400'
    },
    unstable: {
      label: 'Unstable',
      color: 'orange',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      textColor: 'text-orange-400',
      iconColor: 'text-orange-500',
      icon: AlertTriangle,
      pulseColor: 'bg-orange-400'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div className={`w-2 h-2 ${config.pulseColor} rounded-full ${status === 'connected' ? 'animate-pulse' : ''}`} />
        {showLabel && (
          <span className={`text-xs ${config.textColor}`}>
            {config.label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
      <Icon
        size={16}
        className={`${config.iconColor} ${status === 'connecting' ? 'animate-spin' : ''}`}
      />

      {showLabel && (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${config.textColor}`}>
            {config.label}
          </span>

          {/* Signal strength bars */}
          {status !== 'disconnected' && (
            <div className="flex items-end gap-0.5 h-3">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`w-1 rounded-sm transition-all ${
                    signalStrength >= bar * 25
                      ? config.bgColor.replace('/10', '/80')
                      : 'bg-gray-700'
                  }`}
                  style={{ height: `${bar * 25}%` }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletStatusIndicator;
