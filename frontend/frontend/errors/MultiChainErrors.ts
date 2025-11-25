import { ChainType } from '@/contexts/ChainContext';

/**
 * Base error class for multi-chain operations
 */
export class MultiChainError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public recoveryAction?: string
  ) {
    super(message);
    this.name = 'MultiChainError';
  }
}

/**
 * Wallet connection errors
 */
export class WalletConnectionError extends MultiChainError {
  constructor(
    message: string,
    userMessage: string,
    public chain: ChainType,
    recoveryAction?: string
  ) {
    super(message, userMessage, recoveryAction);
    this.name = 'WalletConnectionError';
  }
}

/**
 * Network switching errors
 */
export class NetworkSwitchError extends MultiChainError {
  constructor(
    message: string,
    userMessage: string,
    public fromChain: ChainType,
    public toChain: ChainType,
    recoveryAction?: string
  ) {
    super(message, userMessage, recoveryAction);
    this.name = 'NetworkSwitchError';
  }
}

/**
 * Transaction errors
 */
export class TransactionError extends MultiChainError {
  constructor(
    message: string,
    userMessage: string,
    public chain: ChainType,
    public transactionHash?: string,
    recoveryAction?: string
  ) {
    super(message, userMessage, recoveryAction);
    this.name = 'TransactionError';
  }
}

/**
 * Insufficient balance errors
 */
export class InsufficientBalanceError extends MultiChainError {
  constructor(
    message: string,
    userMessage: string,
    public chain: ChainType,
    public required: string,
    public available: string,
    public token: string
  ) {
    super(message, userMessage, 'Add Funds');
    this.name = 'InsufficientBalanceError';
  }
}

/**
 * Wallet not found/installed errors
 */
export class WalletNotFoundError extends WalletConnectionError {
  constructor(
    walletName: string,
    chain: ChainType
  ) {
    const message = `${walletName} wallet not found`;
    const userMessage = `${walletName} not detected. Please install ${walletName} to continue.`;
    super(message, userMessage, chain, 'Install Wallet');
    this.name = 'WalletNotFoundError';
  }
}

/**
 * User rejected operation errors
 */
export class UserRejectedError extends MultiChainError {
  constructor(
    operation: string,
    _chain?: ChainType
  ) {
    const message = `User rejected ${operation}`;
    const userMessage = `Operation cancelled. No changes were made.`;
    super(message, userMessage, 'Try Again');
    this.name = 'UserRejectedError';
  }
}

/**
 * Network/RPC errors
 */
export class NetworkError extends MultiChainError {
  constructor(
    message: string,
    public chain: ChainType,
    public code?: number
  ) {
    const userMessage = 'Network connection issue. Please check your internet and try again.';
    super(message, userMessage, 'Retry');
    this.name = 'NetworkError';
  }
}

/**
 * Unsupported operation errors
 */
export class UnsupportedOperationError extends MultiChainError {
  constructor(
    operation: string,
    chain: ChainType
  ) {
    const message = `${operation} not supported on ${chain}`;
    const userMessage = `This feature is not available on ${chain} network yet.`;
    super(message, userMessage);
    this.name = 'UnsupportedOperationError';
  }
}

/**
 * Error message templates
 */
