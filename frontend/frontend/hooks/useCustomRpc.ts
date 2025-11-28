import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export type NetworkId = 'ethereum' | 'arbitrum' | 'base' | 'polygon';

export interface RpcConfig {
  networkId: NetworkId;
  networkName: string;
  defaultRpc: string;
  customRpc: string | null;
  isHealthy: boolean;
  lastChecked: number | null;
}

const STORAGE_KEY = 'custom-rpc-configs';

const DEFAULT_RPCS: Record<NetworkId, string> = {
  ethereum: 'https://eth.llamarpc.com',
  arbitrum: 'https://arbitrum.llamarpc.com',
  base: 'https://base.llamarpc.com',
  polygon: 'https://polygon.llamarpc.com',
};

const NETWORK_NAMES: Record<NetworkId, string> = {
  ethereum: 'Ethereum Mainnet',
  arbitrum: 'Arbitrum One',
  base: 'Base',
  polygon: 'Polygon',
};

/**
 * useCustomRpc Hook
 *
 * Manages custom RPC endpoint configuration
 *
 * Features:
 * - Load/save custom RPC endpoints
 * - Health check for RPC endpoints
 * - Fallback to default RPC
 * - Import/export configurations
 */
export const useCustomRpc = () => {
  const [configs, setConfigs] = useState<Record<NetworkId, RpcConfig>>(() => {
    const initialConfigs: Record<NetworkId, RpcConfig> = {
      ethereum: {
        networkId: 'ethereum',
        networkName: NETWORK_NAMES.ethereum,
        defaultRpc: DEFAULT_RPCS.ethereum,
        customRpc: null,
        isHealthy: true,
        lastChecked: null,
      },
      arbitrum: {
        networkId: 'arbitrum',
        networkName: NETWORK_NAMES.arbitrum,
        defaultRpc: DEFAULT_RPCS.arbitrum,
        customRpc: null,
        isHealthy: true,
        lastChecked: null,
      },
      base: {
        networkId: 'base',
        networkName: NETWORK_NAMES.base,
        defaultRpc: DEFAULT_RPCS.base,
        customRpc: null,
        isHealthy: true,
        lastChecked: null,
      },
      polygon: {
        networkId: 'polygon',
        networkName: NETWORK_NAMES.polygon,
        defaultRpc: DEFAULT_RPCS.polygon,
        customRpc: null,
        isHealthy: true,
        lastChecked: null,
      },
    };
    return initialConfigs;
  });

  // Load saved configurations on mount
  useEffect(() => {
    const loadConfigs = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsedConfigs = JSON.parse(saved);
          setConfigs((prev) => ({
            ...prev,
            ...parsedConfigs,
          }));
        }
      } catch (error) {
        console.error('Failed to load RPC configs:', error);
      }
    };

    loadConfigs();
  }, []);

  // Save configurations to localStorage
  const saveConfigs = useCallback((newConfigs: Record<NetworkId, RpcConfig>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfigs));
      setConfigs(newConfigs);
    } catch (error) {
      console.error('Failed to save RPC configs:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save RPC configurations',
        variant: 'destructive',
      });
    }
  }, []);

  // Test RPC endpoint health
  const testRpcEndpoint = async (rpcUrl: string): Promise<boolean> => {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      return !!data.result;
    } catch (error) {
      console.error('RPC health check failed:', error);
      return false;
    }
  };

  // Check health of a specific network's RPC
  const checkNetworkHealth = useCallback(async (networkId: NetworkId) => {
    const config = configs[networkId];
    const rpcToTest = config.customRpc || config.defaultRpc;

    const isHealthy = await testRpcEndpoint(rpcToTest);

    const updatedConfigs = {
      ...configs,
      [networkId]: {
        ...config,
        isHealthy,
        lastChecked: Date.now(),
      },
    };

    saveConfigs(updatedConfigs);

    return isHealthy;
  }, [configs, saveConfigs]);

  // Set custom RPC for a network
  const setCustomRpc = useCallback(async (networkId: NetworkId, rpcUrl: string | null) => {
    if (rpcUrl) {
      // Test the RPC before saving
      const isHealthy = await testRpcEndpoint(rpcUrl);

      if (!isHealthy) {
        toast({
          title: 'Invalid RPC',
          description: 'The RPC endpoint is not responding correctly',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'RPC Configured',
        description: `Custom RPC set for ${NETWORK_NAMES[networkId]}`,
      });
    }

    const updatedConfigs = {
      ...configs,
      [networkId]: {
        ...configs[networkId],
        customRpc: rpcUrl,
        isHealthy: rpcUrl ? true : configs[networkId].isHealthy,
        lastChecked: rpcUrl ? Date.now() : configs[networkId].lastChecked,
      },
    };

    saveConfigs(updatedConfigs);
    return true;
  }, [configs, saveConfigs]);

  // Get active RPC for a network (custom or default)
  const getActiveRpc = useCallback((networkId: NetworkId): string => {
    const config = configs[networkId];
    return config.customRpc || config.defaultRpc;
  }, [configs]);

  // Reset to default RPC
  const resetToDefault = useCallback((networkId: NetworkId) => {
    const updatedConfigs = {
      ...configs,
      [networkId]: {
        ...configs[networkId],
        customRpc: null,
        isHealthy: true,
        lastChecked: null,
      },
    };

    saveConfigs(updatedConfigs);

    toast({
      title: 'Reset to Default',
      description: `${NETWORK_NAMES[networkId]} is now using default RPC`,
    });
  }, [configs, saveConfigs]);

  // Export configurations as JSON
  const exportConfigs = useCallback(() => {
    const exportData = Object.entries(configs).reduce((acc, [key, config]) => {
      if (config.customRpc) {
        acc[key as NetworkId] = config.customRpc;
      }
      return acc;
    }, {} as Record<string, string>);

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `rpc-configs-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);

    toast({
      title: 'Configs Exported',
      description: 'RPC configurations exported successfully',
    });
  }, [configs]);

  // Import configurations from JSON
  const importConfigs = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importData = JSON.parse(text) as Record<string, string>;

      const updatedConfigs = { ...configs };

      for (const [networkId, rpcUrl] of Object.entries(importData)) {
        if (networkId in configs) {
          const isHealthy = await testRpcEndpoint(rpcUrl);

          updatedConfigs[networkId as NetworkId] = {
            ...updatedConfigs[networkId as NetworkId],
            customRpc: rpcUrl,
            isHealthy,
            lastChecked: Date.now(),
          };
        }
      }

      saveConfigs(updatedConfigs);

      toast({
        title: 'Configs Imported',
        description: 'RPC configurations imported successfully',
      });

      return true;
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to import RPC configurations',
        variant: 'destructive',
      });
      return false;
    }
  }, [configs, saveConfigs]);

  return {
    configs,
    setCustomRpc,
    getActiveRpc,
    checkNetworkHealth,
    resetToDefault,
    exportConfigs,
    importConfigs,
  };
};

export default useCustomRpc;
