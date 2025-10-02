import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  gradient = "from-blue-500 to-purple-600",
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      <Card className="border-0 bg-gradient-to-br text-white relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <CardContent className="relative z-10 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-white">{value}</h3>
                {trend && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    trend.isPositive 
                      ? 'bg-green-400/20 text-green-300' 
                      : 'bg-red-400/20 text-red-300'
                  }`}>
                    {trend.isPositive ? '+' : ''}{trend.value}%
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-white/60 text-xs mt-1">{subtitle}</p>
              )}
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={hover ? { scale: 1.02 } : undefined}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6",
        "shadow-lg hover:shadow-xl transition-all duration-300",
        "hover:bg-white/10 hover:border-white/20",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

interface TransactionCardProps {
  transaction: {
    id: string;
    employee: string;
    amount: number;
    type: string;
    status: 'success' | 'pending' | 'failed';
    hash: string;
    timestamp?: string;
  };
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const statusConfig = {
    success: { bg: 'bg-green-100', text: 'text-green-700', label: 'Success' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' }
  };

  const config = statusConfig[transaction.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-sm">
            {transaction.employee.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{transaction.employee}</p>
          <p className="text-sm text-gray-500">
            {transaction.type} • {transaction.hash}
          </p>
          {transaction.timestamp && (
            <p className="text-xs text-gray-400">{transaction.timestamp}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">₳{transaction.amount.toLocaleString()}</p>
        <div className={`text-xs px-2 py-1 rounded-full inline-block ${config.bg} ${config.text}`}>
          {config.label}
        </div>
      </div>
    </motion.div>
  );
};