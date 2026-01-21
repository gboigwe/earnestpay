/**
 * Tests for gas optimization utilities
 */

import { describe, it, expect, vi } from 'vitest';
import { parseEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import {
  getCurrentGasPrices,
  estimateGasWithTiers,
  formatGasPrice,
  calculateTransactionCost,
  getOptimizedGasLimit,
  isGasPriceReasonable,
  shouldUseBatchProcessing,
  getGasOptimizationTips,
} from '../gas';

describe('Gas Utilities', () => {
  describe('getCurrentGasPrices', () => {
    it('returns base fee and priority fee', async () => {
      const mockPublicClient = {
        getBlock: vi.fn(() =>
          Promise.resolve({
            baseFeePerGas: parseEther('0.00000001'),
          })
        ),
        estimateMaxPriorityFeePerGas: vi.fn(() =>
          Promise.resolve(parseEther('0.000000001'))
        ),
      };

      const result = await getCurrentGasPrices(mockPublicClient as any);

      expect(result.baseFee).toBeDefined();
      expect(result.priorityFee).toBeDefined();
      expect(mockPublicClient.getBlock).toHaveBeenCalled();
      expect(mockPublicClient.estimateMaxPriorityFeePerGas).toHaveBeenCalled();
    });

    it('uses fallback values on error', async () => {
      const mockPublicClient = {
        getBlock: vi.fn(() => Promise.reject(new Error('Network error'))),
        estimateMaxPriorityFeePerGas: vi.fn(() =>
          Promise.reject(new Error('Network error'))
        ),
      };

      const result = await getCurrentGasPrices(mockPublicClient as any);

      expect(result.baseFee).toBeDefined();
      expect(result.priorityFee).toBeDefined();
      expect(result.baseFee).toBeGreaterThan(BigInt(0));
      expect(result.priorityFee).toBeGreaterThan(BigInt(0));
    });

    it('handles missing baseFeePerGas', async () => {
      const mockPublicClient = {
        getBlock: vi.fn(() => Promise.resolve({})),
        estimateMaxPriorityFeePerGas: vi.fn(() =>
          Promise.resolve(parseEther('0.000000001'))
        ),
      };

      const result = await getCurrentGasPrices(mockPublicClient as any);

      expect(result.baseFee).toBeDefined();
      expect(result.baseFee).toBeGreaterThan(BigInt(0));
    });
  });

  describe('estimateGasWithTiers', () => {
    const mockPublicClient = {
      getBlock: vi.fn(() =>
        Promise.resolve({
          baseFeePerGas: parseEther('0.00000001'),
        })
      ),
      estimateMaxPriorityFeePerGas: vi.fn(() =>
        Promise.resolve(parseEther('0.000000001'))
      ),
    };

    it('returns three gas tiers', async () => {
      const gasLimit = BigInt(100000);
      const result = await estimateGasWithTiers(mockPublicClient as any, gasLimit);

      expect(result.slow).toBeDefined();
      expect(result.standard).toBeDefined();
      expect(result.fast).toBeDefined();
    });

    it('includes all estimate properties', async () => {
      const gasLimit = BigInt(100000);
      const result = await estimateGasWithTiers(mockPublicClient as any, gasLimit);

      expect(result.standard.gasLimit).toBe(gasLimit);
      expect(result.standard.maxFeePerGas).toBeDefined();
      expect(result.standard.maxPriorityFeePerGas).toBeDefined();
      expect(result.standard.estimatedCost).toBeDefined();
      expect(result.standard.estimatedCostInEth).toBeDefined();
      expect(result.standard.estimatedTimeSeconds).toBeDefined();
    });

    it('fast tier is more expensive than standard', async () => {
      const gasLimit = BigInt(100000);
      const result = await estimateGasWithTiers(mockPublicClient as any, gasLimit);

      expect(result.fast.estimatedCost).toBeGreaterThan(result.standard.estimatedCost);
      expect(result.fast.maxPriorityFeePerGas).toBeGreaterThan(
        result.standard.maxPriorityFeePerGas
      );
    });

    it('slow tier is cheaper than standard', async () => {
      const gasLimit = BigInt(100000);
      const result = await estimateGasWithTiers(mockPublicClient as any, gasLimit);

      expect(result.slow.estimatedCost).toBeLessThan(result.standard.estimatedCost);
      expect(result.slow.maxPriorityFeePerGas).toBeLessThan(
        result.standard.maxPriorityFeePerGas
      );
    });

    it('fast tier is fastest', async () => {
      const gasLimit = BigInt(100000);
      const result = await estimateGasWithTiers(mockPublicClient as any, gasLimit);

      expect(result.fast.estimatedTimeSeconds).toBeLessThan(
        result.standard.estimatedTimeSeconds
      );
    });

    it('slow tier is slowest', async () => {
      const gasLimit = BigInt(100000);
      const result = await estimateGasWithTiers(mockPublicClient as any, gasLimit);

      expect(result.slow.estimatedTimeSeconds).toBeGreaterThan(
        result.standard.estimatedTimeSeconds
      );
    });
  });

  describe('formatGasPrice', () => {
    it('formats gas price in gwei', () => {
      const gasPrice = parseEther('0.00000001'); // 0.01 gwei
      const result = formatGasPrice(gasPrice);

      expect(result).toContain('gwei');
      expect(result).toMatch(/[\d.]+\sgwei/);
    });

    it('formats to 4 decimal places', () => {
      const gasPrice = parseEther('0.000000123456');
      const result = formatGasPrice(gasPrice);

      const number = parseFloat(result.split(' ')[0]);
      const decimals = result.split('.')[1]?.split(' ')[0] || '';
      expect(decimals.length).toBeLessThanOrEqual(4);
    });

    it('handles zero gas price', () => {
      const result = formatGasPrice(BigInt(0));
      expect(result).toContain('0.0000 gwei');
    });
  });

  describe('calculateTransactionCost', () => {
    it('calculates transaction cost in ETH', () => {
      const gasLimit = BigInt(100000);
      const gasPrice = parseEther('0.00000001');
      const result = calculateTransactionCost(gasLimit, gasPrice);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(parseFloat(result)).toBeGreaterThan(0);
    });

    it('returns higher cost for higher gas price', () => {
      const gasLimit = BigInt(100000);
      const lowGasPrice = parseEther('0.00000001');
      const highGasPrice = parseEther('0.00000002');

      const lowCost = parseFloat(calculateTransactionCost(gasLimit, lowGasPrice));
      const highCost = parseFloat(calculateTransactionCost(gasLimit, highGasPrice));

      expect(highCost).toBeGreaterThan(lowCost);
    });

    it('returns higher cost for higher gas limit', () => {
      const gasPrice = parseEther('0.00000001');
      const lowLimit = BigInt(100000);
      const highLimit = BigInt(200000);

      const lowCost = parseFloat(calculateTransactionCost(lowLimit, gasPrice));
      const highCost = parseFloat(calculateTransactionCost(highLimit, gasPrice));

      expect(highCost).toBeGreaterThan(lowCost);
    });
  });

  describe('getOptimizedGasLimit', () => {
    it('adds 10% buffer to estimated gas', () => {
      const estimatedGas = BigInt(100000);
      const result = getOptimizedGasLimit(estimatedGas);

      const expected = BigInt(110000); // 100000 * 1.1
      expect(result).toBe(expected);
    });

    it('handles large gas estimates', () => {
      const estimatedGas = BigInt(1000000);
      const result = getOptimizedGasLimit(estimatedGas);

      expect(result).toBeGreaterThan(estimatedGas);
      expect(result).toBe(BigInt(1100000));
    });

    it('handles small gas estimates', () => {
      const estimatedGas = BigInt(21000);
      const result = getOptimizedGasLimit(estimatedGas);

      expect(result).toBeGreaterThan(estimatedGas);
      expect(result).toBe(BigInt(23100));
    });
  });

  describe('isGasPriceReasonable', () => {
    it('returns true for reasonable Base mainnet gas', () => {
      const reasonableGas = parseEther('0.00000001'); // 0.01 gwei
      const result = isGasPriceReasonable(reasonableGas, base.id);

      expect(result).toBe(true);
    });

    it('returns false for unreasonable Base mainnet gas', () => {
      const unreasonableGas = parseEther('0.001'); // 1000 gwei (way too high for Base)
      const result = isGasPriceReasonable(unreasonableGas, base.id);

      expect(result).toBe(false);
    });

    it('returns true for reasonable Base Sepolia gas', () => {
      const reasonableGas = parseEther('0.00000001');
      const result = isGasPriceReasonable(reasonableGas, baseSepolia.id);

      expect(result).toBe(true);
    });

    it('returns true for other chains', () => {
      const anyGas = parseEther('0.01');
      const result = isGasPriceReasonable(anyGas, 1); // Ethereum mainnet

      expect(result).toBe(true);
    });
  });

  describe('shouldUseBatchProcessing', () => {
    it('recommends batching when it saves gas', () => {
      const individualGas = BigInt(100000);
      const numberOfTxs = 10;
      const batchGas = BigInt(500000); // Less than 10 * 100000

      const result = shouldUseBatchProcessing(individualGas, numberOfTxs, batchGas);

      expect(result.shouldBatch).toBe(true);
      expect(result.savings).toBeGreaterThan(BigInt(0));
      expect(result.savingsPercent).toBeGreaterThan(0);
    });

    it('does not recommend batching when individual is cheaper', () => {
      const individualGas = BigInt(50000);
      const numberOfTxs = 10;
      const batchGas = BigInt(600000); // More than 10 * 50000

      const result = shouldUseBatchProcessing(individualGas, numberOfTxs, batchGas);

      expect(result.shouldBatch).toBe(false);
      expect(result.savings).toBeLessThan(BigInt(0));
    });

    it('calculates savings correctly', () => {
      const individualGas = BigInt(100000);
      const numberOfTxs = 5;
      const batchGas = BigInt(400000);

      const result = shouldUseBatchProcessing(individualGas, numberOfTxs, batchGas);

      const expectedSavings = BigInt(100000); // 5 * 100000 - 400000
      expect(result.savings).toBe(expectedSavings);
    });

    it('calculates savings percent correctly', () => {
      const individualGas = BigInt(100000);
      const numberOfTxs = 10;
      const batchGas = BigInt(900000);

      const result = shouldUseBatchProcessing(individualGas, numberOfTxs, batchGas);

      // (1000000 - 900000) / 1000000 * 100 = 10%
      expect(result.savingsPercent).toBe(10);
    });
  });

  describe('getGasOptimizationTips', () => {
    it('returns Base-specific tips for Base mainnet', () => {
      const tips = getGasOptimizationTips(base.id);

      expect(tips.length).toBeGreaterThan(0);
      expect(tips.some((tip) => tip.toLowerCase().includes('base'))).toBe(true);
    });

    it('returns Base-specific tips for Base Sepolia', () => {
      const tips = getGasOptimizationTips(baseSepolia.id);

      expect(tips.length).toBeGreaterThan(0);
      expect(tips.some((tip) => tip.toLowerCase().includes('base'))).toBe(true);
    });

    it('mentions low gas costs', () => {
      const tips = getGasOptimizationTips(base.id);

      expect(tips.some((tip) => tip.toLowerCase().includes('low'))).toBe(true);
    });

    it('mentions batch processing', () => {
      const tips = getGasOptimizationTips(base.id);

      expect(tips.some((tip) => tip.toLowerCase().includes('batch'))).toBe(true);
    });

    it('returns generic tips for other chains', () => {
      const tips = getGasOptimizationTips(1); // Ethereum mainnet

      expect(tips.length).toBeGreaterThan(0);
      expect(tips[0]).toContain('Optimize gas usage');
    });
  });
});
