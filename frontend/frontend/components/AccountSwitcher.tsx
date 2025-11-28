import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useBalance, useSwitchAccount } from 'wagmi';
import { ChevronDown, Wallet, Check } from 'lucide-react';
import { useChain } from '@/contexts/ChainContext';
import { toast } from './ui/use-toast';

interface AccountSwitcherProps {
  compact?: boolean;
  showBalance?: boolean;
  className?: string;
}

/**
 * AccountSwitcher Component
 *
 * Allows switching between multiple accounts from the same connected wallet
 *
 * Features:
 * - Detects all accounts in connected wallet
 * - Dropdown to switch between accounts
 * - Shows balance for each account
 * - Persists selected account preference
 */
export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  compact = false,
  showBalance = true,
  className = ''
}) => {
  const { address, connector, isConnected } = useAccount();
  const { switchAccount } = useSwitchAccount();
  const { connectors } = useConnect();
  const { isEVMChain } = useChain();
  const [showDropdown, setShowDropdown] = useState(false);
  const [accounts, setAccounts] = useState<readonly `0x${string}`[]>([]);

  // Fetch available accounts from connector
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!connector || !isConnected || !isEVMChain) {
        setAccounts([]);
        return;
      }

      try {
        const availableAccounts = await connector.getAccounts();
        setAccounts(availableAccounts);

        // Load saved account preference
        const savedAccount = localStorage.getItem('preferred-account');
        if (savedAccount && availableAccounts.includes(savedAccount as `0x${string}`)) {
          if (savedAccount !== address) {
            handleAccountSwitch(savedAccount as `0x${string}`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
        setAccounts([]);
      }
    };

    fetchAccounts();
  }, [connector, isConnected, isEVMChain]);

  const handleAccountSwitch = async (newAccount: `0x${string}`) => {
    if (!connector) return;

    try {
      await switchAccount({ connector, account: newAccount });

      // Save preference
      localStorage.setItem('preferred-account', newAccount);

      toast({
        title: 'Account Switched',
        description: `Now using ${truncateAddress(newAccount)}`,
      });

      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to switch account:', error);
      toast({
        title: 'Switch Failed',
        description: error instanceof Error ? error.message : 'Failed to switch account',
        variant: 'destructive',
      });
    }
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Don't render if not on EVM chain or not connected
  if (!isEVMChain || !isConnected || accounts.length <= 1) {
    return null;
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors text-sm"
        >
          <Wallet size={14} className="text-gray-400" />
          <span className="text-white">Account {accounts.indexOf(address!) + 1}</span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute top-full mt-2 right-0 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
              {accounts.map((account, idx) => (
                <AccountItem
                  key={account}
                  account={account}
                  index={idx}
                  isActive={account === address}
                  showBalance={showBalance}
                  onSelect={handleAccountSwitch}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-xs text-gray-400 font-medium">Switch Account</div>
      <div className="space-y-1">
        {accounts.map((account, idx) => (
          <AccountItem
            key={account}
            account={account}
            index={idx}
            isActive={account === address}
            showBalance={showBalance}
            onSelect={handleAccountSwitch}
          />
        ))}
      </div>
    </div>
  );
};

interface AccountItemProps {
  account: `0x${string}`;
  index: number;
  isActive: boolean;
  showBalance: boolean;
  onSelect: (account: `0x${string}`) => void;
}

const AccountItem: React.FC<AccountItemProps> = ({
  account,
  index,
  isActive,
  showBalance,
  onSelect,
}) => {
  const { data: balance } = useBalance({ address: account });

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <button
      onClick={() => !isActive && onSelect(account)}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
        isActive
          ? 'bg-blue-500/10 border border-blue-500/20'
          : 'hover:bg-gray-800 border border-transparent'
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
        isActive ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
      }`}>
        {index + 1}
      </div>

      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-mono ${isActive ? 'text-blue-400' : 'text-white'}`}>
            {truncateAddress(account)}
          </span>
          {isActive && <Check size={14} className="text-blue-400" />}
        </div>
        {showBalance && balance && (
          <div className="text-xs text-gray-400 mt-0.5">
            {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
          </div>
        )}
      </div>
    </button>
  );
};

export default AccountSwitcher;
