import { Loader2, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GasEstimateBadgeProps {
  gasEstimate: {
    gasFee: number;
    gasFeeUSD: number | null;
    gasPrice: number;
    gasLimit: number;
    loading: boolean;
    error: string | null;
  };
  className?: string;
  showDetails?: boolean;
}

export function GasEstimateBadge({ 
  gasEstimate, 
  className,
  showDetails = false
}: GasEstimateBadgeProps) {
  if (gasEstimate.loading) {
    return (
      <div className={cn("inline-flex items-center text-sm text-muted-foreground", className)}>
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        Estimating gas...
      </div>
    );
  }

  if (gasEstimate.error) {
    return (
      <div className={cn("inline-flex items-center text-sm text-destructive", className)}>
        <AlertCircle className="mr-1 h-3 w-3" />
        Gas estimate failed
      </div>
    );
  }

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <div className="inline-flex items-center text-sm">
        <Zap className="mr-1 h-3 w-3 text-yellow-500" />
        <span className="font-medium">
          {gasEstimate.gasFee.toFixed(6)} {gasEstimate.gasFeeUSD ? `($${gasEstimate.gasFeeUSD.toFixed(2)})` : ''}
        </span>
      </div>
      
      {showDetails && (
        <div className="text-xs text-muted-foreground pl-4">
          <div>Gas Price: {gasEstimate.gasPrice} wei</div>
          <div>Gas Limit: {gasEstimate.gasLimit.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
