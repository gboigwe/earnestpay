/**
 * Tests for transaction utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveTransaction,
  getTransactionHistory,
  updateTransactionStatus,
  clearTransactionHistory,
  getTransactionByHash,
  getPendingTransactions,
  getFailedTransactions,
  formatTransactionAge,
  getBlockExplorerUrl,
  getTransactionStatusColor,
  getTransactionTypeDescription,
  isTransactionFinalized,
} from '../transactions';
import { MOCK_ADDRESSES, MOCK_TX_HASHES, mockLocalStorage } from '../../test/utils';
import { base, baseSepolia } from 'viem/chains';

describe('Transaction Utilities', () => {
  beforeEach(() => {
    // Reset localStorage before each test
    global.localStorage = mockLocalStorage() as any;
  });

  describe('saveTransaction', () => {
    it('saves transaction to localStorage', () => {
      const tx = {
        hash: MOCK_TX_HASHES.confirmed,
        status: 'confirmed' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'Test transaction',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: Date.now(),
        },
        confirmations: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveTransaction(tx);

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('updates existing transaction', () => {
      const tx = {
        hash: MOCK_TX_HASHES.confirmed,
        status: 'pending' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'Test',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: Date.now(),
        },
        confirmations: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveTransaction(tx);
      saveTransaction({ ...tx, status: 'confirmed' as const });

      expect(localStorage.setItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('getTransactionHistory', () => {
    it('returns empty array when no transactions', () => {
      const history = getTransactionHistory();
      expect(history).toEqual([]);
    });

    it('filters by address when provided', () => {
      const tx1 = {
        hash: MOCK_TX_HASHES.confirmed,
        status: 'confirmed' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'Test 1',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: Date.now(),
        },
        confirmations: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const tx2 = {
        hash: MOCK_TX_HASHES.pending,
        status: 'pending' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'Test 2',
          fromAddress: MOCK_ADDRESSES.user2,
          timestamp: Date.now(),
        },
        confirmations: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveTransaction(tx1);
      saveTransaction(tx2);

      const history = getTransactionHistory(MOCK_ADDRESSES.user1);
      expect(history).toHaveLength(1);
      expect(history[0].metadata.fromAddress).toBe(MOCK_ADDRESSES.user1);
    });
  });

  describe('getTransactionByHash', () => {
    it('returns null when transaction not found', () => {
      const tx = getTransactionByHash(MOCK_TX_HASHES.confirmed);
      expect(tx).toBeNull();
    });

    it('returns transaction when found', () => {
      const txData = {
        hash: MOCK_TX_HASHES.confirmed,
        status: 'confirmed' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'Test',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: Date.now(),
        },
        confirmations: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveTransaction(txData);
      const tx = getTransactionByHash(MOCK_TX_HASHES.confirmed);

      expect(tx).toBeDefined();
      expect(tx?.hash).toBe(MOCK_TX_HASHES.confirmed);
    });
  });

  describe('getPendingTransactions', () => {
    it('returns only pending transactions', () => {
      saveTransaction({
        hash: MOCK_TX_HASHES.pending,
        status: 'pending' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'Pending',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: Date.now(),
        },
        confirmations: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      saveTransaction({
        hash: MOCK_TX_HASHES.confirmed,
        status: 'confirmed' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'Confirmed',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: Date.now(),
        },
        confirmations: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const pending = getPendingTransactions();
      expect(pending).toHaveLength(1);
      expect(pending[0].status).toBe('pending');
    });
  });

  describe('formatTransactionAge', () => {
    it('formats seconds ago', () => {
      const now = Date.now();
      const result = formatTransactionAge(now - 5000); // 5 seconds ago
      expect(result).toBe('5s ago');
    });

    it('formats minutes ago', () => {
      const now = Date.now();
      const result = formatTransactionAge(now - 120000); // 2 minutes ago
      expect(result).toBe('2m ago');
    });

    it('formats hours ago', () => {
      const now = Date.now();
      const result = formatTransactionAge(now - 7200000); // 2 hours ago
      expect(result).toBe('2h ago');
    });

    it('formats days ago', () => {
      const now = Date.now();
      const result = formatTransactionAge(now - 172800000); // 2 days ago
      expect(result).toBe('2d ago');
    });
  });

  describe('getBlockExplorerUrl', () => {
    it('returns Base explorer URL for mainnet', () => {
      const url = getBlockExplorerUrl(MOCK_TX_HASHES.confirmed, base.id);
      expect(url).toContain('basescan.org');
      expect(url).toContain(MOCK_TX_HASHES.confirmed);
    });

    it('returns Base Sepolia explorer URL for testnet', () => {
      const url = getBlockExplorerUrl(MOCK_TX_HASHES.confirmed, baseSepolia.id);
      expect(url).toContain('sepolia.basescan.org');
    });
  });

  describe('getTransactionStatusColor', () => {
    it('returns green colors for confirmed', () => {
      const colors = getTransactionStatusColor('confirmed');
      expect(colors.bg).toContain('green');
      expect(colors.text).toContain('green');
    });

    it('returns red colors for failed', () => {
      const colors = getTransactionStatusColor('failed');
      expect(colors.bg).toContain('red');
      expect(colors.text).toContain('red');
    });

    it('returns yellow colors for pending', () => {
      const colors = getTransactionStatusColor('pending');
      expect(colors.bg).toContain('yellow');
      expect(colors.text).toContain('yellow');
    });
  });

  describe('getTransactionTypeDescription', () => {
    it('returns human-readable descriptions', () => {
      expect(getTransactionTypeDescription('create_employee')).toBe('Employee Creation');
      expect(getTransactionTypeDescription('process_payment')).toBe('Payment Processing');
      expect(getTransactionTypeDescription('batch_payment')).toBe('Batch Payment');
    });
  });

  describe('isTransactionFinalized', () => {
    it('returns true when confirmations meet requirement', () => {
      expect(isTransactionFinalized(1, base.id)).toBe(true);
      expect(isTransactionFinalized(2, base.id)).toBe(true);
    });

    it('returns false when confirmations below requirement', () => {
      expect(isTransactionFinalized(0, base.id)).toBe(false);
    });
  });

  describe('clearTransactionHistory', () => {
    it('clears all transactions', () => {
      saveTransaction({
        hash: MOCK_TX_HASHES.confirmed,
        status: 'confirmed' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'Test',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: Date.now(),
        },
        confirmations: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      clearTransactionHistory();

      expect(localStorage.removeItem).toHaveBeenCalled();
    });
  });
});
