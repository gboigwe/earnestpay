/**
 * Base RPC Service
 * Integrated service combining provider management, rate limiting, error handling, and monitoring
 */

import { RpcProviderManager } from './rpcProvider';
import { RateLimiter } from './rateLimiter';
import { RpcErrorHandler, RpcErrorType } from './rpcErrorHandler';
import { RpcMonitor } from './rpcMonitor';
import { BASE_RPC_CONFIG } from '../config/rpc.config';

export class BaseRpcService {
  private providerManager: RpcProviderManager;
  private rateLimiter: RateLimiter;
  private monitor: RpcMonitor;

  constructor() {
    this.providerManager = new RpcProviderManager(BASE_RPC_CONFIG);
    this.rateLimiter = new RateLimiter({ maxRequests: 100, windowMs: 60000 });
    this.monitor = new RpcMonitor();
  }

  async executeRequest<T>(
    method: string,
    params: any[] = [],
    options: { maxRetries?: number } = {}
  ): Promise<T> {
    const { maxRetries = 3 } = options;

    return this.providerManager.executeWithFallback(async (rpcUrl) => {
      await this.rateLimiter.waitForSlot(rpcUrl);

      const startTime = Date.now();
      let success = false;

      try {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id: Date.now(),
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message || 'RPC error');
        }

        success = true;
        this.monitor.recordRequest(rpcUrl, true, Date.now() - startTime);
        return data.result;
      } catch (error) {
        this.monitor.recordRequest(rpcUrl, false, Date.now() - startTime);
        const rpcError = RpcErrorHandler.categorizeError(error);
        
        if (!rpcError.retryable) {
          throw new Error(RpcErrorHandler.formatErrorMessage(rpcError));
        }
        
        throw error;
      }
    }, maxRetries);
  }

  async getBlockNumber(): Promise<string> {
    return this.executeRequest('eth_blockNumber');
  }

  async getBalance(address: string): Promise<string> {
    return this.executeRequest('eth_getBalance', [address, 'latest']);
  }

  async getGasPrice(): Promise<string> {
    return this.executeRequest('eth_gasPrice');
  }

  getProviderStats() {
    return this.providerManager.getProviderStats();
  }

  getPerformanceMetrics() {
    return this.monitor.getAllMetrics();
  }

  getRateLimitStats(providerUrl: string) {
    return this.rateLimiter.getStats(providerUrl);
  }

  getBestProvider() {
    return this.monitor.getBestProvider();
  }
}

export const baseRpcService = new BaseRpcService();
