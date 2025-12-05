import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Users, TrendingUp, Plus, Download, Eye, CreditCard, Shield, Copy } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { GradientButton, FloatingActionButton } from '../ui/enhanced-button';
import { executeDuePayments } from '@/utils/payroll';
import { getEmployeeFromCache } from '@/lib/employeeCache';
import { CompanyStatus } from '../CompanyStatus';
import { toast } from '../ui/use-toast';
import { EmployeeProfileForm } from '../EmployeeProfileForm';
import { TaxCompliance } from '../TaxCompliance';
import { getEmployeeProfileCreatedEvents, getPaymentProcessedEvents } from '@/utils/payroll';
import { WalletBalanceWidget } from '../WalletBalanceWidget';

// Types
type RecentPayment = {
  addr: string;
  label: string;
  amountOctas: number;
  txHash?: string;
  version?: string;
  timestamp?: string;
};

interface PayrollDashboardProps {
  onBack: () => void;
  onViewTransactions: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

// Memoized components
const MemoizedCompanyStatus = React.memo(CompanyStatus);
const MemoizedWalletBalanceWidget = React.memo(WalletBalanceWidget);

export const PayrollDashboard: React.FC<PayrollDashboardProps> = React.memo(({ onBack, onViewTransactions }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { account, signAndSubmitTransaction } = useWallet();
  const [executing, setExecuting] = useState(false);
  const [employeeRows, setEmployeeRows] = useState<Array<{
    employee: string;
    firstName: string;
    lastName: string;
    department: string;
    role?: number;
    email: string;
    monthlySalary?: number;
  }>>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesReloadKey, setEmployeesReloadKey] = useState(0);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recent, setRecent] = useState<RecentPayment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<RecentPayment[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 10;

  // Memoized utility functions
  const formatAptFromOctas = useCallback((octas: number | string): string => {
    const v = Number(octas);
    if (!isFinite(v)) return '₳0.00';
    const apt = v / 1e8;
    return `₳${apt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    const t = text || '';
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(t);
      } else {
        const el = document.createElement('textarea');
        el.value = t;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      toast({ title: 'Copied to clipboard' });
    } catch (e: any) {
      toast({ 
        title: 'Copy failed', 
        description: e?.message ?? String(e), 
        variant: 'destructive' 
      });
    }
  }, []);

  // Memoized data fetching
  const loadEmployees = useCallback(async () => {
    const addr = account?.address?.toString() || '';
    if (!addr) {
      setEmployeeRows([]);
      return;
    }
    
    setEmployeesLoading(true);
    try {
      const evs = await getEmployeeProfileCreatedEvents(addr, 100);
      // Process and deduplicate employees
      const rows = Array.from(
        new Map(
          (evs || [])
            .map(({ event }) => {
              const d = event.data || {};
              const employee = d.employee || d.employee_address || d.addr || '';
              return [employee.toLowerCase(), {
                employee,
                firstName: '',
                lastName: '',
                department: '',
                role: undefined,
                email: '',
                monthlySalary: undefined,
              }];
            })
        ).values()
      );

      // Enrich with cache data
      const enriched = rows.map((r) => {
        const cache = getEmployeeFromCache((r.employee || '').toLowerCase());
        return cache ? { ...r, ...cache } : r;
      });

      setEmployeeRows(enriched);
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployeeRows([]);
    } finally {
      setEmployeesLoading(false);
    }
  }, [account?.address]);

  // Load employees when account changes or reload is triggered
  React.useEffect(() => {
    loadEmployees();
  }, [loadEmployees, employeesReloadKey]);

  // Other effects and handlers would go here...
  // [Previous useEffect hooks for loading history and recent payments]

  // Render functions for different tabs
  const renderDashboard = useCallback(() => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Your Payroll Dashboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Manage your company's payroll on Aptos blockchain</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Secure blockchain payments</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Real-time transaction tracking</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span>One wallet = One company</span>
          </div>
        </div>
      </div>

      {/* On-chain Company Status and Wallet Balances */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="w-full">
          <MemoizedCompanyStatus />
        </div>
        <div className="w-full">
          <MemoizedWalletBalanceWidget />
        </div>
      </motion.div>
    </motion.div>
  ), []);

  // Render loading state
  if (employeesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && renderDashboard()}
        </AnimatePresence>
      </div>
    </div>
  );
});

PayrollDashboard.displayName = 'PayrollDashboard';

export default PayrollDashboard;
