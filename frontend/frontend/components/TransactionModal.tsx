import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { formatUnits } from 'viem';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  gasEstimate: {
    gasFee: number;
    gasFeeUSD: number | null;
    gasPrice: number;
    gasLimit: number;
    loading: boolean;
    error: string | null;
  };
  transactionDetails: {
    title: string;
    description?: string;
    from: string;
    to: string;
    amount?: string;
    token?: string;
  };
  isConfirming?: boolean;
}

export function TransactionModal({
  isOpen,
  onClose,
  onConfirm,
  gasEstimate,
  transactionDetails,
  isConfirming = false,
}: TransactionModalProps) {
  const { gasFee, gasFeeUSD, gasPrice, gasLimit, loading, error } = gasEstimate;
  const { title, description, from, to, amount, token = 'APT' } = transactionDetails;

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-sm font-medium text-muted-foreground">From</div>
            <div className="col-span-3 font-mono text-sm">{formatAddress(from)}</div>

            <div className="text-sm font-medium text-muted-foreground">To</div>
            <div className="col-span-3 font-mono text-sm">{formatAddress(to)}</div>

            {amount && (
              <>
                <div className="text-sm font-medium text-muted-foreground">Amount</div>
                <div className="col-span-3 text-sm">
                  {amount} {token}
                </div>
              </>
            )}

            <div className="text-sm font-medium text-muted-foreground">Gas Price</div>
            <div className="col-span-3 text-sm">
              {loading ? (
                <span className="inline-flex items-center">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Estimating...
                </span>
              ) : error ? (
                <span className="text-destructive inline-flex items-center">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Estimate failed
                </span>
              ) : (
                `${(gasPrice / 1e8).toFixed(8)} APT`
              )}
            </div>

            <div className="text-sm font-medium text-muted-foreground">Gas Limit</div>
            <div className="col-span-3 text-sm">
              {loading ? '...' : gasLimit.toLocaleString()} units
            </div>

            <div className="text-sm font-medium text-muted-foreground">Max Fee</div>
            <div className="col-span-3 text-sm font-medium">
              {loading ? (
                '...'
              ) : error ? (
                'N/A'
              ) : (
                <>
                  {gasFee.toFixed(8)} APT
                  {gasFeeUSD !== null && (
                    <span className="ml-2 text-muted-foreground">
                      (${gasFeeUSD.toFixed(2)})
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                {error}
              </div>
              <p className="mt-1 text-xs">
                You can still try to submit the transaction, but it might fail.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isConfirming || (loading && !error)}>
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm Transaction'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
