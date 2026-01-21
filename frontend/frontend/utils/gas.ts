/**
 * Gas optimization utilities for Base blockchain
 * Provides gas estimation and optimization helpers
 */

import { PublicClient, formatGwei, formatEther, parseEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';

/**
 * Gas price tiers for user selection
 */
export type GasPriceTier = 'slow' | 'standard' | 'fast';

/**
 * Gas estimation result
 */
export interface GasEstimate {
  gasLimit: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedCost: bigint;
  estimatedCostInEth: string;
  estimatedTimeSeconds: number;
}

/**
 * Gas price data by tier
 */
export interface GasPrices {
  slow: GasEstimate;
  standard: GasEstimate;
  fast: GasEstimate;
}

/**
 * Get current gas prices from the network
 * Optimized for Base's low gas costs
 */
export async function getCurrentGasPrices(
  publicClient: PublicClient
): Promise<{ baseFee: bigint; priorityFee: bigint }> {
  try {
    // Get base fee from latest block
    const block = await publicClient.getBlock({ blockTag: 'latest' });
    const baseFee = block.baseFeePerGas || parseEther('0.00000001'); // Fallback to 0.01 gwei

    // Get priority fee estimate
    const maxPriorityFeePerGas = await publicClient.estimateMaxPriorityFeePerGas();

    return {
      baseFee,
      priorityFee: maxPriorityFeePerGas,
    };
  } catch (error) {
    console.error('Error fetching gas prices:', error);
    // Base fallback values (very low for Base)
    return {
      baseFee: parseEther('0.00000001'), // 0.01 gwei
      priorityFee: parseEther('0.000000001'), // 0.001 gwei
    };
  }
}

/**
 * Estimate gas for a transaction with multiple tiers
 */
export async function estimateGasWithTiers(
  publicClient: PublicClient,
  gasLimit: bigint
): Promise<GasPrices> {
  const { baseFee, priorityFee } = await getCurrentGasPrices(publicClient);

  // Calculate tier multipliers (Base has very low gas, so multipliers are smaller)
  const slowMultiplier = 0.8;
  const standardMultiplier = 1.0;
  const fastMultiplier = 1.2;

  const calculateTier = (
    multiplier: number,
    timeSeconds: number
  ): GasEstimate => {
    const maxPriorityFeePerGas = BigInt(
      Math.floor(Number(priorityFee) * multiplier)
    );
    const maxFeePerGas = baseFee + maxPriorityFeePerGas;
    const estimatedCost = gasLimit * maxFeePerGas;

    return {
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      estimatedCost,
      estimatedCostInEth: formatEther(estimatedCost),
      estimatedTimeSeconds: timeSeconds,
    };
  };

  return {
    slow: calculateTier(slowMultiplier, 30), // ~30 seconds on Base
    standard: calculateTier(standardMultiplier, 10), // ~10 seconds on Base
    fast: calculateTier(fastMultiplier, 5), // ~5 seconds on Base
  };
}

/**
 * Format gas price for display
 */
export function formatGasPrice(gasPrice: bigint): string {
  const gwei = formatGwei(gasPrice);
  return `${parseFloat(gwei).toFixed(4)} gwei`;
}

/**
 * Calculate total transaction cost
 */
export function calculateTransactionCost(
  gasLimit: bigint,
  gasPrice: bigint
): string {
  const cost = gasLimit * gasPrice;
  return formatEther(cost);
}

/**
 * Get optimized gas limit with buffer
 * Adds a 10% buffer to estimated gas to prevent out-of-gas errors
 */
export function getOptimizedGasLimit(estimatedGas: bigint): bigint {
  const buffer = (estimatedGas * BigInt(10)) / BigInt(100); // 10% buffer
  return estimatedGas + buffer;
}

/**
 * Check if gas price is reasonable for Base
 * Base typically has very low gas costs
 */
export function isGasPriceReasonable(
  maxFeePerGas: bigint,
  chainId: number
): boolean {
  // For Base mainnet and testnet, gas should be very low
  if (chainId === base.id || chainId === baseSepolia.id) {
    const maxReasonableGwei = parseEther('0.0000001'); // 0.1 gwei max
    return maxFeePerGas <= maxReasonableGwei;
  }
  return true;
}

/**
 * Batch transaction gas optimization
 * Calculates if batch processing is more efficient than individual transactions
 */
export function shouldUseBatchProcessing(
  individualGasPerTx: bigint,
  numberOfTxs: number,
  batchGasEstimate: bigint
): { shouldBatch: boolean; savings: bigint; savingsPercent: number } {
  const totalIndividualGas = individualGasPerTx * BigInt(numberOfTxs);
  const savings = totalIndividualGas - batchGasEstimate;
  const savingsPercent = Number((savings * BigInt(100)) / totalIndividualGas);

  return {
    shouldBatch: savings > BigInt(0),
    savings,
    savingsPercent,
  };
}

/**
 * Get chain-specific gas optimization tips
 */
export function getGasOptimizationTips(chainId: number): string[] {
  if (chainId === base.id || chainId === baseSepolia.id) {
    return [
      'Base has very low gas costs compared to Ethereum mainnet',
      'Batch operations when processing multiple employees to save gas',
      'Use standard gas tier for most transactions - fast is rarely needed',
      'Gas costs are typically under $0.01 for most operations',
    ];
  }

  return ['Optimize gas usage for better transaction costs'];
}
