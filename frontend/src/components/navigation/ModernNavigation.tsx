import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  FileText, 
  Settings, 
  Bell,
  Menu,
  X,
  Wallet,
  TrendingUp,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ModernButton } from '../ui/ModernButton';
import { StatusBadge } from '../ui/StatusBadge';
import { useWallet } from '../../WalletProvider';

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
  walletConnected: boolean;
  walletAddress?: string;
  onWalletConnect: () => void;
  notifications?: number;
  onSidebarToggle?: (collapsed: boolean) => void;
}

export const ModernNavigation: React.FC<ModernNavigationProps> = ({
  activeTab,
  onTabChange,
  walletConnected,
  walletAddress,
  onWalletConnect,
  notifications = 0,
  onSidebarToggle
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Wallet context (multi-wallet)
  const { connected, account, wallets, connectWith, connect, disconnect } = useWallet();
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

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
      icon: <Shield size={20} />,
      badge: 2
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

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSidebarToggle = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    onSidebarToggle?.(newCollapsedState);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className={`sidebar-layout hidden lg:flex ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="glass backdrop-blur border-r flex flex-col flex-1 overflow-y-auto" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-4">
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)' }}>
                <Wallet className="text-white" size={24} />
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-gradient">AptosPayroll</h1>
                  <p className="text-xs text-gray-400">Web3 Payroll Suite</p>
                </div>
              )}
            </div>
          </div>

          {/* Collapse Button */}
          <div className="flex justify-center px-4 mb-4">
            <button
              onClick={handleSidebarToggle}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          {/* Wallet Connection */}
          <div className="px-4 mb-6">
            {(connected || walletConnected) ? (
              <div className={`wallet-connected ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <Wallet size={16} className="text-blue-400" />
                {!isSidebarCollapsed && (
                  <>
                    <span className="text-sm">
                      {account?.address ? formatWalletAddress(account.address) : (walletAddress ? formatWalletAddress(walletAddress) : 'Connected')}
                    </span>
                    <StatusBadge status="active" text="" size="sm" />
                    <button
                      className="ml-auto text-xs text-red-300 hover:text-red-200"
                      onClick={() => disconnect()}
                    >
                      Disconnect
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="relative">
                <ModernButton
                  variant="gradient"
                  size="sm"
                  onClick={() => setWalletMenuOpen((s) => !s)}
                  icon={<Wallet size={16} className="text-blue-400" />}
                  className={`w-full ${isSidebarCollapsed ? 'px-2' : ''}`}
                >
                  {!isSidebarCollapsed ? 'Connect Wallet' : ''}
                </ModernButton>
                {/* Wallet picker */}
                <AnimatePresence>
                  {walletMenuOpen && !isSidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-20 mt-2 w-full rounded-lg border border-white/10 bg-black/70 backdrop-blur p-2"
                    >
                      <div className="text-xs text-gray-400 px-2 pb-1">Select a wallet</div>
                      <div className="space-y-1">
                        {wallets && wallets.length > 0 ? (
                          wallets.map((w) => (
                            <button
                              key={w.name}
                              onClick={async () => {
                                setWalletMenuOpen(false);
                                try {
                                  await connectWith(w.name);
                                } catch (e) {
                                  console.error('Wallet connect failed:', e);
                                  // fallback to generic connect if specific fails
                                  try { await connect(); } catch {}
                                }
                              }}
                              className="w-full text-left text-sm px-3 py-2 rounded hover:bg-white/10 text-white"
                            >
                              {w.name}
                            </button>
                          ))
                        ) : (
                          <button
                            onClick={async () => {
                              setWalletMenuOpen(false);
                              try { await connect(); } catch (e) { console.error(e); }
                            }}
                            className="w-full text-left text-sm px-3 py-2 rounded hover:bg-white/10 text-white"
                          >
                            Try Connect
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-2 space-y-1">
            {navigationItems.map((item) => (
              <div key={item.id}>
                <motion.button
                  className={`nav-item w-full text-left ${
                    activeTab === item.id ? 'active' : ''
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
                          className={`nav-item w-full text-left text-sm ${
                            activeTab === subItem.id ? 'active' : ''
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

          {/* Notifications */}
          <div className="px-4 mt-auto">
            <div className={`glass rounded-lg p-3 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
              <div className={`flex items-center ${isSidebarCollapsed ? 'flex-col gap-1' : 'justify-between'}`}>
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2'}`}>
                  <Bell size={16} className="text-gray-400" />
                  {!isSidebarCollapsed && (
                    <span className="text-sm text-gray-300">Notifications</span>
                  )}
                </div>
                {notifications > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {notifications}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="block lg:hidden">
        {/* Mobile Header */}
        <div className="mobile-nav-header glass border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)' }}>
              <Wallet className="text-white" size={16} />
            </div>
            <h1 className="text-lg font-bold text-gradient">AptosPayroll</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {notifications > 0 && (
              <div className="relative">
                <Bell size={20} className="text-gray-400" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {notifications}
                </span>
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
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
              className="mobile-nav-menu glass border-b border-white/10 overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {/* Mobile Wallet Connection */}
                {walletConnected ? (
                  <div className="wallet-connected mb-4">
                    <Wallet size={16} className="text-blue-400" />
                    <span className="text-sm">
                      {walletAddress ? formatWalletAddress(walletAddress) : 'Connected'}
                    </span>
                    <StatusBadge status="active" text="" size="sm" />
                  </div>
                ) : (
                  <ModernButton
                    variant="gradient"
                    size="sm"
                    onClick={onWalletConnect}
                    icon={<Wallet size={16} className="text-blue-400" />}
                    className="w-full mb-4"
                  >
                    Connect Wallet
                  </ModernButton>
                )}

                {/* Mobile Navigation Items */}
                {navigationItems.map((item) => (
                  <div key={item.id}>
                    <button
                      className={`nav-item w-full text-left ${
                        activeTab === item.id ? 'active' : ''
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
                              className={`nav-item w-full text-left text-sm ${
                                activeTab === subItem.id ? 'active' : ''
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