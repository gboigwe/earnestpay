/**
 * RPC Provider Manager
 * Handles RPC endpoint selection, fallback, and health monitoring
 */

import { RpcProvider, NetworkRpcConfig } from '../config/rpc.config';

export class RpcProviderManager {
  private config: NetworkRpcConfig;
  private currentProviderIndex: number = 0;
  private providerHealth: Map<string, boolean> = new Map();
  private lastHealthCheck: Map<string, number> = new Map();

  constructor(config: NetworkRpcConfig) {
    this.config = config;
    this.initializeHealth();
  }

  private initializeHealth(): void {
    this.config.providers.forEach(provider => {
      this.providerHealth.set(provider.url, true);
      this.lastHealthCheck.set(provider.url, 0);
    });
  }

  async getActiveProvider(): Promise<string> {
    const sortedProviders = [...this.config.providers].sort((a, b) => a.priority - b.priority);
    
    for (const provider of sortedProviders) {
      if (await this.isProviderHealthy(provider)) {
        return provider.url;
      }
    }
    
    return sortedProviders[0].url;
  }

  private async isProviderHealthy(provider: RpcProvider): Promise<boolean> {
    const lastCheck = this.lastHealthCheck.get(provider.url) || 0;
    const now = Date.now();
    
    if (now - lastCheck < this.config.healthCheckInterval) {
      return this.providerHealth.get(provider.url) || false;
    }
    
    const isHealthy = await this.checkHealth(provider.url);
    this.providerHealth.set(provider.url, isHealthy);
    this.lastHealthCheck.set(provider.url, now);
    
    return isHealthy;
  }

  private async checkHealth(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) return false;
      const data = await response.json();
      return !!data.result;
    } catch {
      return false;
    }
  }

  async executeWithFallback<T>(
    operation: (rpcUrl: string) => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> {
    const sortedProviders = [...this.config.providers].sort((a, b) => a.priority - b.priority);
    let lastError: Error | null = null;

    for (const provider of sortedProviders) {
      for (let attempt = 0; attempt < Math.min(maxAttempts, provider.maxRetries); attempt++) {
        try {
          const result = await operation(provider.url);
          this.providerHealth.set(provider.url, true);
          return result;
        } catch (error) {
          lastError = error as Error;
          this.providerHealth.set(provider.url, false);
        }
      }
    }

    throw lastError || new Error('All RPC providers failed');
  }

  getProviderStats() {
    return {
      providers: this.config.providers.map(p => ({
        url: p.url,
        priority: p.priority,
        healthy: this.providerHealth.get(p.url) || false,
        lastChecked: this.lastHealthCheck.get(p.url) || 0,
      })),
    };
  }
}
