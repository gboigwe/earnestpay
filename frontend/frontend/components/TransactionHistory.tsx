import React from 'react';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import TransactionList from './TransactionList';
import useTransactionHistory from '@/hooks/useTransactionHistory';

interface TransactionHistoryProps {
  onBack: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onBack }) => {
  const { transactions, isLoading, error, refresh } = useTransactionHistory();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-4"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Transaction History</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        <TransactionList 
          transactions={transactions} 
          isLoading={isLoading} 
          error={error}
          onRefresh={refresh}
        />
      </div>
    </div>
  );
};

export default TransactionHistory;
