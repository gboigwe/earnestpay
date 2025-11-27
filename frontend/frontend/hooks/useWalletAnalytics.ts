import { useEffect, useCallback, useRef } from 'react';
import { useAppKitEvents } from '@reown/appkit/react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { useAccount, useChainId } from 'wagmi';
import { useChain } from '@/contexts/ChainContext';

/**
 * Analytics Event Types
 */
export type AnalyticsEventType =
  | 'wallet_connected'
  | 'wallet_disconnected'
  | 'wallet_connection_failed'
  | 'network_switched'
  | 'transaction_initiated'
  | 'transaction_confirmed'
  | 'transaction_failed'
  | 'error_occurred'
  | 'session_started'
  | 'session_ended';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  walletType?: 'aptos' | 'evm';
  walletName?: string;
  chainId?: number | string;
  chainName?: string;
  errorType?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface WalletAnalytics {
  // Connection stats
  totalConnections: number;
  successfulConnections: number;
  failedConnections: number;
  connectionsByWallet: Record<string, number>;

  // Network stats
  networkSwitches: number;
  switchesByChain: Record<string, number>;

  // Transaction stats
  totalTransactions: number;
  confirmedTransactions: number;
  failedTransactions: number;
  transactionsByChain: Record<string, number>;

  // Error stats
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByWallet: Record<string, number>;

  // Session stats
  sessionStartTime: number;
  totalSessionDuration: number;
  eventsCount: number;

  // Events log (last 100 events)
  events: AnalyticsEvent[];
}

const ANALYTICS_STORAGE_KEY = 'earnestpay_wallet_analytics';
const MAX_EVENTS = 100;

/**
 * useWalletAnalytics Hook
 *
 * Comprehensive analytics tracking for wallet connections and usage:
 * - Tracks wallet connection success/failure rates
 * - Monitors network switching patterns
 * - Records transaction outcomes
 * - Logs errors by type and wallet
 * - Calculates session duration and activity
 *
 * Privacy: No PII is stored - only wallet types, chain IDs, and event counts
 */
