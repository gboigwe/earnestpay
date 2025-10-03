import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  Menu,
  X,
  TrendingUp,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { WalletButton } from './WalletButton';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  submenu?: NavigationItem[];
}

interface ModernNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSidebarToggle?: (collapsed: boolean) => void;
}

export const ModernNavigation: React.FC<ModernNavigationProps> = ({
  activeTab,
  onTabChange,
  onSidebarToggle
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <TrendingUp size={20} />
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: <Users size={20} />,
      submenu: [
        { id: 'employee-list', label: 'Employee List', icon: <Users size={16} /> },
        { id: 'add-employee', label: 'Add Employee', icon: <Users size={16} /> }
      ]
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: <DollarSign size={20} />,
      submenu: [
        { id: 'process-payroll', label: 'Process Payroll', icon: <DollarSign size={16} /> },
        { id: 'payment-history', label: 'Payment History', icon: <FileText size={16} /> }
      ]
    },
    {
      id: 'schedules',
      label: 'Schedules',
      icon: <Calendar size={20} />
    },
    {
      id: 'compliance',
      label: 'Tax & Compliance',
      icon: <Shield size={20} />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />
    }
  ];

  const handleSubmenuToggle = (itemId: string) => {
    setExpandedSubmenu(expandedSubmenu === itemId ? null : itemId);
  };

  const handleSidebarToggle = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    onSidebarToggle?.(newCollapsedState);
  };

  return (
    <>
      {/* Top Header Bar - Desktop */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 z-50 hidden lg:flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <img
            src="/earnestpay-icon.svg"
            alt="EarnestPay Logo"
            className="w-8 h-8"
          />
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              EarnestPay Dashboard
            </h1>
          </div>
        </div>

        {/* Right side - Wallet Button */}
        <div className="flex items-center gap-4">
          <WalletButton />
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-900/95 backdrop-blur border-r border-gray-800 flex flex-col z-40 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'} hidden lg:flex`}>
        {/* Sidebar content starts with padding */}
        <div className="py-4"></div>

        {/* Collapse Button */}
        <div className="flex justify-center px-4 mb-4">
          <button
            onClick={handleSidebarToggle}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 space-y-1">
          {navigationItems.map((item) => (
            <div key={item.id}>
              <motion.button
                className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                onClick={() => {
                  if (item.submenu && !isSidebarCollapsed) {
                    handleSubmenuToggle(item.id);
                  } else {
                    onTabChange(item.id);
                  }
                }}
                whileHover={{ x: isSidebarCollapsed ? 0 : 4 }}
                transition={{ duration: 0.2 }}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                    {item.submenu && (
                      <ChevronDown 
                        size={16}
                        className={`ml-auto transform transition-transform ${
                          expandedSubmenu === item.id ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </>
                )}
              </motion.button>

              {/* Submenu */}
              <AnimatePresence>
                {item.submenu && expandedSubmenu === item.id && !isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-4 mt-1 space-y-1"
                  >
                    {item.submenu.map((subItem) => (
                      <motion.button
                        key={subItem.id}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === subItem.id 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                        onClick={() => onTabChange(subItem.id)}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        {subItem.icon}
                        {subItem.label}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

      </div>

      {/* Mobile Navigation */}
      <div className="block lg:hidden">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 px-4 py-3 flex items-center justify-between z-50">
          <div className="flex items-center gap-3">
            <img
              src="/earnestpay-icon.svg"
              alt="EarnestPay Logo"
              className="w-8 h-8"
            />
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">EarnestPay</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <WalletButton />
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-white"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-16 left-0 right-0 bg-gray-900/95 backdrop-blur border-b border-gray-800 overflow-hidden z-40"
            >
              <div className="p-4 space-y-2">
                {/* Mobile Wallet Connection - show on very small screens */}
                <div className="block sm:hidden mb-4">
                  <WalletButton />
                </div>

                {/* Mobile Navigation Items */}
                {navigationItems.map((item) => (
                  <div key={item.id}>
                    <button
                      className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                        activeTab === item.id 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                      onClick={() => {
                        if (item.submenu) {
                          handleSubmenuToggle(item.id);
                        } else {
                          onTabChange(item.id);
                          setIsMobileMenuOpen(false);
                        }
                      }}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                          {item.badge}
                        </span>
                      )}
                      {item.submenu && (
                        <ChevronDown 
                          size={16}
                          className={`ml-auto transform transition-transform ${
                            expandedSubmenu === item.id ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>

                    {/* Mobile Submenu */}
                    <AnimatePresence>
                      {item.submenu && expandedSubmenu === item.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-4 mt-1 space-y-1"
                        >
                          {item.submenu.map((subItem) => (
                            <button
                              key={subItem.id}
                              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                activeTab === subItem.id 
                                  ? 'bg-blue-600 text-white' 
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                              }`}
                              onClick={() => {
                                onTabChange(subItem.id);
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              {subItem.icon}
                              {subItem.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};