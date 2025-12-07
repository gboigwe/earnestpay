/**
 * Token Balance Display Component
 * Shows token balances with refresh capability
 */

import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useMultiTokenBalances } from '@/hooks/useTokenBalance';
import { BASE_TOKENS } from '@/config/tokens.config';

export const TokenBalanceDisplay = () => {
  const { balances, isLoading, refetch } = useMultiTokenBalances();

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Token Balances</h3>
        <motion.button
          onClick={refetch}
          disabled={isLoading}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={`text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      <div className="space-y-3">
        {BASE_TOKENS.map((token, index) => {
          const balance = balances.get(token.symbol);
          const formatted = balance?.formatted || '0';

          return (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {token.symbol.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{token.symbol}</p>
                  <p className="text-xs text-gray-400">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">
                  {parseFloat(formatted).toFixed(6)}
                </p>
                <p className="text-xs text-gray-400">{token.symbol}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
