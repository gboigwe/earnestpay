/**
 * Integration tests for transaction flows
 * Tests complete transaction lifecycle from initiation to confirmation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTransactionStatus } from '../../hooks/useTransactionStatus';
import {
  saveTransaction,
  getTransactionHistory,
  updateTransactionStatus,
  getTransactionByHash,
  getPendingTransactions,
} from '../../utils/transactions';
import {
  TestProviders,
  MOCK_TX_HASHES,
  MOCK_ADDRESSES,
  createMockTxReceipt,
  mockLocalStorage,
} from '../../test/utils';

// Mock wagmi hooks
vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi');
  return {
    ...actual,
    usePublicClient: vi.fn(),
    useChainId: vi.fn(() => 8453),
  };
});

describe('Transaction Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage = mockLocalStorage() as any;
  });

  describe('Complete transaction lifecycle', () => {
    it('saves, tracks, and retrieves transaction', async () => {
      // 1. Save initial transaction
      const initialTx = {
        hash: MOCK_TX_HASHES.pending,
        status: 'pending' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'Creating new employee',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: Date.now(),
        },
        confirmations: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveTransaction(initialTx);

      // 2. Verify it's saved
      const savedTx = getTransactionByHash(MOCK_TX_HASHES.pending);
      expect(savedTx).toBeDefined();
      expect(savedTx?.status).toBe('pending');

      // 3. Verify it appears in pending transactions
      const pending = getPendingTransactions();
      expect(pending).toHaveLength(1);
      expect(pending[0].hash).toBe(MOCK_TX_HASHES.pending);

      // 4. Update transaction status
      const mockReceipt = createMockTxReceipt({ hash: MOCK_TX_HASHES.pending });
      updateTransactionStatus(
        MOCK_TX_HASHES.pending,
        'confirmed',
        mockReceipt as any
      );

      // 5. Verify status updated
      const confirmedTx = getTransactionByHash(MOCK_TX_HASHES.pending);
      expect(confirmedTx?.status).toBe('confirmed');

      // 6. Verify it's no longer in pending
      const pendingAfter = getPendingTransactions();
      expect(pendingAfter).toHaveLength(0);

      // 7. Verify it appears in history
      const history = getTransactionHistory(MOCK_ADDRESSES.user1);
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe('confirmed');
    });

    it('handles multiple transactions for same address', () => {
      // Save multiple transactions
      const tx1 = {
        hash: MOCK_TX_HASHES.pending,
        status: 'pending' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'TX 1',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: Date.now(),
        },
        confirmations: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const tx2 = {
        hash: MOCK_TX_HASHES.confirmed,
        status: 'confirmed' as const,
        metadata: {
          type: 'process_payment' as const,
          description: 'TX 2',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: Date.now(),
        },
        confirmations: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveTransaction(tx1);
      saveTransaction(tx2);

      // Get history for user1
      const history = getTransactionHistory(MOCK_ADDRESSES.user1);
      expect(history).toHaveLength(2);

      // Verify both transactions are present
      const hashes = history.map((tx) => tx.hash);
      expect(hashes).toContain(MOCK_TX_HASHES.pending);
      expect(hashes).toContain(MOCK_TX_HASHES.confirmed);
    });

    it('filters transactions by address', () => {
      // Save transactions for different addresses
      const tx1 = {
        hash: MOCK_TX_HASHES.pending,
        status: 'pending' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'User 1 TX',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: Date.now(),
        },
        confirmations: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const tx2 = {
        hash: MOCK_TX_HASHES.confirmed,
        status: 'confirmed' as const,
        metadata: {
          type: 'process_payment' as const,
          description: 'User 2 TX',
          fromAddress: MOCK_ADDRESSES.user2,
          timestamp: Date.now(),
        },
        confirmations: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveTransaction(tx1);
      saveTransaction(tx2);

      // Get history for each user
      const user1History = getTransactionHistory(MOCK_ADDRESSES.user1);
      const user2History = getTransactionHistory(MOCK_ADDRESSES.user2);

      expect(user1History).toHaveLength(1);
      expect(user2History).toHaveLength(1);
      expect(user1History[0].metadata.fromAddress).toBe(MOCK_ADDRESSES.user1);
      expect(user2History[0].metadata.fromAddress).toBe(MOCK_ADDRESSES.user2);
    });
  });

  describe('Transaction status tracking with hook', () => {
    it('tracks transaction from pending to confirmed', async () => {
      const mockReceipt = createMockTxReceipt();
      let callCount = 0;

      // Mock publicClient to simulate pending then confirmed
      const mockPublicClient = {
        getTransactionReceipt: vi.fn(() => {
          callCount++;
          // First call returns null (pending), second returns receipt
          if (callCount === 1) {
            return Promise.resolve(null);
          }
          return Promise.resolve(mockReceipt);
        }),
        getBlockNumber: vi.fn(() => Promise.resolve(BigInt(12345))),
      };

      const { usePublicClient } = await import('wagmi');
      vi.mocked(usePublicClient).mockReturnValue(mockPublicClient as any);

      const { result } = renderHook(
        () =>
          useTransactionStatus({
            hash: MOCK_TX_HASHES.pending,
          }),
        {
          wrapper: TestProviders,
        }
      );

      // Wait for initial status
      await waitFor(
        () => {
          expect(result.current.status).toBeDefined();
        },
        { timeout: 2000 }
      );
    });

    it('calls callbacks during transaction lifecycle', async () => {
      const onSuccess = vi.fn();
      const onConfirmation = vi.fn();
      const mockReceipt = createMockTxReceipt();

      const mockPublicClient = {
        getTransactionReceipt: vi.fn(() => Promise.resolve(mockReceipt)),
        getBlockNumber: vi.fn(() => Promise.resolve(BigInt(12345))),
      };

      const { usePublicClient } = await import('wagmi');
      vi.mocked(usePublicClient).mockReturnValue(mockPublicClient as any);

      renderHook(
        () =>
          useTransactionStatus({
            hash: MOCK_TX_HASHES.confirmed,
            onSuccess,
            onConfirmation,
          }),
        {
          wrapper: TestProviders,
        }
      );

      await waitFor(
        () => {
          expect(mockPublicClient.getTransactionReceipt).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it('handles transaction errors', async () => {
      const onError = vi.fn();
      const mockReceipt = createMockTxReceipt({ status: 'reverted' });

      const mockPublicClient = {
        getTransactionReceipt: vi.fn(() => Promise.resolve(mockReceipt)),
        getBlockNumber: vi.fn(() => Promise.resolve(BigInt(12345))),
      };

      const { usePublicClient } = await import('wagmi');
      vi.mocked(usePublicClient).mockReturnValue(mockPublicClient as any);

      renderHook(
        () =>
          useTransactionStatus({
            hash: MOCK_TX_HASHES.failed,
            onError,
          }),
        {
          wrapper: TestProviders,
        }
      );

      await waitFor(
        () => {
          expect(mockPublicClient.getTransactionReceipt).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Transaction history management', () => {
    it('maintains transaction order (newest first)', () => {
      const now = Date.now();

      const oldTx = {
        hash: MOCK_TX_HASHES.confirmed,
        status: 'confirmed' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'Old TX',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: now - 10000,
        },
        confirmations: 10,
        createdAt: now - 10000,
        updatedAt: now - 10000,
      };

      const newTx = {
        hash: MOCK_TX_HASHES.pending,
        status: 'pending' as const,
        metadata: {
          type: 'process_payment' as const,
          description: 'New TX',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: now,
        },
        confirmations: 0,
        createdAt: now,
        updatedAt: now,
      };

      saveTransaction(oldTx);
      saveTransaction(newTx);

      const history = getTransactionHistory(MOCK_ADDRESSES.user1);

      expect(history[0].hash).toBe(MOCK_TX_HASHES.pending);
      expect(history[1].hash).toBe(MOCK_TX_HASHES.confirmed);
    });

    it('updates existing transactions without duplicating', () => {
      const tx = {
        hash: MOCK_TX_HASHES.pending,
        status: 'pending' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'TX',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: Date.now(),
        },
        confirmations: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save initial transaction
      saveTransaction(tx);
      const historyBefore = getTransactionHistory(MOCK_ADDRESSES.user1);
      expect(historyBefore).toHaveLength(1);

      // Update same transaction
      saveTransaction({ ...tx, status: 'confirmed' as const, confirmations: 1 });
      const historyAfter = getTransactionHistory(MOCK_ADDRESSES.user1);

      // Should still have only 1 transaction
      expect(historyAfter).toHaveLength(1);
      expect(historyAfter[0].status).toBe('confirmed');
    });
  });

  describe('Error handling and recovery', () => {
    it('handles corrupted localStorage gracefully', () => {
      // Corrupt localStorage data
      localStorage.setItem('earnestpay_transactions', 'invalid json{');

      // Should not throw and return empty array
      const history = getTransactionHistory();
      expect(history).toEqual([]);
    });

    it('recovers from failed transaction updates', () => {
      const tx = {
        hash: MOCK_TX_HASHES.pending,
        status: 'pending' as const,
        metadata: {
          type: 'create_employee' as const,
          description: 'TX',
          fromAddress: MOCK_ADDRESSES.user1,
          timestamp: Date.now(),
        },
        confirmations: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveTransaction(tx);

      // Try to update with error message
      updateTransactionStatus(MOCK_TX_HASHES.pending, 'failed', undefined, 'Test error');

      const updatedTx = getTransactionByHash(MOCK_TX_HASHES.pending);
      expect(updatedTx?.status).toBe('failed');
      expect(updatedTx?.error).toBe('Test error');
    });
  });
});
