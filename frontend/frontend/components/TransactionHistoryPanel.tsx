import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Zap,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { formatUnits } from 'viem';
import { UnifiedTransaction } from '@/types/transactions';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

// Simple Badge component
const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
    {children}
  </span>
);

/**
 * TransactionHistoryPanel Component
 *
 * Displays comprehensive transaction history with:
 * - Real-time status updates
 * - Transaction actions (retry, speed up, cancel)
 * - Pending transaction indicators
 * - Manual refresh
 * - Expandable transaction details
 */

interface TransactionItemProps {
  transaction: UnifiedTransaction;
  onRetry: (tx: UnifiedTransaction) => void;
  onSpeedUp: (tx: UnifiedTransaction) => void;
  onCancel: (tx: UnifiedTransaction) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onRetry,
  onSpeedUp,
  onCancel
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    const variants = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      confirmed: 'bg-green-500/10 text-green-500 border-green-500/20',
      failed: 'bg-red-500/10 text-red-500 border-red-500/20'
    };

    return (
      <Badge className={variants[transaction.status]}>
        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
      </Badge>
    );
  };

  const formatAmount = () => {
    try {
      if (transaction.chain === 'aptos') {
        return `${parseFloat(transaction.amount).toFixed(4)} ${transaction.token}`;
      } else {
        // EVM amount is in wei
        const formatted = formatUnits(BigInt(transaction.amount), 18);
        return `${parseFloat(formatted).toFixed(6)} ${transaction.token}`;
      }
    } catch {
      return `${transaction.amount} ${transaction.token}`;
    }
  };

  const formatTimestamp = () => {
    const date = new Date(transaction.timestamp);
    return date.toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.div
      className="border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">{getStatusIcon()}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-medium">
                  {transaction.type === 'payment' ? 'Payment' : transaction.type}
                </span>
                {getStatusBadge()}
                <Badge className="text-xs border-gray-700 text-gray-400">
                  {transaction.chain}
                </Badge>
              </div>
              <div className="text-sm text-gray-400">
                {formatAmount()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatTimestamp()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-2">
            {/* Actions for pending transactions */}
            {transaction.status === 'pending' && transaction.chain !== 'aptos' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSpeedUp(transaction)}
                  className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  title="Speed up"
                >
                  <Zap className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(transaction)}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Actions for failed transactions */}
            {transaction.status === 'failed' && transaction.chain !== 'aptos' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRetry(transaction)}
                className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                title="Retry"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}

            {/* Explorer link */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(transaction.explorerUrl, '_blank')}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              title="View on explorer"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            {/* Expand/Collapse */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="mt-4 pt-4 border-t border-gray-800 space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 text-xs mb-1">From</div>
                  <div className="text-gray-300 font-mono break-all">
                    {formatAddress(transaction.from)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">To</div>
                  <div className="text-gray-300 font-mono break-all">
                    {formatAddress(transaction.to)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Transaction Hash</div>
                  <div className="text-gray-300 font-mono text-xs break-all">
                    {transaction.hash}
                  </div>
                </div>
                {transaction.label && (
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Label</div>
                    <div className="text-gray-300">{transaction.label}</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export const TransactionHistoryPanel: React.FC = () => {
  const {
    transactions,
    isLoading,
    error,
    refresh,
    retryTransaction,
    speedUpTransaction,
    cancelTransaction,
    pendingCount
  } = useTransactionHistory(50);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-white">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 border border-gray-800 rounded-lg">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Transaction History</CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              {pendingCount > 0 && (
                <span className="ml-2 text-yellow-500">
                  ({pendingCount} pending)
                </span>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm mt-1">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(tx => (
              <TransactionItem
                key={tx.hash}
                transaction={tx}
                onRetry={retryTransaction}
                onSpeedUp={speedUpTransaction}
                onCancel={cancelTransaction}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistoryPanel;
