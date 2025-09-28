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
import { WalletProvider } from './WalletProvider';
import { EmployeePortal } from './EmployeePortal';

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
              >
                Add Employee
              </ModernButton>
              <ModernButton 
                variant="secondary" 
                className="w-full justify-start" 
                icon={<DollarSign size={20} />}
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

          {/* Treasury Status */}
          <div className="mt-6">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white">Treasury Health</h4>
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">APT Balance</span>
                  <span className="text-white font-medium">125,000 APT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">USDC Balance</span>
                  <span className="text-white font-medium">$2,400,000</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <p className="text-xs text-gray-400">78% of recommended treasury size</p>
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
      <WalletProvider>
        <EmployeePortal onBack={() => setCurrentView('dashboard')} />
      </WalletProvider>
    );
  }

  return (
    <WalletProvider>
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
    </WalletProvider>
  );
};