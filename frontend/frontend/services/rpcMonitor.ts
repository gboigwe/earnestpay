/**
 * RPC Performance Monitor
 * Tracks RPC provider performance metrics
 */

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  lastRequestTime: number;
}

export class RpcMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private latencies: Map<string, number[]> = new Map();

  recordRequest(providerUrl: string, success: boolean, latency: number): void {
    const metrics = this.metrics.get(providerUrl) || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      lastRequestTime: 0,
    };

    metrics.totalRequests++;
    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }
    metrics.lastRequestTime = Date.now();

    const latencies = this.latencies.get(providerUrl) || [];
    latencies.push(latency);
    if (latencies.length > 100) latencies.shift();
    this.latencies.set(providerUrl, latencies);

    metrics.averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    this.metrics.set(providerUrl, metrics);
  }

  getMetrics(providerUrl: string): PerformanceMetrics | null {
    return this.metrics.get(providerUrl) || null;
  }

  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  getSuccessRate(providerUrl: string): number {
    const metrics = this.metrics.get(providerUrl);
    if (!metrics || metrics.totalRequests === 0) return 0;
    return (metrics.successfulRequests / metrics.totalRequests) * 100;
  }

  getBestProvider(): string | null {
    let bestProvider: string | null = null;
    let bestScore = -1;

    for (const [url, metrics] of this.metrics.entries()) {
      const successRate = this.getSuccessRate(url);
      const score = successRate - (metrics.averageLatency / 1000);
      
      if (score > bestScore) {
        bestScore = score;
        bestProvider = url;
      }
    }

    return bestProvider;
  }

  reset(providerUrl?: string): void {
    if (providerUrl) {
      this.metrics.delete(providerUrl);
      this.latencies.delete(providerUrl);
    } else {
      this.metrics.clear();
      this.latencies.clear();
    }
  }
}
