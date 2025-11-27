import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useWalletAnalytics, WalletAnalytics } from '@/hooks/useWalletAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

/**
 * WalletAnalyticsDashboard Component
 *
 * Displays comprehensive wallet analytics including:
 * - Connection success/failure rates
 * - Network switch patterns
 * - Transaction statistics
 * - Error tracking
 * - Session duration
 */

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendValue, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    red: 'bg-red-500/10 text-red-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    purple: 'bg-purple-500/10 text-purple-500'
  };

  return (
    <motion.div
      className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-400 mb-1">{title}</div>
          <div className="text-2xl font-bold text-white">{value}</div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export const WalletAnalyticsDashboard: React.FC = () => {
  const { getAnalytics, clearAnalytics, exportAnalytics } = useWalletAnalytics();
  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = () => {
    setAnalytics(getAnalytics());
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAnalytics();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      clearAnalytics();
      loadAnalytics();
    }
  };

  const handleExport = () => {
    exportAnalytics();
  };

  if (!analytics) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center text-gray-400">
          Loading analytics...
        </CardContent>
      </Card>
    );
  }

  const connectionSuccessRate = analytics.totalConnections > 0
    ? ((analytics.successfulConnections / analytics.totalConnections) * 100).toFixed(1)
    : '0';

  const transactionSuccessRate = analytics.totalTransactions > 0
    ? ((analytics.confirmedTransactions / analytics.totalTransactions) * 100).toFixed(1)
    : '0';

  const sessionDurationMinutes = Math.floor(analytics.totalSessionDuration / 60000);

  const topWallet = Object.entries(analytics.connectionsByWallet)
    .sort(([, a], [, b]) => b - a)[0];

  const topChain = Object.entries(analytics.switchesByChain)
    .sort(([, a], [, b]) => b - a)[0];

  const topError = Object.entries(analytics.errorsByType)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Wallet Analytics
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              {analytics.eventsCount} events tracked • {sessionDurationMinutes}min total session time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 px-3 text-gray-400 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-8 px-3 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Connection Success Rate"
              value={`${connectionSuccessRate}%`}
              icon={<CheckCircle2 className="h-5 w-5" />}
              color={parseFloat(connectionSuccessRate) >= 80 ? 'green' : 'yellow'}
            />
            <StatCard
              title="Total Connections"
              value={analytics.totalConnections}
              icon={<Activity className="h-5 w-5" />}
              color="blue"
            />
            <StatCard
              title="Network Switches"
              value={analytics.networkSwitches}
              icon={<Zap className="h-5 w-5" />}
              color="purple"
            />
            <StatCard
              title="Total Errors"
              value={analytics.totalErrors}
              icon={<AlertCircle className="h-5 w-5" />}
              color={analytics.totalErrors > 10 ? 'red' : 'yellow'}
            />
          </div>
        </div>

        {/* Transaction Stats */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Transactions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Success Rate"
              value={`${transactionSuccessRate}%`}
              icon={<CheckCircle2 className="h-5 w-5" />}
              color={parseFloat(transactionSuccessRate) >= 90 ? 'green' : 'yellow'}
            />
            <StatCard
              title="Confirmed"
              value={analytics.confirmedTransactions}
              icon={<CheckCircle2 className="h-5 w-5" />}
              color="green"
            />
            <StatCard
              title="Failed"
              value={analytics.failedTransactions}
              icon={<XCircle className="h-5 w-5" />}
              color="red"
            />
          </div>
        </div>

        {/* Top Performers */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Top Usage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Most Used Wallet</div>
              <div className="text-lg font-semibold text-white">
                {topWallet ? topWallet[0] : 'N/A'}
              </div>
              {topWallet && (
                <div className="text-xs text-gray-500 mt-1">
                  {topWallet[1]} connection{topWallet[1] !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Most Switched Chain</div>
              <div className="text-lg font-semibold text-white">
                {topChain ? topChain[0] : 'N/A'}
              </div>
              {topChain && (
                <div className="text-xs text-gray-500 mt-1">
                  {topChain[1]} switch{topChain[1] !== 1 ? 'es' : ''}
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Most Common Error</div>
              <div className="text-lg font-semibold text-white truncate" title={topError ? topError[0] : 'N/A'}>
                {topError ? topError[0] : 'N/A'}
              </div>
              {topError && (
                <div className="text-xs text-gray-500 mt-1">
                  {topError[1]} occurrence{topError[1] !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Connections by Wallet */}
          {Object.keys(analytics.connectionsByWallet).length > 0 && (
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-3">Connections by Wallet</h4>
              <div className="space-y-2">
                {Object.entries(analytics.connectionsByWallet)
                  .sort(([, a], [, b]) => b - a)
                  .map(([wallet, count]) => (
                    <div key={wallet} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{wallet}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Transactions by Chain */}
          {Object.keys(analytics.transactionsByChain).length > 0 && (
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-3">Transactions by Chain</h4>
              <div className="space-y-2">
                {Object.entries(analytics.transactionsByChain)
                  .sort(([, a], [, b]) => b - a)
                  .map(([chain, count]) => (
                    <div key={chain} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{chain}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Errors by Type */}
          {Object.keys(analytics.errorsByType).length > 0 && (
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-3">Errors by Type</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(analytics.errorsByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 truncate" title={type}>{type}</span>
                      <span className="text-red-400 ml-2">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Network Switches */}
          {Object.keys(analytics.switchesByChain).length > 0 && (
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-3">Network Switches</h4>
              <div className="space-y-2">
                {Object.entries(analytics.switchesByChain)
                  .sort(([, a], [, b]) => b - a)
                  .map(([chain, count]) => (
                    <div key={chain} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{chain}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-400 leading-relaxed">
            <strong>Privacy Notice:</strong> All analytics data is stored locally in your browser.
            No personally identifiable information (PII) is collected or transmitted.
            Only wallet types, chain IDs, and event counts are tracked.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletAnalyticsDashboard;
