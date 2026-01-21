/**
 * Gas Fee Display Component
 * Shows estimated gas fees with tier selection
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fuel, Info, TrendingDown, Zap, Clock } from 'lucide-react';
import { formatEther } from 'viem';
import { type GasPrices, type GasPriceTier } from '@/utils/gas';
import { Button } from './ui/button';

interface GasFeeDisplayProps {
  gasPrices: GasPrices | null;
  selectedTier: GasPriceTier;
  onTierChange: (tier: GasPriceTier) => void;
  isLoading?: boolean;
  showOptimizationTips?: boolean;
  optimizationTips?: string[];
}

export const GasFeeDisplay = ({
  gasPrices,
  selectedTier,
  onTierChange,
  isLoading = false,
  showOptimizationTips = true,
  optimizationTips = [],
}: GasFeeDisplayProps) => {
  const [showTips, setShowTips] = useState(false);

  if (isLoading) {
    return (
      <div className="p-4 bg-white border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Fuel className="w-5 h-5 text-green-600 animate-pulse" />
          <span className="text-sm text-green-700">Estimating gas fees...</span>
        </div>
      </div>
    );
  }

  if (!gasPrices) {
    return null;
  }

  const tiers: Array<{
    key: GasPriceTier;
    label: string;
    icon: typeof Zap;
    color: string;
    bgColor: string;
    borderColor: string;
  }> = [
    {
      key: 'slow',
      label: 'Slow',
      icon: TrendingDown,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      key: 'standard',
      label: 'Standard',
      icon: Clock,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
    },
    {
      key: 'fast',
      label: 'Fast',
      icon: Zap,
      color: 'text-green-800',
      bgColor: 'bg-green-200',
      borderColor: 'border-green-400',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fuel className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            Estimated Gas Fee
          </span>
        </div>
        {showOptimizationTips && optimizationTips.length > 0 && (
          <button
            onClick={() => setShowTips(!showTips)}
            className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            Tips
          </button>
        )}
      </div>

      {/* Tier Selection */}
      <div className="grid grid-cols-3 gap-2">
        {tiers.map((tier) => {
          const isSelected = selectedTier === tier.key;
          const estimate = gasPrices[tier.key];
          const Icon = tier.icon;

          return (
            <motion.button
              key={tier.key}
              onClick={() => onTierChange(tier.key)}
              className={`
                relative p-3 rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? `${tier.bgColor} ${tier.borderColor}`
                    : 'bg-white border-gray-200 hover:border-green-200'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-1 right-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                </motion.div>
              )}

              <div className="flex flex-col items-center gap-1">
                <Icon
                  className={`w-4 h-4 ${isSelected ? tier.color : 'text-gray-500'}`}
                />
                <span
                  className={`text-xs font-medium ${
                    isSelected ? tier.color : 'text-gray-600'
                  }`}
                >
                  {tier.label}
                </span>
                <span
                  className={`text-xs ${isSelected ? tier.color : 'text-gray-500'}`}
                >
                  ~{estimate.estimatedTimeSeconds}s
                </span>
                <span
                  className={`text-sm font-semibold ${
                    isSelected ? tier.color : 'text-gray-700'
                  }`}
                >
                  ${(parseFloat(estimate.estimatedCostInEth) * 2500).toFixed(4)}
                </span>
                <span className="text-xs text-gray-500">
                  {parseFloat(estimate.estimatedCostInEth).toFixed(6)} ETH
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Optimization Tips */}
      <AnimatePresence>
        {showTips && optimizationTips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-xs font-semibold text-green-700 mb-2">
                Gas Optimization Tips
              </h4>
              <ul className="space-y-1">
                {optimizationTips.map((tip, index) => (
                  <li key={index} className="text-xs text-green-600 flex gap-2">
                    <span>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Tier Details */}
      <div className="p-3 bg-white border border-green-200 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-green-600">Selected: {selectedTier}</span>
          <span className="text-xs text-green-600">
            Est. Time: ~{gasPrices[selectedTier].estimatedTimeSeconds}s
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-green-700">Total Cost</span>
          <div className="text-right">
            <div className="text-sm font-semibold text-green-700">
              {parseFloat(gasPrices[selectedTier].estimatedCostInEth).toFixed(6)} ETH
            </div>
            <div className="text-xs text-gray-500">
              ≈ ${(parseFloat(gasPrices[selectedTier].estimatedCostInEth) * 2500).toFixed(4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact Gas Fee Display (for inline use)
 */
export const GasFeeDisplayCompact = ({
  gasPrices,
  selectedTier,
}: {
  gasPrices: GasPrices | null;
  selectedTier: GasPriceTier;
}) => {
  if (!gasPrices) return null;

  const estimate = gasPrices[selectedTier];

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
      <Fuel className="w-4 h-4 text-green-600" />
      <div className="flex-1">
        <div className="text-xs text-green-600">Gas Fee</div>
        <div className="text-sm font-medium text-green-700">
          {parseFloat(estimate.estimatedCostInEth).toFixed(6)} ETH
        </div>
      </div>
      <div className="text-xs text-green-600">~{estimate.estimatedTimeSeconds}s</div>
    </div>
  );
};
