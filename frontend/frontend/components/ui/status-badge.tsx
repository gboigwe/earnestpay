import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'inactive' | 'warning' | 'success' | 'failed';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = 'md',
  showIcon = true,
  pulse = false,
  className = ''
}) => {
  const statusConfig = {
    active: {
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle,
      defaultText: 'Active'
    },
    success: {
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle,
      defaultText: 'Success'
    },
    pending: {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: Clock,
      defaultText: 'Pending'
    },
    inactive: {
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: XCircle,
      defaultText: 'Inactive'
    },
    failed: {
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: XCircle,
      defaultText: 'Failed'
    },
    warning: {
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      icon: AlertCircle,
      defaultText: 'Warning'
    }
  };

  const sizes = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const displayText = text || config.defaultText;

  return (
    <motion.span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.color,
        sizes[size],
        pulse && 'animate-pulse',
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {displayText}
    </motion.span>
  );
};

export const TransactionStatus: React.FC<{
  hash?: string;
  status: 'pending' | 'success' | 'failed';
  network?: string;
  amount?: number;
  timestamp?: string;
}> = ({ hash, status, network = 'Aptos', amount, timestamp }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending': 
        return { 
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: <Clock className="animate-pulse" size={16} />
        };
      case 'success': 
        return { 
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <CheckCircle size={16} />
        };
      case 'failed': 
        return { 
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <XCircle size={16} />
        };
      default: 
        return { 
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: null 
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <motion.div
      className={cn(
        'rounded-lg p-4 border',
        statusConfig.color
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {statusConfig.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium capitalize">
              Transaction {status}
            </p>
            {amount && (
              <p className="text-sm font-semibold">
                ₳{amount.toLocaleString()}
              </p>
            )}
          </div>
          {hash && (
            <p className="text-xs text-gray-500 truncate mt-1 font-mono">
              {hash}
            </p>
          )}
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              {network} Network
            </p>
            {timestamp && (
              <p className="text-xs text-gray-500">
                {timestamp}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface TrendBadgeProps {
  value: number;
  isPositive?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({
  value,
  isPositive,
  showIcon = true,
  size = 'md'
}) => {
  const positive = isPositive ?? value >= 0;
  
  const sizes = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1',
    lg: 'text-base px-3 py-1.5 gap-1.5'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <motion.span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizes[size],
        positive 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {showIcon && (
        positive ? 
          <TrendingUp size={iconSizes[size]} /> : 
          <TrendingDown size={iconSizes[size]} />
      )}
      {positive ? '+' : ''}{value}%
    </motion.span>
  );
};