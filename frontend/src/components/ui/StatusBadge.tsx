import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'inactive' | 'warning';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = 'md',
  showIcon = true,
  pulse = false
}) => {
  const statusConfig = {
    active: {
      color: 'status-active',
      icon: CheckCircle,
      defaultText: 'Active'
    },
    pending: {
      color: 'status-pending',
      icon: Clock,
      defaultText: 'Pending'
    },
    inactive: {
      color: 'status-inactive',
      icon: XCircle,
      defaultText: 'Inactive'
    },
    warning: {
      color: 'status-warning',
      icon: AlertCircle,
      defaultText: 'Warning'
    }
  };

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
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
      className={`status-indicator ${config.color} ${sizes[size]} ${pulse ? 'pulse' : ''}`}
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
}> = ({ hash, status, network = 'Aptos' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending': return <Clock className="animate-pulse" size={16} />;
      case 'success': return <CheckCircle size={16} />;
      case 'failed': return <XCircle size={16} />;
      default: return null;
    }
  };

  return (
    <motion.div
      className="glass rounded-lg p-3 flex items-center gap-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={getStatusColor()}>
        {getStatusIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${getStatusColor()}`}>
          Transaction {status}
        </p>
        {hash && (
          <p className="text-xs text-gray-400 truncate">
            {hash}
          </p>
        )}
        <p className="text-xs text-gray-500">
          {network} Network
        </p>
      </div>
    </motion.div>
  );
};