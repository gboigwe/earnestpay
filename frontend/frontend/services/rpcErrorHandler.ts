/**
 * RPC Error Handler
 * Handles and categorizes RPC errors with recovery strategies
 */

export enum RpcErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface RpcError {
  type: RpcErrorType;
  message: string;
  originalError?: Error;
  retryable: boolean;
  retryAfter?: number;
}

export class RpcErrorHandler {
  static categorizeError(error: any): RpcError {
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return {
        type: RpcErrorType.TIMEOUT,
        message: 'Request timed out',
        originalError: error,
        retryable: true,
      };
    }

    if (error.message?.includes('rate limit') || error.status === 429) {
      return {
        type: RpcErrorType.RATE_LIMIT,
        message: 'Rate limit exceeded',
        originalError: error,
        retryable: true,
        retryAfter: 60000,
      };
    }

    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return {
        type: RpcErrorType.NETWORK_ERROR,
        message: 'Network connection failed',
        originalError: error,
        retryable: true,
      };
    }

    if (error.message?.includes('invalid') || error.message?.includes('parse')) {
      return {
        type: RpcErrorType.INVALID_RESPONSE,
        message: 'Invalid RPC response',
        originalError: error,
        retryable: false,
      };
    }

    return {
      type: RpcErrorType.UNKNOWN,
      message: error.message || 'Unknown RPC error',
      originalError: error,
      retryable: true,
    };
  }

  static shouldRetry(error: RpcError, attemptCount: number, maxAttempts: number): boolean {
    if (attemptCount >= maxAttempts) return false;
    return error.retryable;
  }

  static getRetryDelay(error: RpcError, attemptCount: number): number {
    if (error.retryAfter) return error.retryAfter;
    return Math.min(1000 * Math.pow(2, attemptCount), 10000);
  }

  static formatErrorMessage(error: RpcError): string {
    const messages: Record<RpcErrorType, string> = {
      [RpcErrorType.NETWORK_ERROR]: 'Network connection failed. Check your internet connection.',
      [RpcErrorType.TIMEOUT]: 'Request timed out. The RPC provider may be slow.',
      [RpcErrorType.RATE_LIMIT]: 'Rate limit exceeded. Please wait before retrying.',
      [RpcErrorType.INVALID_RESPONSE]: 'Invalid response from RPC provider.',
      [RpcErrorType.PROVIDER_ERROR]: 'RPC provider error. Trying fallback provider.',
      [RpcErrorType.UNKNOWN]: 'An unexpected error occurred.',
    };

    return messages[error.type] || error.message;
  }
}
