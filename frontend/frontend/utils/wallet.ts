/**
 * Wallet connection utilities
 */

/**
 * Default timeout for wallet connection attempts (30 seconds)
 */
export const DEFAULT_CONNECTION_TIMEOUT = 30000;

/**
 * Timeout error class
 */
export class ConnectionTimeoutError extends Error {
  constructor(message: string = 'Wallet connection timed out') {
    super(message);
    this.name = 'ConnectionTimeoutError';
  }
}

/**
 * Wrap a promise with a timeout
 *
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Custom error message for timeout
 * @returns Promise that rejects if timeout is reached
 *
 * @example
 * ```ts
 * const result = await withTimeout(
 *   connectWallet(),
 *   30000,
 *   'Connection timed out after 30 seconds'
 * );
 * ```
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_CONNECTION_TIMEOUT,
  errorMessage?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new ConnectionTimeoutError(errorMessage)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Check if an error is a timeout error
 */
export function isTimeoutError(error: any): boolean {
  return error instanceof ConnectionTimeoutError ||
    error?.name === 'ConnectionTimeoutError' ||
    error?.message?.toLowerCase().includes('timeout') ||
    error?.message?.toLowerCase().includes('timed out');
}

/**
 * Check if an error is a user rejection
 */
export function isUserRejection(error: any): boolean {
  return error?.message?.toLowerCase().includes('user rejected') ||
    error?.message?.toLowerCase().includes('user denied') ||
    error?.message?.toLowerCase().includes('user cancelled') ||
    error?.code === 4001 || // EIP-1193 user rejection code
    error?.code === 'ACTION_REJECTED';
}

/**
 * Get a user-friendly error message for wallet connection errors
 */
export function getWalletErrorMessage(error: any): string {
  if (isUserRejection(error)) {
    return 'Connection cancelled by user';
  }

  if (isTimeoutError(error)) {
    return 'Connection timed out. Please try again or check if your wallet is unlocked.';
  }

  if (error?.message?.includes('No provider')) {
    return 'Wallet not found. Please install a wallet extension.';
  }

  if (error?.message?.includes('Network')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Return original error message or generic fallback
  return error?.message || 'Failed to connect wallet. Please try again.';
}

/**
 * Retry a connection attempt with exponential backoff
 *
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise that resolves with the result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on user rejection
      if (isUserRejection(error)) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait with exponential backoff before retrying
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
