import { useState, useEffect } from 'react';
import { useTransactionCost } from '@/hooks/useTransactionCost';
import { GasEstimateBadge } from './GasEstimateBadge';
import { Button } from './ui/button';
import { useAccount } from 'wagmi';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

interface TransactionButtonProps {
  transaction: any;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  showGasEstimate?: boolean;
}

export function TransactionButton({
  transaction,
  onSuccess,
  onError,
  children,
  className,
  disabled = false,
  showGasEstimate = true,
}: TransactionButtonProps) {
  const { address: evmAddress } = useAccount();
  const { account: aptosAccount } = useWallet();
  const [isPending, setIsPending] = useState(false);
  const { estimateGas, loading: isEstimating } = useTransactionCost();
  const [gasEstimate, setGasEstimate] = useState<any>(null);

  // Estimate gas when transaction changes
  useEffect(() => {
    if (!transaction) return;

    const estimate = async () => {
      try {
        const sender = transaction.sender || aptosAccount?.address || evmAddress;
        if (!sender) return;

        const estimate = await estimateGas({
          ...transaction,
          sender,
        });
        setGasEstimate(estimate);
      } catch (error) {
        console.error('Failed to estimate gas:', error);
        setGasEstimate({
          gasFee: 0,
          gasFeeUSD: null,
          gasPrice: 0,
          gasLimit: 0,
          loading: false,
          error: 'Failed to estimate gas',
        });
      }
    };

    estimate();
  }, [transaction, aptosAccount, evmAddress, estimateGas]);

  const handleClick = async () => {
    if (!transaction || isPending || isEstimating) return;

    setIsPending(true);
    try {
      // Your transaction execution logic here
      // const result = await executeTransaction(transaction);
      // onSuccess?.(result);
    } catch (error) {
      console.error('Transaction failed:', error);
      onError?.(error as Error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleClick}
        disabled={disabled || isPending || isEstimating || !gasEstimate}
        className={className}
      >
        {isPending ? 'Processing...' : children}
      </Button>
      
      {showGasEstimate && gasEstimate && (
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
