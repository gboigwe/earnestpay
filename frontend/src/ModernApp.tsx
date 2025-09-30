import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp, 
  Award,
  Plus,
  Filter,
  Download,
  Eye,
  CreditCard
} from 'lucide-react';

// Import our modern components
import { ModernCard, StatCard, GlassCard } from './components/ui/ModernCard';
import { ModernButton, FloatingActionButton } from './components/ui/ModernButton';
import { StatusBadge } from './components/ui/StatusBadge';
import { PayrollInsightsChart, DepartmentSpendingChart } from './components/charts/ModernChart';
import { ModernNavigation } from './components/navigation/ModernNavigation';
import { EmployeePortal } from './EmployeePortal';
import { useWallet } from './WalletProvider';
import { MODULES, fn } from './services/config';
import { payrollService } from './services/payroll';

// Import styles
import './styles/globals.css';

// Mock data for the dashboard
const mockPayrollData = [
  { name: 'Jan', value: 45000 },
  { name: 'Feb', value: 48000 },
  { name: 'Mar', value: 52000 },
  { name: 'Apr', value: 49000 },
  { name: 'May', value: 55000 },
  { name: 'Jun', value: 58000 }
];

const mockDepartmentData = [
  { name: 'Engineering', value: 45 },
  { name: 'Marketing', value: 25 },
  { name: 'Sales', value: 20 },
  { name: 'Operations', value: 10 }
];

const mockRecentTransactions = [
  { id: '1', employee: 'John Doe', amount: 5000, type: 'Salary', status: 'success', hash: '0x1234...5678' },
  { id: '2', employee: 'Jane Smith', amount: 6250, type: 'Salary', status: 'success', hash: '0xabcd...efgh' },
  { id: '3', employee: 'Bob Johnson', amount: 4500, type: 'Salary', status: 'pending', hash: '0x9876...5432' },
  { id: '4', employee: 'Alice Brown', amount: 1000, type: 'Bonus', status: 'success', hash: '0xfedc...ba98' }
];

const mockEmployees = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@company.com',
    role: 'Senior Engineer',
    department: 'Engineering',
    salary: 95000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@company.com',
    role: 'Product Manager',
    department: 'Product',
    salary: 105000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3fd?w=32&h=32&fit=crop&crop=face&auto=format'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@company.com',
    role: 'Marketing Lead',
    department: 'Marketing',
    salary: 85000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face&auto=format'
  }
];

interface ModernAppProps {
  walletConnected?: boolean;
  walletAddress?: string;
  onWalletConnect?: () => void;
}