export const useWalletAnalytics = () => {
  const { selectedChain } = useChain();
  const { connected: aptosConnected, wallet: aptosWallet } = useAptosWallet();
  const { address: evmAddress } = useAccount();
  const evmChainId = useChainId();

  // AppKit events (state not used but available for future expansion)
  const appKitEvents = useAppKitEvents();

  // Track previous state to detect changes
  const prevStateRef = useRef<{
    aptosConnected: boolean;
    evmAddress?: string;
    selectedChain: string;
    sessionStartTime: number;
  }>({
    aptosConnected: false,
    evmAddress: undefined,
    selectedChain,
    sessionStartTime: Date.now(),
  });

  // Load analytics from storage
  const loadAnalytics = useCallback((): WalletAnalytics => {
    try {
      const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          ...data,
          sessionStartTime: Date.now(), // Reset session start time
        };
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }

    // Return default analytics
    return {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      connectionsByWallet: {},
      networkSwitches: 0,
      switchesByChain: {},
      totalTransactions: 0,
      confirmedTransactions: 0,
      failedTransactions: 0,
      transactionsByChain: {},
      totalErrors: 0,
      errorsByType: {},
      errorsByWallet: {},
      sessionStartTime: Date.now(),
      totalSessionDuration: 0,
      eventsCount: 0,
      events: [],
    };
  }, []);

  // Save analytics to storage
  const saveAnalytics = useCallback((analytics: WalletAnalytics) => {
    try {
      // Update session duration before saving
      const now = Date.now();
      const sessionDuration = now - analytics.sessionStartTime;
      const updatedAnalytics = {
        ...analytics,
        totalSessionDuration: analytics.totalSessionDuration + sessionDuration,
        sessionStartTime: now, // Reset for next save
      };

      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updatedAnalytics));
    } catch (err) {
      console.error('Failed to save analytics:', err);
    }
  }, []);

  // Track an event
  const trackEvent = useCallback((event: Omit<AnalyticsEvent, 'timestamp'>) => {
    const analytics = loadAnalytics();

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
    };

    // Add event to log (keep last MAX_EVENTS)
    const updatedEvents = [fullEvent, ...analytics.events].slice(0, MAX_EVENTS);

    // Update analytics based on event type
    let updatedAnalytics = { ...analytics, events: updatedEvents, eventsCount: analytics.eventsCount + 1 };

    switch (event.type) {
      case 'wallet_connected':
        updatedAnalytics.totalConnections++;
        updatedAnalytics.successfulConnections++;
        if (event.walletName) {
          updatedAnalytics.connectionsByWallet[event.walletName] =
            (updatedAnalytics.connectionsByWallet[event.walletName] || 0) + 1;
        }
        break;

      case 'wallet_connection_failed':
        updatedAnalytics.totalConnections++;
        updatedAnalytics.failedConnections++;
        if (event.walletName) {
          updatedAnalytics.connectionsByWallet[event.walletName] =
            (updatedAnalytics.connectionsByWallet[event.walletName] || 0) + 1;
        }
        break;

      case 'network_switched':
        updatedAnalytics.networkSwitches++;
        if (event.chainName) {
          updatedAnalytics.switchesByChain[event.chainName] =
            (updatedAnalytics.switchesByChain[event.chainName] || 0) + 1;
        }
        break;

      case 'transaction_initiated':
        updatedAnalytics.totalTransactions++;
        if (event.chainName) {
          updatedAnalytics.transactionsByChain[event.chainName] =
            (updatedAnalytics.transactionsByChain[event.chainName] || 0) + 1;
        }
        break;

      case 'transaction_confirmed':
        updatedAnalytics.confirmedTransactions++;
        break;

      case 'transaction_failed':
        updatedAnalytics.failedTransactions++;
        break;

      case 'error_occurred':
        updatedAnalytics.totalErrors++;
        if (event.errorType) {
          updatedAnalytics.errorsByType[event.errorType] =
            (updatedAnalytics.errorsByType[event.errorType] || 0) + 1;
        }
        if (event.walletName) {
          updatedAnalytics.errorsByWallet[event.walletName] =
            (updatedAnalytics.errorsByWallet[event.walletName] || 0) + 1;
        }
        break;
    }

    saveAnalytics(updatedAnalytics);
  }, [loadAnalytics, saveAnalytics]);

  // Track Aptos wallet connections
  useEffect(() => {
    const prevConnected = prevStateRef.current.aptosConnected;

    if (aptosConnected && !prevConnected) {
      trackEvent({
        type: 'wallet_connected',
        walletType: 'aptos',
        walletName: aptosWallet?.name || 'Unknown Aptos Wallet',
        chainName: 'aptos',
      });
    } else if (!aptosConnected && prevConnected) {
      trackEvent({
        type: 'wallet_disconnected',
        walletType: 'aptos',
        walletName: aptosWallet?.name || 'Unknown Aptos Wallet',
        chainName: 'aptos',
      });
    }

    prevStateRef.current.aptosConnected = aptosConnected;
  }, [aptosConnected, aptosWallet?.name, trackEvent]);

  // Track EVM wallet connections
  useEffect(() => {
    const prevAddress = prevStateRef.current.evmAddress;

    if (evmAddress && !prevAddress) {
      trackEvent({
        type: 'wallet_connected',
        walletType: 'evm',
        walletName: 'EVM Wallet',
        chainId: evmChainId,
        chainName: selectedChain,
      });
    } else if (!evmAddress && prevAddress) {
      trackEvent({
        type: 'wallet_disconnected',
        walletType: 'evm',
        walletName: 'EVM Wallet',
        chainId: evmChainId,
        chainName: selectedChain,
      });
    }

    prevStateRef.current.evmAddress = evmAddress;
  }, [evmAddress, evmChainId, selectedChain, trackEvent]);

  // Track network switches
  useEffect(() => {
    const prevChain = prevStateRef.current.selectedChain;

    if (selectedChain !== prevChain && prevChain) {
      trackEvent({
        type: 'network_switched',
        chainName: selectedChain,
        metadata: {
          fromChain: prevChain,
          toChain: selectedChain,
        },
      });
    }

    prevStateRef.current.selectedChain = selectedChain;
  }, [selectedChain, trackEvent]);

  // Track AppKit events
  useEffect(() => {
    if (!appKitEvents) return;

    // Note: AppKit events API may vary - adjust based on actual implementation
    // This is a placeholder for future AppKit event tracking
    // When AppKit provides event listeners, they can be added here:
    //
    // const handleAppKitEvent = (event: any) => {
    //   if (event.type === 'CONNECT_SUCCESS') {
    //     trackEvent({ type: 'wallet_connected', walletType: 'evm', ... });
    //   } else if (event.type === 'CONNECT_ERROR') {
    //     trackEvent({ type: 'wallet_connection_failed', walletType: 'evm', ... });
    //   }
    // };
    //
    // appKitEvents.on('*', handleAppKitEvent);
    // return () => appKitEvents.off('*', handleAppKitEvent);

  }, [appKitEvents, trackEvent]);

  // Track session start
  useEffect(() => {
    trackEvent({
      type: 'session_started',
      metadata: {
        timestamp: Date.now(),
      },
    });

    // Track session end on unmount
    return () => {
      trackEvent({
        type: 'session_ended',
        metadata: {
          timestamp: Date.now(),
          duration: Date.now() - prevStateRef.current.sessionStartTime,
        },
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Public API for manual event tracking
  const trackTransaction = useCallback((status: 'initiated' | 'confirmed' | 'failed', metadata?: Record<string, any>) => {
    const eventType = status === 'initiated'
      ? 'transaction_initiated'
      : status === 'confirmed'
      ? 'transaction_confirmed'
      : 'transaction_failed';

    trackEvent({
      type: eventType,
      chainName: selectedChain,
      walletType: selectedChain === 'aptos' ? 'aptos' : 'evm',
      metadata,
    });
  }, [selectedChain, trackEvent]);

  const trackError = useCallback((errorType: string, errorMessage?: string, walletName?: string) => {
    trackEvent({
      type: 'error_occurred',
      errorType,
      errorMessage,
      walletName,
      chainName: selectedChain,
    });
  }, [selectedChain, trackEvent]);

  const getAnalytics = useCallback((): WalletAnalytics => {
    return loadAnalytics();
  }, [loadAnalytics]);

  const clearAnalytics = useCallback(() => {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  }, []);

  const exportAnalytics = useCallback(() => {
    const analytics = getAnalytics();
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wallet-analytics-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [getAnalytics]);

  return {
    trackTransaction,
    trackError,
    trackEvent,
    getAnalytics,
    clearAnalytics,
    exportAnalytics,
  };
};

export default useWalletAnalytics;
