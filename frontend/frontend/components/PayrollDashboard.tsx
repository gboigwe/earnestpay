import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Download,
  Eye,
  CreditCard,
  Shield,
  Copy
} from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { GradientButton, FloatingActionButton } from './ui/enhanced-button';
import { ModernNavigation } from './ModernNavigation';
import { executeDuePayments } from '@/utils/payroll';
import { getEmployee as getEmployeeFromCache } from '@/lib/employeeCache';
import { CompanyStatus } from './CompanyStatus';
import { CompanyPortal } from './CompanyPortal';
import { toast } from './ui/use-toast';
import { ProcessPayroll } from './ProcessPayroll';
import { EmployeeProfileForm } from './EmployeeProfileForm';
import { SchedulerManager } from './SchedulerManager';
import { TaxCompliance } from './TaxCompliance';
import { EmployeePortal } from './EmployeePortal';
import { getEmployeeProfileCreatedEvents, getPaymentProcessedEvents } from '@/utils/payroll';

// Recent on-chain transactions (PaymentProcessed events)
type RecentPayment = { addr: string; label: string; amountOctas: number; txHash?: string; version?: string; timestamp?: string };

// (removed mockEmployees)

interface PayrollDashboardProps {
  onBack: () => void;
  onViewTransactions: () => void;
}

