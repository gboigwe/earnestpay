import { useState, useEffect, useCallback } from 'react';
import { useTransactionCost } from '@/hooks/useTransactionCost';
import { GasEstimateBadge } from './GasEstimateBadge';
import { Button } from './ui/button';
import { useAccount } from 'wagmi';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { TransactionRequest, TransactionResponse, GasEstimate } from '@/types/transaction';

export function TransactionButton({
  transaction,
  onSuccess,
  onError,
  children,
  className,
  disabled = false,
  showGasEstimate = true,
}: React.PropsWithChildren<TransactionButtonProps>) {
  const { address: evmAddress } = useAccount();
  const { account: aptosAccount } = useWallet();
  const [isPending, setIsPending] = useState<boolean>(false);
  const { estimateGas, loading: isEstimating } = useTransactionCost();
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const estimateGasCost = useCallback(async (): Promise<void> => {
    if (!transaction) return;
    
    const sender = transaction.sender || aptosAccount?.address || evmAddress;
    if (!sender) {
      setError('No sender address available');
      return;
    }

    try {
      const estimate = await estimateGas({
        ...transaction,
        sender,
      });
      
      if (estimate.error) {
        throw new Error(estimate.error);
      }
      
      setGasEstimate(estimate);
      setError(null);
    } catch (err) {
      console.error('Failed to estimate gas:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to estimate gas';
      setError(errorMessage);
      
      setGasEstimate({
        gasFee: 0,
        gasFeeUSD: null,
        gasPrice: 0,
        gasLimit: 0,
        loading: false,
        error: errorMessage,
      });
      
      onError?.(new Error(errorMessage));
    }
  }, [transaction, aptosAccount, evmAddress, estimateGas, onError]);

  // Estimate gas when transaction changes
  useEffect(() => {
    estimateGasCost();
  }, [estimateGasCost]);

  const handleClick = async (): Promise<void> => {
    if (!transaction || isPending || isEstimating) return;

    setIsPending(true);
    setError(null);
    
    try {
      // In a real implementation, this would execute the transaction
      // and return a TransactionResponse
      // const result = await executeTransaction(transaction);
      // onSuccess?.(result);
      
      // For now, we'll simulate a successful transaction
      const mockResponse: TransactionResponse = {
        hash: '0x' + Math.random().toString(16).substring(2, 66),
        wait: () => Promise.resolve({
          status: 'success',
          transactionHash: '0x' + Math.random().toString(16).substring(2, 66),
          blockNumber: Math.floor(Math.random() * 1000000),
          gasUsed: BigInt(21000),
        }),
      };
      
      onSuccess?.(mockResponse);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Transaction failed');
      console.error('Transaction failed:', error);
      setError(error.message);
      onError?.(error);
    } finally {
      setIsPending(false);
    }
  };

  const isButtonDisabled = React.useMemo(() => {
    return disabled || isPending || isEstimating || !gasEstimate || !!error;
  }, [disabled, isPending, isEstimating, gasEstimate, error]);

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleClick}
        disabled={isButtonDisabled}
        className={className}
        aria-busy={isPending || isEstimating}
        aria-live="polite"
      >
        {isPending ? 'Processing...' : children}
      </Button>
      
      {error && (
        <div className="text-sm text-red-500 text-center">
          {error}
        </div>
      )}
      
      {showGasEstimate && gasEstimate && !error && (
        <div className="text-center">
          <GasEstimateBadge 
            gasEstimate={gasEstimate} 
            className="justify-center" 
            showDetails={false}
          />
        </div>
      )}
    </div>
  );
}

export type { TransactionRequest, TransactionResponse, GasEstimate };

declare global {
  // Extend the global Window interface if needed for transaction execution
  interface Window {
    ethereum?: any;
  }
}
