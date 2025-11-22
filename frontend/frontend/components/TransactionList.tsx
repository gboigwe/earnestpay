import React from 'react';
import { Clock, CheckCircle2, XCircle, ExternalLink, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { TransactionListProps } from '@/types/transactions';
// Format date to relative time (e.g., '2 days ago')
const formatRelativeTime = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  } as const;

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 
        ? `${interval} ${unit} ago`
        : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-yellow-500" />;
  }
};

const getChainName = (chain: string) => {
  return chain.charAt(0).toUpperCase() + chain.slice(1);
};

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions = [],
  isLoading = false,
  error = null,
  onRefresh
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transaction History</CardTitle>
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transaction History</CardTitle>
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p>Failed to load transactions</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transaction History</CardTitle>
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No transactions found</p>
            <p className="text-sm mt-2">Your transaction history will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Transaction History</CardTitle>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {transactions.map((tx) => (
            <div key={tx.hash} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    {tx.type === 'payment' ? (
                      <ArrowUpRight className="h-5 w-5 text-blue-500" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {tx.type === 'payment' ? 'Sent' : 'Received'} {tx.amount} {tx.token}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {getChainName(tx.chain)}
                      </span>
                      {getStatusIcon(tx.status)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {tx.label || (tx.type === 'payment' ? `To: ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : `From: ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatRelativeTime(tx.timestamp)}
                    </p>
                  </div>
                </div>
                <a
                  href={tx.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