export const PayrollDashboard: React.FC<PayrollDashboardProps> = ({ onBack, onViewTransactions }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { account, signAndSubmitTransaction } = useWallet();
  const [executing, setExecuting] = useState(false);
  const [employeeRows, setEmployeeRows] = useState<any[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesReloadKey, setEmployeesReloadKey] = useState(0);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recent, setRecent] = useState<RecentPayment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<RecentPayment[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 10;

  // (removed unused helpers decodeBytes, roleLabelFromCode)

  function shortAddress(addr: string): string {
    const a = (addr || '').toString();
    if (!a.startsWith('0x') || a.length < 14) return a;
    return `${a.slice(0, 6)}...${a.slice(-4)}`;
  }

  function formatAmount(n: any): string {
    const v = Number(n);
    if (!isFinite(v)) return '-';
    return `₳${Math.trunc(v).toLocaleString()}`;
  }

  function formatAptFromOctas(octas: any): string {
    const v = Number(octas);
    if (!isFinite(v)) return '₳0.00';
    const apt = v / 1e8;
    return `₳${apt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
  }

  async function copyToClipboard(text: string) {
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
      toast({ title: 'Copy failed', description: e?.message ?? String(e), variant: 'destructive' });
    }
  }

  React.useEffect(() => {
    async function loadEmployees() {
      const addr = (account?.address as any)?.toString?.() ?? (account?.address ? String(account.address) : '');
      if (!addr) { setEmployeeRows([]); return; }
      setEmployeesLoading(true);
      try {
        const evs = await getEmployeeProfileCreatedEvents(addr, 100);
        // Map to a simplified row set; newest first
        const rows = (evs || []).map(({ event }) => {
          const d = event.data || {};
          return {
            employee: d.employee || d.employee_address || d.addr || '',
            // Current on-chain event does not include name/email/department/role; leave empty.
            firstName: '',
            lastName: '',
            department: '',
            role: undefined,
            email: '',
            monthlySalary: undefined as undefined | number,
          };
        }).reverse();
        // De-duplicate by employee address, keep latest
        const seen = new Set<string>();
        const uniq: any[] = [];
        for (const r of rows) {
          const key = (r.employee || '').toLowerCase();
          if (!key || seen.has(key)) continue;
          seen.add(key);
          uniq.push(r);
        }
        // Enrich with client-side cache data (saved on profile creation)
        const enriched = uniq.map((r) => {
          const cache = getEmployeeFromCache((r.employee || '').toLowerCase());
          if (!cache) return r;
          return {
            ...r,
            firstName: cache.firstName || r.firstName,
            lastName: cache.lastName || r.lastName,
            department: cache.department || r.department,
            email: cache.email || r.email,
            monthlySalary: typeof cache.monthlySalary === 'number' ? cache.monthlySalary : r.monthlySalary,
            role: typeof cache.roleCode === 'number' ? cache.roleCode : r.role,
          };
        });
        setEmployeeRows(enriched);
      } catch {
        setEmployeeRows([]);
      } finally {
        setEmployeesLoading(false);
      }
    }
    loadEmployees();
  }, [account?.address, employeesReloadKey]);

  // Load payment history when the tab is opened
  React.useEffect(() => {
    async function loadHistory() {
      const addr = (account?.address as any)?.toString?.() ?? (account?.address ? String(account.address) : '');
      if (!addr) { setHistory([]); return; }
      setHistoryLoading(true);
      try {
        const pairs = await getPaymentProcessedEvents(addr, 200);
        const items = (pairs || []).map(({ event, tx }: any) => {
          const d = event?.data || {};
          const emp = String(d.employee || d.employee_address || d.addr || '');
          const amountOctas = Number(d.amount ?? 0);
          const labelCache = getEmployeeFromCache(emp.toLowerCase());
          const label = labelCache ? [labelCache.firstName, labelCache.lastName].filter(Boolean).join(' ') : '';
          return { addr: emp, label, amountOctas, txHash: tx?.hash, version: tx?.version, timestamp: tx?.timestamp } as RecentPayment;
        }).filter((x: RecentPayment) => x.addr);
        items.sort((a: any, b: any) => Number(b.version||0) - Number(a.version||0));
        setHistory(items);
        setHistoryPage(1);
      } catch {
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    }
    if (activeTab === 'payment-history') {
      loadHistory();
    }
  }, [activeTab, account?.address]);

  React.useEffect(() => {
    async function loadRecent() {
      const addr = (account?.address as any)?.toString?.() ?? (account?.address ? String(account.address) : '');
      if (!addr) { setRecent([]); return; }
      setRecentLoading(true);
      try {
        const pairs = await getPaymentProcessedEvents(addr, 50);
        // Map newest first
        const items = (pairs || []).map(({ event, tx }: any) => {
          const d = event?.data || {};
          const emp = String(d.employee || d.employee_address || d.addr || '');
          const amountOctas = Number(d.amount ?? 0);
          const labelCache = getEmployeeFromCache(emp.toLowerCase());
          const label = labelCache ? [labelCache.firstName, labelCache.lastName].filter(Boolean).join(' ') : '';
          return {
            addr: emp,
            label,
            amountOctas,
            txHash: tx?.hash,
            version: tx?.version,
            timestamp: tx?.timestamp,
          } as RecentPayment;
        }).filter((x: RecentPayment) => x.addr);
        items.sort((a: any, b: any) => Number(b.version||0) - Number(a.version||0));
        setRecent(items.slice(0, 10));
      } catch {
        setRecent([]);
      } finally {
        setRecentLoading(false);
      }
    }
    loadRecent();
  }, [account?.address]);

  const onEmployeeCreated = () => setEmployeesReloadKey((k) => k + 1);

  const onExecuteDuePayments = async () => {
    if (!account) return;
    setExecuting(true);
    try {
      const walletLike: any = { account, signAndSubmitTransaction };
      await executeDuePayments(walletLike);
      toast({ title: 'Scheduled payments executed' });
    } finally {
      setExecuting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const renderDashboard = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Grid - Simplified, real data shown in CompanyStatus below */}
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

      {/* On-chain Company Status (full width of content area) */}
      <motion.div variants={itemVariants}>
        <div className="w-full">
          <CompanyStatus />
        </div>
      </motion.div>

      {/* Charts Section - Disabled until real data aggregation */}
      {false && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader><CardTitle>Payroll Trends</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Analytics coming soon</p>
                    <p className="text-xs mt-1">Process payments to see trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader><CardTitle>Department Spending</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Analytics coming soon</p>
                    <p className="text-xs mt-1">Add employees to see breakdown</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('payment-history')}>
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLoading && (
                <div className="text-sm text-gray-500">Loading recent payments...</div>
              )}
              {!recentLoading && recent.length === 0 && (
                <div className="text-sm text-gray-500">No recent payments.</div>
              )}
              {!recentLoading && recent.map((p, idx) => {
                const name = p.label || shortAddress(p.addr);
                const hashShort = p.txHash ? `${p.txHash.slice(0, 10)}...` : '';
                const time = p.timestamp ? new Date(Number(p.timestamp)/1000).toLocaleString() : '';
                return (
                  <div key={`${p.addr}-${p.version || idx}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-gray-500">Payment • {shortAddress(p.addr)} {hashShort && `• ${hashShort}`}</p>
                      {time && <p className="text-xs text-gray-400">{time}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatAptFromOctas(p.amountOctas)}</p>
                      <p className="text-xs text-green-600">Success</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GradientButton 
                variant="primary"
                className="h-24 flex flex-col gap-2"
                onClick={() => setActiveTab('process-payroll')}
                icon={<DollarSign className="h-6 w-6" />}
                iconPosition="left"
              >
                <span className="text-sm font-medium">Process Payroll</span>
              </GradientButton>
              <GradientButton 
                variant="secondary"
                className="h-24 flex flex-col gap-2"
                onClick={() => setActiveTab('add-employee')}
                icon={<Plus className="h-6 w-6" />}
                iconPosition="left"
              >
                <span className="text-sm font-medium">Add Employee</span>
              </GradientButton>
              <GradientButton 
                variant="success"
                className="h-24 flex flex-col gap-2"
                onClick={() => setActiveTab('payment-history')}
                icon={<Download className="h-6 w-6" />}
                iconPosition="left"
              >
                <span className="text-sm font-medium">Export Reports</span>
              </GradientButton>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderPaymentHistory = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">Payment History</h2>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              All Payments
            </CardTitle>
            <div className="text-sm text-gray-500">{historyLoading ? 'Loading…' : `${history.length} item(s)`}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!historyLoading && history.length === 0 && (
              <div className="text-sm text-gray-500">No payment events found.</div>
            )}
            {history
              .slice((historyPage-1)*historyPageSize, historyPage*historyPageSize)
              .map((p, idx) => {
                const name = p.label || shortAddress(p.addr);
                const hashShort = p.txHash ? `${p.txHash.slice(0, 10)}...` : '';
                const time = p.timestamp ? new Date(Number(p.timestamp)/1000).toLocaleString() : '';
                return (
                  <div key={`${p.addr}-${p.version || idx}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-gray-500">Payment • {shortAddress(p.addr)} {hashShort && `• ${hashShort}`}</p>
                      {time && <p className="text-xs text-gray-400">{time}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatAptFromOctas(p.amountOctas)}</p>
                      <p className="text-xs text-green-600">Success</p>
                    </div>
                  </div>
                );
              })}
          </div>
          {history.length > historyPageSize && (
            <div className="flex items-center justify-between text-sm mt-4">
              <div>Page {historyPage} of {Math.ceil(history.length / historyPageSize)}</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setHistoryPage(p => Math.max(1, p-1))} disabled={historyPage === 1}>Prev</Button>
                <Button variant="outline" onClick={() => setHistoryPage(p => Math.min(Math.ceil(history.length / historyPageSize), p+1))} disabled={historyPage >= Math.ceil(history.length / historyPageSize)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderEmployeeList = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Employee Management</h2>
        <Button onClick={() => setActiveTab('add-employee')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {employeesLoading && (
              <div className="text-sm text-gray-500">Loading employees from chain...</div>
            )}
            {!employeesLoading && employeeRows.length === 0 && (
              <div className="text-sm text-gray-500">No employees found yet. Create one to get started.</div>
            )}
            {!employeesLoading && employeeRows.map((employee) => {
              const fullName = [employee.firstName, employee.lastName].filter(Boolean).join(' ');
              const displayName = fullName || shortAddress(employee.employee) || 'Employee';
              const dept = employee.department || '';
              const fullAddr = String(employee.employee || '');
              const short = shortAddress(fullAddr);
              const email = employee.email || '';
              const salaryStr = typeof employee.monthlySalary === 'number' ? formatAmount(employee.monthlySalary) : '';
              return (
              <div key={(employee.employee || '').toLowerCase()} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{displayName}</p>
                    <p className="text-sm text-gray-500">{dept ? `• ${dept}` : '• Department unavailable'}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{short}</span>
                      {fullAddr && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-100 text-gray-600"
                          onClick={() => copyToClipboard(fullAddr)}
                          aria-label="Copy address"
                          title="Copy address"
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{email || 'Email unavailable'}</p>
                  <p className="font-medium mt-1">{salaryStr || 'Salary unavailable'}</p>
                </div>
              </div>
            )})}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderPayrollProcessing = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">Process Payroll</h2>

      {/* Dynamic Payroll Processor (employee selection, scheduled toggle, CSV, etc.) */}
      <Card>
        <CardContent className="p-6">
          <ProcessPayroll />
        </CardContent>
      </Card>

      {/* Smart Contract Execution: Execute Due Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Smart Contract Payroll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button size="lg" className="w-full bg-blue-500 hover:bg-blue-600" onClick={onExecuteDuePayments} disabled={executing}>
              <DollarSign className="h-5 w-5 mr-2" />
              {executing ? 'Executing...' : 'Execute Due Payments'}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This will trigger the smart contract to process all payments automatically
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'employee-list':
      case 'employees':
        return renderEmployeeList();
      case 'process-payroll':
        return renderPayrollProcessing();
      case 'payment-history':
        return renderPaymentHistory();
      case 'add-employee':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Add New Employee</h2>
            <Card>
              <CardContent className="p-6">
                <EmployeeProfileForm onCreated={onEmployeeCreated} />
              </CardContent>
            </Card>
          </div>
        );
      case 'schedules':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Payroll Schedules</h2>
            <Card>
              <CardContent className="p-6">
                <SchedulerManager />
              </CardContent>
            </Card>
          </div>
        );
      case 'employee-portal':
        return (
          <div className="space-y-6">
            <EmployeePortal />
          </div>
        );
      case 'compliance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tax & Compliance</h2>
            <TaxCompliance />
          </div>
        );
      case 'company-portal':
        return (
          <div className="space-y-6">
            <CompanyPortal />
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ModernNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSidebarToggle={setIsSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} min-h-screen`}>
        {/* Mobile Header Spacer */}
        <div className="h-16 lg:hidden"></div>
        
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EarnestPay Dashboard</h1>
              <p className="text-gray-500">Connected: {account?.address.toString().slice(0, 8)}...{account?.address.toString().slice(-6)}</p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={onViewTransactions}>
                View All Transactions
              </Button>
              <Button variant="ghost" size="sm" onClick={onBack}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Button for Quick Payroll */}
      {activeTab === 'dashboard' && (
        <FloatingActionButton
          icon={<DollarSign className="h-6 w-6" />}
          onClick={() => setActiveTab('process-payroll')}
          variant="primary"
        />
      )}
    </div>
  );
};