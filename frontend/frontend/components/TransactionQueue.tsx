import React, { useState } from 'react';
import {
  Play,
  Pause,
  X,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useTransactionQueue, QueuedTransaction } from '@/hooks/useTransactionQueue';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface TransactionQueueProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * TransactionQueue Component
 *
 * UI for managing and monitoring transaction queue
 *
 * Features:
 * - Visual queue display with status indicators
 * - Progress tracking
 * - Pause/resume controls
 * - Individual transaction actions (retry, cancel)
 * - Clear completed/failed transactions
 */
export const TransactionQueue: React.FC<TransactionQueueProps> = ({ isOpen, onClose }) => {
  const {
    queue,
    queueState,
    processQueue,
    pauseQueue,
    resumeQueue,
    retryTransaction,
    cancelTransaction,
    removeFromQueue,
    clearCompleted,
    clearAll,
  } = useTransactionQueue();

  const pendingCount = queue.filter((tx) => tx.status === 'pending').length;
  const totalCount = queue.length;
  const progress = totalCount > 0 ? ((queueState.completed / totalCount) * 100) : 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed right-4 bottom-4 w-96 max-h-[600px] bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Transaction Queue</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {queueState.completed} of {totalCount} completed
                </span>
                <span className="text-blue-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2 mt-3">
            {!queueState.isProcessing ? (
              <Button
                onClick={processQueue}
                disabled={pendingCount === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Play size={16} className="mr-1" />
                Start Queue
              </Button>
            ) : queueState.isPaused ? (
              <Button
                onClick={resumeQueue}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Play size={16} className="mr-1" />
                Resume
              </Button>
            ) : (
              <Button
                onClick={pauseQueue}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                size="sm"
              >
                <Pause size={16} className="mr-1" />
                Pause
              </Button>
            )}

            <Button
              onClick={clearCompleted}
              variant="outline"
              size="sm"
              className="border-gray-700"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {queue.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">No transactions in queue</p>
            </div>
          ) : (
            <AnimatePresence>
              {queue.map((transaction, index) => (
                <TransactionQueueItem
                  key={transaction.id}
                  transaction={transaction}
                  index={index}
                  isActive={queueState.currentIndex === index && queueState.isProcessing}
                  onRetry={retryTransaction}
                  onCancel={cancelTransaction}
                  onRemove={removeFromQueue}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {queue.length > 0 && (
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{pendingCount} pending</span>
              <span className="text-green-400">{queueState.completed} completed</span>
              <span className="text-red-400">{queueState.failed} failed</span>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

interface TransactionQueueItemProps {
  transaction: QueuedTransaction;
  index: number;
  isActive: boolean;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
}

const TransactionQueueItem: React.FC<TransactionQueueItemProps> = ({
  transaction,
  index,
  isActive,
  onRetry,
  onCancel,
  onRemove,
}) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      label: 'Pending',
    },
    processing: {
      icon: Loader2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      label: 'Processing',
    },
    completed: {
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      label: 'Completed',
    },
    failed: {
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      label: 'Failed',
    },
    cancelled: {
      icon: AlertCircle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      label: 'Cancelled',
    },
  };

  const config = statusConfig[transaction.status];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`p-3 rounded-lg border transition-all ${
        isActive
          ? 'border-blue-500 bg-blue-500/5'
          : 'border-gray-800 bg-gray-800/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon
              size={16}
              className={`${config.color} ${transaction.status === 'processing' ? 'animate-spin' : ''}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm text-white font-medium truncate">
              {transaction.description}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {(Number(transaction.value) / 1e18).toFixed(4)} ETH
            </div>
            {transaction.error && (
              <div className="text-xs text-red-400 mt-1">{transaction.error}</div>
            )}
            {transaction.retryCount > 0 && (
              <div className="text-xs text-yellow-400 mt-1">
                Retry attempt {transaction.retryCount}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {transaction.status === 'failed' && (
            <button
              onClick={() => onRetry(transaction.id)}
              className="p-1.5 hover:bg-blue-500/10 rounded transition-colors"
              title="Retry"
            >
              <RefreshCw size={14} className="text-blue-400" />
            </button>
          )}
          {transaction.status === 'pending' && (
            <button
              onClick={() => onCancel(transaction.id)}
              className="p-1.5 hover:bg-orange-500/10 rounded transition-colors"
              title="Cancel"
            >
              <X size={14} className="text-orange-400" />
            </button>
          )}
          {(transaction.status === 'completed' || transaction.status === 'cancelled') && (
            <button
              onClick={() => onRemove(transaction.id)}
              className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
              title="Remove"
            >
              <Trash2 size={14} className="text-red-400" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionQueue;
