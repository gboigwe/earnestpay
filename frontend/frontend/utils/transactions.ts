/**
 * Transaction handling utilities for Base blockchain
 * Manages transaction lifecycle, status tracking, and history
 */

import { type Address, type Hash, type TransactionReceipt } from 'viem';
import { base, baseSepolia } from 'viem/chains';

/**
 * Transaction status types
 */
export type TransactionStatus =
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'failed'
  | 'reverted';

/**
 * Transaction types
 */
export type TransactionType =
  | 'register_company'
  | 'create_employee'
  | 'update_salary'
  | 'deactivate_employee'
  | 'process_payment'
  | 'batch_payment'
  | 'configure_tax'
  | 'other';

/**
 * Transaction metadata
 */
export interface TransactionMetadata {
  type: TransactionType;
  description: string;
  fromAddress: Address;
  toAddress?: Address;
  value?: bigint;
  data?: any;
  timestamp: number;
}

/**
 * Transaction record for history
 */
export interface TransactionRecord {
  hash: Hash;
  status: TransactionStatus;
  metadata: TransactionMetadata;
  receipt?: TransactionReceipt;
  confirmations: number;
  blockNumber?: bigint;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Transaction storage key
 */
const TRANSACTION_STORAGE_KEY = 'earnestpay_transactions';
const MAX_TRANSACTION_HISTORY = 100;

/**
 * Get transaction history from local storage
 */
export function getTransactionHistory(address?: Address): TransactionRecord[] {
  try {
    const stored = localStorage.getItem(TRANSACTION_STORAGE_KEY);
    if (!stored) return [];

    const allTransactions: TransactionRecord[] = JSON.parse(stored);

    // Filter by address if provided
    if (address) {
      return allTransactions.filter(
        (tx) => tx.metadata.fromAddress.toLowerCase() === address.toLowerCase()
      );
    }

    return allTransactions;
  } catch (error) {
    console.error('Error loading transaction history:', error);
    return [];
  }
}

/**
 * Save transaction to history
 */
export function saveTransaction(transaction: TransactionRecord): void {
  try {
    const history = getTransactionHistory();

    // Check if transaction already exists
    const existingIndex = history.findIndex((tx) => tx.hash === transaction.hash);

    if (existingIndex >= 0) {
      // Update existing transaction
      history[existingIndex] = {
        ...history[existingIndex],
        ...transaction,
        updatedAt: Date.now(),
      };
    } else {
      // Add new transaction
      history.unshift({
        ...transaction,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Limit history size
    const trimmedHistory = history.slice(0, MAX_TRANSACTION_HISTORY);

    localStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
}

/**
 * Update transaction status
 */
export function updateTransactionStatus(
  hash: Hash,
  status: TransactionStatus,
  receipt?: TransactionReceipt,
  error?: string
): void {
  const history = getTransactionHistory();
  const transaction = history.find((tx) => tx.hash === hash);

  if (transaction) {
    const updated: TransactionRecord = {
      ...transaction,
      status,
      receipt,
      error,
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed,
      effectiveGasPrice: receipt?.effectiveGasPrice,
      confirmations: receipt ? 1 : 0,
      updatedAt: Date.now(),
    };

    saveTransaction(updated);
  }
}

/**
 * Clear transaction history
 */
export function clearTransactionHistory(): void {
  try {
    localStorage.removeItem(TRANSACTION_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing transaction history:', error);
  }
}

/**
 * Get transaction by hash
 */
export function getTransactionByHash(hash: Hash): TransactionRecord | null {
  const history = getTransactionHistory();
  return history.find((tx) => tx.hash === hash) || null;
}

/**
 * Get pending transactions
 */
export function getPendingTransactions(address?: Address): TransactionRecord[] {
  const history = getTransactionHistory(address);
  return history.filter(
    (tx) => tx.status === 'pending' || tx.status === 'confirming'
  );
}

/**
 * Get failed transactions
 */
export function getFailedTransactions(address?: Address): TransactionRecord[] {
  const history = getTransactionHistory(address);
  return history.filter((tx) => tx.status === 'failed' || tx.status === 'reverted');
}

/**
 * Get transaction description based on type
 */
export function getTransactionTypeDescription(type: TransactionType): string {
  const descriptions: Record<TransactionType, string> = {
    register_company: 'Company Registration',
    create_employee: 'Employee Creation',
    update_salary: 'Salary Update',
    deactivate_employee: 'Employee Deactivation',
    process_payment: 'Payment Processing',
    batch_payment: 'Batch Payment',
    configure_tax: 'Tax Configuration',
    other: 'Transaction',
  };

  return descriptions[type] || 'Transaction';
}

/**
 * Get transaction status color
 */
export function getTransactionStatusColor(status: TransactionStatus): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<
    TransactionStatus,
    { bg: string; text: string; border: string }
  > = {
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
    },
    confirming: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-300',
    },
    confirmed: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-300',
    },
    failed: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-300',
    },
    reverted: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-300',
    },
  };

  return colors[status];
}

/**
 * Get block explorer URL for transaction
 */
export function getBlockExplorerUrl(hash: Hash, chainId: number): string {
  const explorers: Record<number, string> = {
    [base.id]: 'https://basescan.org',
    [baseSepolia.id]: 'https://sepolia.basescan.org',
  };

  const baseUrl = explorers[chainId] || 'https://basescan.org';
  return `${baseUrl}/tx/${hash}`;
}

/**
 * Format transaction age
 */
export function formatTransactionAge(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

/**
 * Estimate confirmations needed
 */
export function getRequiredConfirmations(chainId: number): number {
  // Base has fast finality, so fewer confirmations needed
  if (chainId === base.id || chainId === baseSepolia.id) {
    return 1; // Base has fast finality
  }
  return 3; // Default for other chains
}

/**
 * Check if transaction is finalized
 */
export function isTransactionFinalized(
  confirmations: number,
  chainId: number
): boolean {
  return confirmations >= getRequiredConfirmations(chainId);
}
