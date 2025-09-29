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
  CreditCard,
  Shield,
  Clock
} from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { StatCard, GlassCard, TransactionCard } from './ui/enhanced-card';
import { GradientButton, FloatingActionButton } from './ui/enhanced-button';
import { StatusBadge, TransactionStatus, TrendBadge } from './ui/status-badge';
import { ModernNavigation } from './ModernNavigation';
import { PayrollTrendChart, DepartmentSpendingChart } from './charts/PayrollChart';

// Mock data for the dashboard
const mockPayrollData = [
  { name: 'Jan', value: 45000 },
  { name: 'Feb', value: 48000 },
  { name: 'Mar', value: 52000 },
  { name: 'Apr', value: 49000 },
  { name: 'May', value: 55000 },
  { name: 'Jun', value: 58000 }
];

const mockDepartmentSpending = [
  { name: 'Engineering', value: 125000 },
  { name: 'Product', value: 85000 },
  { name: 'Marketing', value: 45000 },
  { name: 'Sales', value: 30500 }
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
    walletAddress: '0x1234...5678'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@company.com',
    role: 'Product Manager',
    department: 'Product',
    salary: 105000,
    status: 'active',
    walletAddress: '0xabcd...efgh'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@company.com',
    role: 'Marketing Lead',
    department: 'Marketing',
    salary: 85000,
    status: 'active',
    walletAddress: '0x9876...5432'
  }
];

interface PayrollDashboardProps {
  onBack: () => void;
}

export const PayrollDashboard: React.FC<PayrollDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { account } = useWallet();

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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Payroll"
          value="₳285.5K"
          subtitle="+12% from last month"
          icon={<DollarSign className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
          gradient="from-blue-500 to-blue-600"
        />
        
        <StatCard
          title="Active Employees"
          value="148"
          subtitle="+5 new this month"
          icon={<Users className="h-6 w-6" />}
          trend={{ value: 3.4, isPositive: true }}
          gradient="from-green-500 to-green-600"
        />
        
        <StatCard
          title="Avg. Salary"
          value="₳95.2K"
          subtitle="+8% YoY increase"
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: 8, isPositive: true }}
          gradient="from-purple-500 to-purple-600"
        />
        
        <StatCard
          title="Next Payroll"
          value="5 Days"
          subtitle="December 15, 2024"
          icon={<Calendar className="h-6 w-6" />}
          gradient="from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <PayrollTrendChart data={mockPayrollData} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <DepartmentSpendingChart data={mockDepartmentSpending} />
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
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
            {mockEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.role} • {employee.department}</p>
                    <p className="text-xs text-gray-400">{employee.walletAddress}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₳{employee.salary.toLocaleString()}</p>
                  <StatusBadge status={employee.status as any} size="sm" />
                </div>
              </div>
            ))}
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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Smart Contract Payroll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Total Amount</h3>
                <p className="text-2xl font-bold text-blue-600">₳285,500</p>
                <p className="text-sm text-gray-500">148 employees</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Estimated Gas</h3>
                <p className="text-2xl font-bold text-green-600">₳0.5</p>
                <p className="text-sm text-gray-500">Smart contract execution</p>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <Button size="lg" className="w-full bg-blue-500 hover:bg-blue-600">
                <DollarSign className="h-5 w-5 mr-2" />
                Execute Payroll
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                This will trigger the smart contract to process all payments automatically
              </p>
            </div>
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
      case 'add-employee':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Add New Employee</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Employee form would go here...</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'payment-history':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Payment History</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Payment history would go here...</p>
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
                <p className="text-gray-500">Schedule management would go here...</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'compliance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Tax & Compliance</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Compliance dashboard would go here...</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Settings panel would go here...</p>
              </CardContent>
            </Card>
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
        notifications={3}
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
              <h1 className="text-2xl font-bold text-gray-900">AptosPayroll Dashboard</h1>
              <p className="text-gray-500">Connected: {account?.address.toString().slice(0, 8)}...{account?.address.toString().slice(-6)}</p>
            </div>
            <Button variant="outline" onClick={onBack}>
              Back to Landing
            </Button>
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