export const ERROR_MESSAGES = {
  // Wallet Connection
  WALLET_NOT_INSTALLED: (wallet: string) =>
    `${wallet} not found. Please install the ${wallet} extension.`,

  USER_REJECTED_CONNECTION: 'Connection cancelled. Please approve in your wallet.',

  ALREADY_CONNECTED: (wallet: string) =>
    `Already connected to ${wallet}.`,

  WALLET_LOCKED: 'Wallet is locked. Please unlock your wallet and try again.',

  // Network Switching
  NETWORK_NOT_ADDED: (network: string) =>
    `${network} network not in wallet. Please add ${network} to your wallet.`,

  SWITCH_REJECTED: 'Network switch cancelled.',

  UNSUPPORTED_NETWORK: (network: string) =>
    `${network} network is not supported yet.`,

  WRONG_NETWORK: (expected: string, current: string) =>
    `Please switch from ${current} to ${expected} network.`,

  // Transactions
  INSUFFICIENT_GAS: (token: string, amount?: string) =>
    amount
      ? `Not enough ${token} for gas fees. Need ~${amount}.`
      : `Not enough ${token} for gas fees.`,

  TRANSACTION_REJECTED: 'Transaction cancelled in wallet. No funds were deducted.',

  TRANSACTION_FAILED: (reason?: string) =>
    reason
      ? `Transaction failed: ${reason}`
      : 'Transaction failed. Please try again.',

  RPC_ERROR: 'Network connection issue. Please try again.',

  SLOW_NETWORK: (estimatedTime?: string) =>
    estimatedTime
      ? `Network is busy. Estimated wait: ${estimatedTime}.`
      : 'Network is busy. This may take longer than usual.',

  // General
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',

  TIMEOUT_ERROR: 'Operation timed out. Please try again.',

  INVALID_ADDRESS: 'Invalid wallet address format.',

  CHAIN_MISMATCH: (expected: string, actual: string) =>
    `Please connect to ${expected} (currently on ${actual}).`,
};

/**
 * Parse common error messages and return user-friendly versions
 */
export function parseErrorMessage(error: unknown, chain?: ChainType): {
  title: string;
  message: string;
  recoveryAction?: string;
} {
  // Handle our custom errors
  if (error instanceof MultiChainError) {
    return {
      title: error.name.replace(/Error$/, ''),
      message: error.userMessage,
      recoveryAction: error.recoveryAction,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // User rejected
    if (errorMessage.includes('user rejected') ||
        errorMessage.includes('user denied') ||
        errorMessage.includes('rejected by user')) {
      return {
        title: 'Cancelled',
        message: ERROR_MESSAGES.USER_REJECTED_CONNECTION,
        recoveryAction: 'Try Again',
      };
    }

    // Wallet not found
    if (errorMessage.includes('not installed') ||
        errorMessage.includes('no provider')) {
      const walletName = chain === 'aptos' ? 'Petra' : 'MetaMask';
      return {
        title: 'Wallet Not Found',
        message: ERROR_MESSAGES.WALLET_NOT_INSTALLED(walletName),
        recoveryAction: 'Install Wallet',
      };
    }

    // Network errors
    if (errorMessage.includes('network') ||
        errorMessage.includes('rpc') ||
        errorMessage.includes('connection')) {
      return {
        title: 'Network Error',
        message: ERROR_MESSAGES.RPC_ERROR,
        recoveryAction: 'Retry',
      };
    }

    // Insufficient balance
    if (errorMessage.includes('insufficient') ||
        errorMessage.includes('balance')) {
      return {
        title: 'Insufficient Balance',
        message: ERROR_MESSAGES.INSUFFICIENT_GAS(chain === 'aptos' ? 'APT' : 'ETH'),
        recoveryAction: 'Add Funds',
      };
    }

    // Timeout
    if (errorMessage.includes('timeout')) {
      return {
        title: 'Timeout',
        message: ERROR_MESSAGES.TIMEOUT_ERROR,
        recoveryAction: 'Retry',
      };
    }

    // Network not added (MetaMask specific - error code 4902)
    if ((error as any).code === 4902) {
      return {
        title: 'Network Not Added',
        message: ERROR_MESSAGES.NETWORK_NOT_ADDED(chain || 'this'),
        recoveryAction: 'Add Network',
      };
    }

    // Return the error message as-is if we can't parse it
    return {
      title: 'Error',
      message: error.message,
      recoveryAction: 'Try Again',
    };
  }

  // Unknown error type
  return {
    title: 'Unknown Error',
    message: ERROR_MESSAGES.UNKNOWN_ERROR,
    recoveryAction: 'Retry',
  };
}

/**
 * Log errors for debugging without exposing sensitive info
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : '[MultiChain]';

  console.error(`${prefix} ${timestamp}:`, error);

  // In production, you could send to error tracking service
  // like Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error);
  }
}
