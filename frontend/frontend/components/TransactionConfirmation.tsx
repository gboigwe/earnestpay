/**
 * Transaction Confirmation Component
 * Shows transaction confirmation dialog with status tracking
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { type Hash } from 'viem';
import { useChainId } from 'wagmi';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import {
  getBlockExplorerUrl,
  getTransactionStatusColor,
  type TransactionType,
  getTransactionTypeDescription,
} from '@/utils/transactions';
import { Button } from './ui/button';

interface TransactionConfirmationProps {
  hash?: Hash;
  type: TransactionType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export const TransactionConfirmation = ({
  hash,
  type,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: TransactionConfirmationProps) => {
  const chainId = useChainId();

  const { status, confirmations, isSuccess, isError, error } =
    useTransactionStatus({
      hash,
      enabled: isOpen && !!hash,
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
      onError: () => {
        if (onError) onError();
      },
    });

  const statusColors = status ? getTransactionStatusColor(status) : null;
  const explorerUrl = hash ? getBlockExplorerUrl(hash, chainId) : '';
  const description = getTransactionTypeDescription(type);

  // Auto-close after success (optional)
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose]);

  if (!isOpen || !hash) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Status Icon */}
              <div className="flex justify-center mb-4">
                {status === 'pending' && (
                  <div className="p-4 bg-yellow-100 rounded-full">
                    <Loader2 className="w-12 h-12 text-yellow-600 animate-spin" />
                  </div>
                )}
                {status === 'confirming' && (
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Clock className="w-12 h-12 text-blue-600 animate-pulse" />
                  </div>
                )}
                {status === 'confirmed' && (
                  <motion.div
                    className="p-4 bg-green-100 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </motion.div>
                )}
                {(status === 'failed' || status === 'reverted') && (
                  <motion.div
                    className="p-4 bg-red-100 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <XCircle className="w-12 h-12 text-red-600" />
                  </motion.div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-center text-green-700 mb-2">
                {status === 'pending' && 'Submitting Transaction'}
                {status === 'confirming' && 'Confirming Transaction'}
                {status === 'confirmed' && 'Transaction Confirmed!'}
                {(status === 'failed' || status === 'reverted') &&
                  'Transaction Failed'}
              </h2>

              {/* Description */}
              <p className="text-center text-gray-600 mb-4">{description}</p>

              {/* Status Badge */}
              {statusColors && (
                <div className="flex justify-center mb-4">
                  <div
                    className={`px-3 py-1 rounded-full border ${statusColors.bg} ${statusColors.text} ${statusColors.border} text-sm font-medium`}
                  >
                    {status?.toUpperCase()}
                  </div>
                </div>
              )}

              {/* Confirmations */}
              {status === 'confirming' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Confirmations</span>
                    <span className="text-sm font-semibold text-blue-700">
                      {confirmations} / 1
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-600"
                      initial={{ width: '0%' }}
                      animate={{ width: `${Math.min(confirmations * 100, 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {isError && error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-1">
                        Error Details
                      </h4>
                      <p className="text-xs text-red-600">{error.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Hash */}
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Transaction Hash</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-gray-700 break-all flex-1">
                    {hash.slice(0, 10)}...{hash.slice(-8)}
                  </code>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isSuccess && (
                  <Button
                    onClick={onClose}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Done
                  </Button>
                )}
                {isError && (
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-red-300 hover:bg-red-50"
                  >
                    Close
                  </Button>
                )}
                {!isSuccess && !isError && (
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                )}
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    View on Explorer
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Compact transaction status display (for inline use)
 */
export const TransactionStatusBadge = ({
  hash,
  type,
}: {
  hash: Hash;
  type: TransactionType;
}) => {
  const { status, confirmations } = useTransactionStatus({ hash });

  if (!status) return null;

  const statusColors = getTransactionStatusColor(status);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
    >
      {status === 'pending' && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === 'confirming' && <Clock className="w-3 h-3 animate-pulse" />}
      {status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
      {(status === 'failed' || status === 'reverted') && (
        <XCircle className="w-3 h-3" />
      )}
      <span className="text-xs font-medium">
        {status === 'confirming'
          ? `${confirmations} confirmation${confirmations !== 1 ? 's' : ''}`
          : status}
      </span>
    </div>
  );
};
