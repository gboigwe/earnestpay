import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Wallet, Copy, LogOut, ExternalLink, ChevronDown } from 'lucide-react';
import { aptosClient } from '@/utils/aptosClient';
import { motion, AnimatePresence } from 'framer-motion';

export function WalletButton() {
  const { account, connected, disconnect, wallets, connect } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    async function fetchBalance() {
      if (!account?.address) {
        setBalance('0');
        return;
      }
      try {
        const resources = await aptosClient().getAccountResources({
          accountAddress: account.address,
        });
        const aptosCoin = resources.find(
          (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
        );
        if (aptosCoin?.data) {
          const coinData = aptosCoin.data as { coin: { value: string } };
          const aptBalance = Number(coinData.coin.value) / 1e8; // Convert from Octas to APT
          setBalance(aptBalance.toFixed(2));
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('0');
      }
    }

    if (connected && account) {
      fetchBalance();
      // Refresh balance every 10 seconds
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [account, connected]);

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = async () => {
    if (account?.address) {
      try {
        await navigator.clipboard.writeText(account.address.toString());
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleConnect = async (walletName: string) => {
    setIsLoading(true);
    try {
      await connect(walletName);
      setShowWalletModal(false);
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  // Not connected - show connect button
  if (!connected) {
    return (
      <>
        <button
          onClick={() => setShowWalletModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </button>

        {/* Wallet Selection Modal */}
        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowWalletModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10 shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-4">Connect Wallet</h3>
                <p className="text-gray-400 mb-6">Choose your preferred Aptos wallet to continue</p>

                <div className="space-y-3">
                  {wallets?.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() => handleConnect(wallet.name)}
                      disabled={isLoading}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        {wallet.icon && (
                          <img src={wallet.icon} alt={wallet.name} className="w-8 h-8 rounded-lg" />
                        )}
                        <div className="text-left">
                          <div className="text-white font-semibold">{wallet.name}</div>
                          <div className="text-xs text-gray-400">
                            {wallet.name === 'Petra' && 'Most Popular'}
                            {wallet.name === 'Martian' && 'Developer Friendly'}
                            {!['Petra', 'Martian'].includes(wallet.name) && 'Aptos Wallet'}
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="h-5 w-5 text-gray-400 -rotate-90 group-hover:text-blue-400 transition-colors" />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowWalletModal(false)}
                  className="w-full mt-4 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Connected - show address with dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border border-white/10 px-4 py-2.5 rounded-xl transition-all duration-200 hover:border-blue-500/50 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-300">{balance} APT</span>
        </div>
        <div className="h-4 w-px bg-white/10"></div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {account?.address?.toString().slice(2, 3).toUpperCase()}
            </span>
          </div>
          <span className="text-white font-mono text-sm">
            {shortenAddress(account?.address?.toString() || '')}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              showDropdown ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-72 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50"
          >
            {/* Account Info */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {account?.address?.toString().slice(2, 3).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Your Account</div>
                  <div className="text-xs text-gray-400">Connected</div>
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Balance</span>
                  <span className="text-lg font-bold text-white">{balance} APT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Address</span>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span className="font-mono">{shortenAddress(account?.address?.toString() || '')}</span>
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                <Copy className="h-4 w-4" />
                Copy Address
              </button>

              <a
                href={`https://explorer.aptoslabs.com/account/${account?.address?.toString()}?network=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                View on Explorer
              </a>

              <div className="h-px bg-white/10 my-2"></div>

              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
