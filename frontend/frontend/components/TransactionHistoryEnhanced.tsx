/**
 * Enhanced Transaction History Component
 * Displays list of past transactions with filtering and status
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  ExternalLink,
  Filter,
  Trash2,
  RefreshCw,
  ChevronDown,
  Copy,
  Check,
} from 'lucide-react';
import { type Address, type Hash } from 'viem';
import { useChainId, useAccount } from 'wagmi';
import {
  getTransactionHistory,
  clearTransactionHistory,
  type TransactionRecord,
  type TransactionStatus,
  getBlockExplorerUrl,
  formatTransactionAge,
  getTransactionTypeDescription,
} from '@/utils/transactions';
import { TransactionStatusBadge } from './TransactionConfirmation';
import { Button } from './ui/button';

interface TransactionHistoryEnhancedProps {
  address?: Address;
  maxItems?: number;
  showFilters?: boolean;
}

export const TransactionHistoryEnhanced = ({
  address,
  maxItems = 50,
  showFilters = true,
}: TransactionHistoryEnhancedProps) => {
  const { address: walletAddress } = useAccount();
  const chainId = useChainId();

  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [expandedTx, setExpandedTx] = useState<Hash | null>(null);
  const [copiedHash, setCopiedHash] = useState<Hash | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const displayAddress = address || walletAddress;

  // Load transactions
  useEffect(() => {
    loadTransactions();
  }, [displayAddress]);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((tx) => tx.status === statusFilter);
    }

    setFilteredTransactions(filtered.slice(0, maxItems));
  }, [transactions, statusFilter, maxItems]);

  const loadTransactions = () => {
    const history = getTransactionHistory(displayAddress);
    setTransactions(history);
  };

  const handleClearHistory = () => {
    clearTransactionHistory();
    setTransactions([]);
    setShowClearConfirm(false);
  };

  const copyToClipboard = (hash: Hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (!displayAddress) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg text-center">
        <History className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Connect wallet to view transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-green-700">Transactions</h2>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
            {transactions.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadTransactions}
            variant="outline"
            size="sm"
            className="border-green-200 hover:bg-green-50"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          {transactions.length > 0 && (
            <Button
              onClick={() => setShowClearConfirm(true)}
              variant="outline"
              size="sm"
              className="border-red-200 hover:bg-red-50 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && transactions.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-white border border-green-200 rounded-lg">
          <Filter className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700 font-medium">Filter:</span>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'confirmed', 'pending', 'failed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  statusFilter === filter
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 mb-3">
                Clear all transaction history?
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleClearHistory}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => setShowClearConfirm(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="p-8 bg-white border border-gray-200 rounded-lg text-center">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">
            {transactions.length === 0 ? 'No transactions yet' : 'No matches'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx, index) => {
            const isExpanded = expandedTx === tx.hash;
            const explorerUrl = getBlockExplorerUrl(tx.hash, chainId);

            return (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-green-200 rounded-lg overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedTx(isExpanded ? null : tx.hash)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-green-700">
                          {getTransactionTypeDescription(tx.metadata.type)}
                        </h3>
                        <TransactionStatusBadge hash={tx.hash} type={tx.metadata.type} />
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {tx.metadata.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatTransactionAge(tx.createdAt)}</span>
                        {tx.gasUsed && (
                          <span>Gas: {(Number(tx.gasUsed) / 1000).toFixed(1)}k</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-green-50 rounded-lg"
                      >
                        <ExternalLink className="w-4 h-4 text-green-600" />
                      </a>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <ChevronDown className="w-4 h-4 text-green-600" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-green-200"
                    >
                      <div className="p-4 bg-green-50 space-y-3">
                        <div>
                          <div className="text-xs text-green-600 mb-1">Hash</div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-gray-700 break-all flex-1 bg-white px-2 py-1 rounded">
                              {tx.hash}
                            </code>
                            <button
                              onClick={() => copyToClipboard(tx.hash)}
                              className="p-2 hover:bg-green-100 rounded"
                            >
                              {copiedHash === tx.hash ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-green-600" />
                              )}
                            </button>
                          </div>
                        </div>

                        {tx.blockNumber && (
                          <div>
                            <div className="text-xs text-green-600 mb-1">Block</div>
                            <div className="text-sm text-gray-700">
                              {tx.blockNumber.toString()}
                            </div>
                          </div>
                        )}

                        {tx.error && (
                          <div className="p-2 bg-red-50 border border-red-200 rounded">
                            <div className="text-xs text-red-600 mb-1">Error</div>
                            <div className="text-xs text-red-700">{tx.error}</div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
