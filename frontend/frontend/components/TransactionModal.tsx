import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, AlertCircle, CheckCircle2, ExternalLink, XCircle } from 'lucide-react';
import { SecurityWarning, type Transaction } from './SecurityWarning';
import { useMemo } from 'react';
import { getExplorerTxUrl, NetworkType } from '@/config/networks';

export type TransactionState = 'idle' | 'signing' | 'pending' | 'success' | 'error';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  state?: TransactionState;
  transactionHash?: string;
  error?: string;
  explorerUrl?: string;
  gasEstimate?: {
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
    data?: string;
  };
  chain?: 'aptos' | 'ethereum' | 'arbitrum' | 'base' | 'polygon';
}

export function TransactionModal({
  isOpen,
  onClose,
  onConfirm,
  state = 'idle',
  transactionHash,
  error,
  explorerUrl,
  gasEstimate,
  transactionDetails,
  chain = 'aptos',
}: TransactionModalProps) {
  const { title, description, from, to, amount, token = chain === 'aptos' ? 'APT' : 'ETH', data } = transactionDetails;

  const transactionForAnalysis = useMemo<Transaction>(() => ({
    to,
    from,
    value: amount,
    data,
  }), [to, from, amount, data]);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getExplorerUrl = () => {
    if (explorerUrl) return explorerUrl;
    if (!transactionHash) return null;

    return getExplorerTxUrl(chain as NetworkType, transactionHash);
  };

  // Render different content based on transaction state
  const renderContent = () => {
    switch (state) {
      case 'signing':
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 bg-blue-500/20 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Waiting for Signature</h3>
              <p className="text-sm text-muted-foreground">
                Please sign the transaction in your wallet
              </p>
            </div>
          </div>
        );

      case 'pending':
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-yellow-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 bg-yellow-500/20 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Transaction Pending</h3>
              <p className="text-sm text-muted-foreground">
                Your transaction is being confirmed on the blockchain
              </p>
              {transactionHash && (
                <p className="text-xs font-mono text-muted-foreground break-all px-4">
                  Hash: {transactionHash}
                </p>
              )}
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
              <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="absolute inset-0 h-16 w-16 bg-green-500/20 rounded-full animate-ping" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-green-600">Transaction Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Your transaction has been confirmed
              </p>
              {transactionHash && (
                <div className="pt-4 space-y-3">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Transaction Hash</p>
                    <p className="text-xs font-mono break-all">{transactionHash}</p>
                  </div>
                  {getExplorerUrl() && (
                    <a
                      href={getExplorerUrl()!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      View on Explorer
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
              <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-red-600">Transaction Failed</h3>
              <p className="text-sm text-muted-foreground">
                {error || 'Something went wrong with your transaction'}
              </p>
              {error && (
                <div className="mt-4 bg-destructive/10 rounded-lg p-3 max-w-md">
                  <p className="text-xs text-destructive text-left">{error}</p>
                </div>
              )}
            </div>
          </div>
        );

      default: // 'idle' state - show confirmation details
        return (
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

              {gasEstimate && (
                <>
                  <div className="text-sm font-medium text-muted-foreground">Gas Price</div>
                  <div className="col-span-3 text-sm">
                    {gasEstimate.loading ? (
                      <span className="inline-flex items-center">
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Estimating...
                      </span>
                    ) : gasEstimate.error ? (
                      <span className="text-destructive inline-flex items-center">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Estimate failed
                      </span>
                    ) : (
                      `${(gasEstimate.gasPrice / 1e8).toFixed(8)} ${token}`
                    )}
                  </div>

                  <div className="text-sm font-medium text-muted-foreground">Gas Limit</div>
                  <div className="col-span-3 text-sm">
                    {gasEstimate.loading ? '...' : gasEstimate.gasLimit.toLocaleString()} units
                  </div>

                  <div className="text-sm font-medium text-muted-foreground">Max Fee</div>
                  <div className="col-span-3 text-sm font-medium">
                    {gasEstimate.loading ? (
                      '...'
                    ) : gasEstimate.error ? (
                      'N/A'
                    ) : (
                      <>
                        {gasEstimate.gasFee.toFixed(8)} {token}
                        {gasEstimate.gasFeeUSD !== null && (
                          <span className="ml-2 text-muted-foreground">
                            (${gasEstimate.gasFeeUSD.toFixed(2)})
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {gasEstimate?.error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {gasEstimate.error}
                </div>
                <p className="mt-1 text-xs">
                  You can still try to submit the transaction, but it might fail.
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  // Render footer based on state
  const renderFooter = () => {
    if (state === 'success' || state === 'error') {
      return (
        <Button onClick={onClose} className="w-full">
          {state === 'success' ? 'Done' : 'Close'}
        </Button>
      );
    }

    if (state === 'signing' || state === 'pending') {
      return (
        <div className="text-center text-sm text-muted-foreground">
          {state === 'signing' ? 'Check your wallet...' : 'Please wait...'}
        </div>
      );
    }

    return (
      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={gasEstimate?.loading && !gasEstimate?.error}
        >
          Confirm Transaction
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && state === 'idle' && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {state === 'signing'
              ? 'Sign Transaction'
              : state === 'pending'
              ? 'Transaction Pending'
              : state === 'success'
              ? 'Transaction Complete'
              : state === 'error'
              ? 'Transaction Failed'
              : title}
          </DialogTitle>
          {state === 'idle' && description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {state === 'idle' && (
          <SecurityWarning transaction={transactionForAnalysis} className="mb-4" />
        )}

        {renderContent()}

        <DialogFooter>{renderFooter()}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