export const ModernApp: React.FC<ModernAppProps> = ({
  walletConnected = false,
  walletAddress,
  onWalletConnect = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentView, setCurrentView] = useState<'dashboard' | 'employee'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { connected, connect, signAndSubmit, account } = useWallet();
  const [showRegister, setShowRegister] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  const [txMessage, setTxMessage] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [showFund, setShowFund] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployeeAddress, setNewEmployeeAddress] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [companyStatus, setCompanyStatus] = useState<{
    name?: string;
    owner?: string;
    treasury?: number;
    employees?: number;
    active?: boolean;
  } | null>(null);
  const [showProcessPayroll, setShowProcessPayroll] = useState(false);
  const [ppEmployeeAddress, setPpEmployeeAddress] = useState('');
  const [ppAmount, setPpAmount] = useState('');

  // Load company status when wallet connects
  React.useEffect(() => {
    const loadStatus = async () => {
      if (!account?.address) {
        setCompanyStatus(null);
        return;
      }
      try {
        setStatusLoading(true);
        // First, cheap existence check using is_employee (returns false if company does not exist)
        const exists = await payrollService.isEmployee(account.address, account.address);
        if (!exists) {
          setCompanyStatus(null);
          return;
        }
        const info = await payrollService.getCompanyInfo(account.address);
        // info returns (name, owner, treasury_balance, employee_count, is_active)
        if (info && Array.isArray(info) && info.length >= 5) {
          const [nameVec, owner, treasury, empCount, active] = info as any[];
          // nameVec may be bytes; try to decode to string if present
          let name = '';
          try {
            if (Array.isArray(nameVec)) {
              name = new TextDecoder().decode(new Uint8Array(nameVec));
            } else if (typeof nameVec === 'string') {
              name = nameVec;
            }
          } catch {}
          setCompanyStatus({
            name,
            owner: String(owner),
            treasury: Number(treasury),
            employees: Number(empCount),
            active: Boolean(active)
          });
        } else {
          setCompanyStatus(null);
        }
      } catch (e) {
        // Keep silent; UI will show placeholder when not available
        setCompanyStatus(null);
      } finally {
        setStatusLoading(false);
      }
    };
    loadStatus();
  }, [account?.address]);

  // Animation variants
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const renderDashboard = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total Treasury"
          value="$2.4M"
          subtitle="Available balance"
          icon={<DollarSign className="text-green-400" size={24} />}
          trend={{ value: 12.5, isPositive: true }}
          gradient="from-green-500 to-emerald-600"
        />
        <StatCard
          title="Active Employees"
          value="156"
          subtitle="Full-time staff"
          icon={<Users className="text-blue-400" size={24} />}
          trend={{ value: 8.2, isPositive: true }}
          gradient="from-blue-500 to-cyan-600"
        />
        <StatCard
          title="Monthly Payroll"
          value="$580K"
          subtitle="Current month"
          icon={<Calendar className="text-purple-400" size={24} />}
          trend={{ value: -2.1, isPositive: false }}
          gradient="from-purple-500 to-pink-600"
        />
        <StatCard
          title="Savings"
          value="$125K"
          subtitle="vs traditional payroll"
          icon={<Award className="text-yellow-400" size={24} />}
          trend={{ value: 15.8, isPositive: true }}
          gradient="from-yellow-500 to-orange-600"
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <PayrollInsightsChart data={mockPayrollData} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DepartmentSpendingChart data={mockDepartmentData} />
        </motion.div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ModernCard>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
                <p className="text-gray-400">Latest payroll activities</p>
              </div>
              <ModernButton variant="secondary" size="sm" icon={<Filter size={16} />}>
                Filter
              </ModernButton>
            </div>
            <div className="space-y-4">
              {mockRecentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <CreditCard size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{tx.employee}</p>
                      <p className="text-sm text-gray-400">{tx.type} Payment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">${tx.amount.toLocaleString()}</p>
                    <StatusBadge 
                      status={tx.status === 'success' ? 'active' : 'pending'} 
                      size="sm" 
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <ModernButton variant="ghost" className="w-full">
                View All Transactions
              </ModernButton>
            </div>
          </ModernCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <ModernCard>
            <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <ModernButton 
                variant="gradient" 
                className="w-full justify-start" 
                icon={<Plus size={20} />}
                onClick={() => setShowRegister((s) => !s)}
              >
                Register Company
              </ModernButton>
              <ModernButton 
                variant="gradient" 
                className="w-full justify-start" 
                icon={<Plus size={20} />}
                onClick={() => setShowAddEmployee((s) => !s)}
              >
                Add Employee
              </ModernButton>
              <ModernButton 
                variant="secondary" 
                className="w-full justify-start" 
                icon={<DollarSign size={20} />}
                onClick={() => setShowFund((s) => !s)}
              >
                Fund Treasury
              </ModernButton>
              <ModernButton 
                variant="secondary" 
                className="w-full justify-start" 
                icon={<DollarSign size={20} />}
                onClick={() => setShowProcessPayroll((s) => !s)}
              >
                Process Payroll
              </ModernButton>
              <ModernButton 
                variant="secondary" 
                className="w-full justify-start" 
                icon={<Download size={20} />}
              >
                Generate Reports
              </ModernButton>
              <ModernButton 
                variant="secondary" 
                className="w-full justify-start" 
                icon={<Eye size={20} />}
                onClick={() => setCurrentView('employee')}
              >
                Employee Portal
              </ModernButton>
            </div>
          </ModernCard>

          {/* Register Company Form */}
          {showRegister && (
            <div className="mt-6">
              <GlassCard>
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Register Company</h4>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="flex gap-2">
                    <ModernButton
                      variant="primary"
                      disabled={!companyName || txLoading}
                      onClick={async () => {
                        setTxMessage(null);
                        setTxError(null);
                        try {
                          if (!connected) {
                            await connect();
                          }
                          if (!account?.address) {
                            throw new Error('Wallet not connected.');
                          }
                          setTxLoading(true);
                          const companyNameBytes = Array.from(new TextEncoder().encode(companyName));
                          const payload = {
                            type: 'entry_function_payload',
                            function: fn(MODULES.payrollManager, 'register_company'),
                            type_arguments: [] as string[],
                            arguments: [companyNameBytes]
                          };
                          const res = await signAndSubmit(payload);
                          setTxMessage(`Registered! Tx: ${res.hash}`);
                          setShowRegister(false);
                          setCompanyName('');
                          // refresh status
                          try { const info = await payrollService.getCompanyInfo(account.address); if (info) { const [nameVec, owner, treasury, empCount, active] = info as any[]; let name = ''; try { if (Array.isArray(nameVec)) { name = new TextDecoder().decode(new Uint8Array(nameVec)); } else if (typeof nameVec === 'string') { name = nameVec; } } catch {} setCompanyStatus({ name, owner: String(owner), treasury: Number(treasury), employees: Number(empCount), active: Boolean(active) }); } } catch {}
                        } catch (err: any) {
                          setTxError(err?.message || 'Failed to register company');
                        } finally {
                          setTxLoading(false);
                        }
                      }}
                    >
                      {txLoading ? 'Submitting…' : 'Submit'}
                    </ModernButton>
                    <ModernButton variant="secondary" onClick={() => setShowRegister(false)}>
                      Cancel
                    </ModernButton>
                  </div>
                  {txMessage && (
                    <div className="text-green-400 text-sm break-all">{txMessage}</div>
                  )}

          {/* Process Payroll Form */}
          {showProcessPayroll && (
            <div className="mt-6">
              <GlassCard>
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Process Payroll</h4>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Employee Address</label>
                    <input
                      type="text"
                      value={ppEmployeeAddress}
                      onChange={(e) => setPpEmployeeAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0x..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Amount (u64)</label>
                    <input
                      type="number"
                      value={ppAmount}
                      onChange={(e) => setPpAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 1000"
                    />
                  </div>
                  <div className="flex gap-2">
                    <ModernButton
                      variant="primary"
                      disabled={!ppEmployeeAddress || !ppAmount || Number(ppAmount) <= 0 || txLoading}
                      onClick={async () => {
                        setTxMessage(null);
                        setTxError(null);
                        try {
                          if (!connected) {
                            await connect();
                          }
                          if (!account?.address) {
                            throw new Error('Wallet not connected.');
                          }
                          setTxLoading(true);
                          const amt = Number(ppAmount);
                          const payload = {
                            type: 'entry_function_payload',
                            function: fn(MODULES.payrollManager, 'process_payment'),
                            type_arguments: [] as string[],
                            arguments: [ppEmployeeAddress, amt]
                          };
                          const res = await signAndSubmit(payload);
                          setTxMessage(`Payment processed! Tx: ${res.hash}`);
                          setShowProcessPayroll(false);
                          setPpEmployeeAddress('');
                          setPpAmount('');
                          // refresh status
                          try { const info = await payrollService.getCompanyInfo(account.address); if (info) { const [nameVec, owner, treasury, empCount, active] = info as any[]; let name = ''; try { if (Array.isArray(nameVec)) { name = new TextDecoder().decode(new Uint8Array(nameVec)); } else if (typeof nameVec === 'string') { name = nameVec; } } catch {} setCompanyStatus({ name, owner: String(owner), treasury: Number(treasury), employees: Number(empCount), active: Boolean(active) }); } } catch {}
                        } catch (err: any) {
                          setTxError(err?.message || 'Failed to process payment');
                        } finally {
                          setTxLoading(false);
                        }
                      }}
                    >
                      {txLoading ? 'Submitting…' : 'Pay'}
                    </ModernButton>
                    <ModernButton variant="secondary" onClick={() => setShowProcessPayroll(false)}>
                      Cancel
                    </ModernButton>
                  </div>
                  {txMessage && (
                    <div className="text-green-400 text-sm break-all">{txMessage}</div>
                  )}
                  {txError && (
                    <div className="text-red-400 text-sm break-all">{txError}</div>
                  )}
                </div>
              </GlassCard>
            </div>
          )}
                  {txError && (
                    <div className="text-red-400 text-sm break-all">{txError}</div>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Add Employee Form */}
          {showAddEmployee && (
            <div className="mt-6">
              <GlassCard>
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Add Employee</h4>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Employee Address</label>
                    <input
                      type="text"
                      value={newEmployeeAddress}
                      onChange={(e) => setNewEmployeeAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0x..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <ModernButton
                      variant="primary"
                      disabled={!newEmployeeAddress || txLoading}
                      onClick={async () => {
                        setTxMessage(null);
                        setTxError(null);
                        try {
                          if (!connected) {
                            await connect();
                          }
                          if (!account?.address) {
                            throw new Error('Wallet not connected.');
                          }
                          setTxLoading(true);
                          const payload = {
                            type: 'entry_function_payload',
                            function: fn(MODULES.payrollManager, 'add_employee'),
                            type_arguments: [] as string[],
                            arguments: [newEmployeeAddress]
                          };
                          const res = await signAndSubmit(payload);
                          setTxMessage(`Employee added! Tx: ${res.hash}`);
                          setShowAddEmployee(false);
                          setNewEmployeeAddress('');
                          // refresh status
                          try { const info = await payrollService.getCompanyInfo(account.address); if (info) { const [nameVec, owner, treasury, empCount, active] = info as any[]; let name = ''; try { if (Array.isArray(nameVec)) { name = new TextDecoder().decode(new Uint8Array(nameVec)); } else if (typeof nameVec === 'string') { name = nameVec; } } catch {} setCompanyStatus({ name, owner: String(owner), treasury: Number(treasury), employees: Number(empCount), active: Boolean(active) }); } } catch {}
                        } catch (err: any) {
                          setTxError(err?.message || 'Failed to add employee');
                        } finally {
                          setTxLoading(false);
                        }
                      }}
                    >
                      {txLoading ? 'Submitting…' : 'Add'}
                    </ModernButton>
                    <ModernButton variant="secondary" onClick={() => setShowAddEmployee(false)}>
                      Cancel
                    </ModernButton>
                  </div>
                  {txMessage && (
                    <div className="text-green-400 text-sm break-all">{txMessage}</div>
                  )}
                  {txError && (
                    <div className="text-red-400 text-sm break-all">{txError}</div>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Fund Treasury Form */}
          {showFund && (
            <div className="mt-6">
              <GlassCard>
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Fund Treasury</h4>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Amount (u64)</label>
                    <input
                      type="number"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 1000000"
                    />
                  </div>
                  <div className="flex gap-2">
                    <ModernButton
                      variant="primary"
                      disabled={!fundAmount || Number(fundAmount) <= 0 || txLoading}
                      onClick={async () => {
                        setTxMessage(null);
                        setTxError(null);
                        try {
                          if (!connected) {
                            await connect();
                          }
                          if (!account?.address) {
                            throw new Error('Wallet not connected.');
                          }
                          setTxLoading(true);
                          const amt = Number(fundAmount);
                          const payload = {
                            type: 'entry_function_payload',
                            function: fn(MODULES.payrollManager, 'fund_treasury'),
                            type_arguments: [] as string[],
                            arguments: [amt]
                          };
                          const res = await signAndSubmit(payload);
                          setTxMessage(`Treasury funded! Tx: ${res.hash}`);
                          setShowFund(false);
                          setFundAmount('');
                          // refresh status
                          try { const info = await payrollService.getCompanyInfo(account.address); if (info) { const [nameVec, owner, treasury, empCount, active] = info as any[]; let name = ''; try { if (Array.isArray(nameVec)) { name = new TextDecoder().decode(new Uint8Array(nameVec)); } else if (typeof nameVec === 'string') { name = nameVec; } } catch {} setCompanyStatus({ name, owner: String(owner), treasury: Number(treasury), employees: Number(empCount), active: Boolean(active) }); } } catch {}
                        } catch (err: any) {
                          setTxError(err?.message || 'Failed to fund treasury');
                        } finally {
                          setTxLoading(false);
                        }
                      }}
                    >
                      {txLoading ? 'Submitting…' : 'Fund'}
                    </ModernButton>
                    <ModernButton variant="secondary" onClick={() => setShowFund(false)}>
                      Cancel
                    </ModernButton>
                  </div>
                  {txMessage && (
                    <div className="text-green-400 text-sm break-all">{txMessage}</div>
                  )}
                  {txError && (
                    <div className="text-red-400 text-sm break-all">{txError}</div>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Treasury Status */}
          <div className="mt-6">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white">Treasury Health</h4>
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Company</span>
                  <span className="text-white font-medium">{statusLoading ? 'Loading…' : (companyStatus?.name || '—')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Owner</span>
                  <span className="text-white font-medium">{companyStatus?.owner ? `${companyStatus.owner.slice(0,6)}...${companyStatus.owner.slice(-4)}` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Treasury (u64)</span>
                  <span className="text-white font-medium">{companyStatus?.treasury ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Employees</span>
                  <span className="text-white font-medium">{companyStatus?.employees ?? 0}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (companyStatus?.treasury ?? 0) > 0 ? 80 : 10)}%` }}></div>
                </div>
                <p className="text-xs text-gray-400">On-chain status shown for connected company</p>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderEmployeeManagement = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Employee Management</h2>
          <p className="text-gray-400">Manage your team and their compensation</p>
        </div>
        <ModernButton variant="primary" icon={<Plus size={20} />}>
          Add Employee
        </ModernButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {mockEmployees.map((employee) => (
          <ModernCard key={employee.id} hover>
            <div className="flex items-start gap-4">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white">{employee.name}</h3>
                <p className="text-sm text-gray-400">{employee.role}</p>
                <p className="text-xs text-gray-500 mb-2">{employee.department}</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-400">
                    ${employee.salary.toLocaleString()}
                  </span>
                  <StatusBadge status="active" size="sm" />
                </div>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'employees':
      case 'employee-list':
        return renderEmployeeManagement();
      default:
        return renderDashboard();
    }
  };

  if (currentView === 'employee') {
    return (
      <EmployeePortal onBack={() => setCurrentView('dashboard')} />
    );
  }

  return (
      <div className="main-layout">
        <ModernNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          walletConnected={walletConnected}
          walletAddress={walletAddress}
          onWalletConnect={onWalletConnect}
          notifications={3}
          onSidebarToggle={setIsSidebarCollapsed}
        />

        {/* Main Content */}
        <div className={`main-content main-content-mobile ${isSidebarCollapsed ? 'main-content-collapsed' : ''}`}>
          <main className="flex-1">
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton
          icon={<Plus size={24} />}
          onClick={() => setActiveTab('employees')}
        />
      </div>
  );
};