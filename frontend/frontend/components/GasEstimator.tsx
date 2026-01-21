/**
 * Gas Estimator Component
 * Wraps transaction forms with gas estimation and optimization
 */

import { useEffect, ReactNode } from 'react';
import { useGasEstimation } from '@/hooks/useGasEstimation';
import { GasFeeDisplay, GasFeeDisplayCompact } from './GasFeeDisplay';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface GasEstimatorProps {
  gasLimit?: bigint;
  enabled?: boolean;
  compact?: boolean;
  showTips?: boolean;
  onGasEstimated?: (estimate: any) => void;
  children?: ReactNode;
}

/**
 * Gas Estimator wrapper component
 * Automatically estimates gas and displays fees
 */
export const GasEstimator = ({
  gasLimit,
  enabled = true,
  compact = false,
  showTips = true,
  onGasEstimated,
  children,
}: GasEstimatorProps) => {
  const {
    gasPrices,
    isLoading,
    error,
    selectedTier,
    setSelectedTier,
    refresh,
    optimizationTips,
  } = useGasEstimation(gasLimit, { enabled });

  // Notify parent when gas is estimated
  useEffect(() => {
    if (gasPrices && onGasEstimated) {
      onGasEstimated(gasPrices[selectedTier]);
    }
  }, [gasPrices, selectedTier, onGasEstimated]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      {/* Error State */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-700">
                Gas Estimation Error
              </h4>
              <p className="text-xs text-red-600 mt-1">{error.message}</p>
            </div>
            <Button
              onClick={refresh}
              variant="outline"
              size="sm"
              className="border-red-200 hover:bg-red-50"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Gas Fee Display */}
      {!error && (
        <>
          {compact ? (
            <GasFeeDisplayCompact
              gasPrices={gasPrices}
              selectedTier={selectedTier}
            />
          ) : (
            <GasFeeDisplay
              gasPrices={gasPrices}
              selectedTier={selectedTier}
              onTierChange={setSelectedTier}
              isLoading={isLoading}
              showOptimizationTips={showTips}
              optimizationTips={optimizationTips}
            />
          )}
        </>
      )}

      {/* Child Content */}
      {children}
    </div>
  );
};

/**
 * Batch Gas Estimator
 * Shows comparison between individual and batch operations
 */
interface BatchGasEstimatorProps {
  individualGasLimit: bigint;
  batchGasLimit: bigint;
  numberOfOperations: number;
  onShouldBatch?: (shouldBatch: boolean) => void;
}

export const BatchGasEstimator = ({
  individualGasLimit,
  batchGasLimit,
  numberOfOperations,
  onShouldBatch,
}: BatchGasEstimatorProps) => {
  const individual = useGasEstimation(individualGasLimit);
  const batch = useGasEstimation(batchGasLimit);

  const totalIndividualCost =
    individual.gasPrices &&
    BigInt(numberOfOperations) *
      individual.gasPrices[individual.selectedTier].estimatedCost;

  const batchCost =
    batch.gasPrices && batch.gasPrices[batch.selectedTier].estimatedCost;

  const savings =
    totalIndividualCost && batchCost
      ? totalIndividualCost - batchCost
      : BigInt(0);
  const savingsPercent =
    totalIndividualCost && savings > BigInt(0)
      ? Number((savings * BigInt(100)) / totalIndividualCost)
      : 0;

  const shouldBatch = savings > BigInt(0);

  useEffect(() => {
    if (onShouldBatch) {
      onShouldBatch(shouldBatch);
    }
  }, [shouldBatch, onShouldBatch]);

  if (individual.isLoading || batch.isLoading) {
    return (
      <div className="p-4 bg-white border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-green-600 animate-spin" />
          <span className="text-sm text-green-700">
            Calculating batch optimization...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-green-200 rounded-lg space-y-3">
      <h3 className="text-sm font-semibold text-green-700">
        Batch Processing Analysis
      </h3>

      {/* Individual vs Batch Comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Individual ({numberOfOperations}x)</div>
          <div className="text-sm font-semibold text-gray-700">
            {totalIndividualCost
              ? (Number(totalIndividualCost) / 1e18).toFixed(6)
              : '0'}{' '}
            ETH
          </div>
        </div>

        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-xs text-green-600 mb-1">Batch Processing</div>
          <div className="text-sm font-semibold text-green-700">
            {batchCost ? (Number(batchCost) / 1e18).toFixed(6) : '0'} ETH
          </div>
        </div>
      </div>

      {/* Savings Display */}
      {shouldBatch && (
        <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-green-600">Estimated Savings</div>
              <div className="text-sm font-semibold text-green-700">
                {(Number(savings) / 1e18).toFixed(6)} ETH ({savingsPercent.toFixed(1)}%)
              </div>
            </div>
            <div className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
              Use Batch
            </div>
          </div>
        </div>
      )}

      {!shouldBatch && (
        <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
          <div className="text-xs text-gray-600">
            Batch processing may not save gas for this operation
          </div>
        </div>
      )}
    </div>
  );
};
