/**
 * Rate Limiter for RPC Requests
 * Prevents excessive requests to RPC providers
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }) {
    this.config = config;
  }

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    const validRequests = requests.filter(
      timestamp => now - timestamp < this.config.windowMs
    );
    
    if (validRequests.length >= this.config.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  async waitForSlot(key: string): Promise<void> {
    while (!(await this.checkLimit(key))) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  reset(key: string): void {
    this.requests.delete(key);
  }

  getStats(key: string) {
    const requests = this.requests.get(key) || [];
    const now = Date.now();
    const validRequests = requests.filter(
      timestamp => now - timestamp < this.config.windowMs
    );
    
    return {
      current: validRequests.length,
      max: this.config.maxRequests,
      remaining: this.config.maxRequests - validRequests.length,
    };
  }
}
