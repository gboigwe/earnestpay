import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useChain, ChainType } from '@/contexts/ChainContext';

/**
 * ChainSelector Component
 *
 * Allows users to switch between different blockchain networks.
 * Currently supports:
 * - Aptos (active)
 * - Ethereum, Arbitrum, Base, Polygon (future - requires Reown setup)
 *
 * Usage:
 * This component is READY but not yet integrated into the UI.
 * When you implement cross-chain features, add this to your navigation:
 *
 * ```tsx
 * import { ChainSelector } from '@/components/ChainSelector';
 *
 * <ChainSelector />
 * ```
 *
 * The component will:
 * 1. Show current active chain (Aptos by default)
 * 2. Allow switching to EVM chains (when Reown is configured)
 * 3. Display wallet connection status per chain
 */

type Chain = {
  id: string;
  name: string;
  icon: string;
  type: 'aptos' | 'evm';
  enabled: boolean;
  comingSoon?: boolean;
};

const CHAINS: Chain[] = [
  {
    id: 'aptos',
    name: 'Aptos',
    icon: '🟣',
    type: 'aptos',
    enabled: true,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    icon: '⟠',
    type: 'evm',
    enabled: false,
    comingSoon: true,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    icon: '🔷',
    type: 'evm',
    enabled: false,
    comingSoon: true,
  },
  {
    id: 'base',
    name: 'Base',
    icon: '🔵',
    type: 'evm',
    enabled: false,
    comingSoon: true,
  },
  {
    id: 'polygon',
    name: 'Polygon',
    icon: '🟣',
    type: 'evm',
    enabled: false,
    comingSoon: true,
  },
];

export const ChainSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedChain: selectedChainId, setSelectedChain } = useChain();
  const { connected } = useWallet();

  // Find the selected chain object
  const selectedChain = CHAINS.find(c => c.id === selectedChainId) || CHAINS[0];

  const handleChainSelect = (chain: Chain) => {
    if (!chain.enabled) {
      return;
    }
    setSelectedChain(chain.id as ChainType);
    setIsOpen(false);
  };

  // Check if Reown is configured
  const reownProjectId = import.meta.env.VITE_REOWN_PROJECT_ID;
  const evmEnabled = !!reownProjectId;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
      >
        <span className="text-xl">{selectedChain.icon}</span>
        <span className="text-white font-medium">{selectedChain.name}</span>
        {connected && selectedChain.type === 'aptos' && (
          <span className="w-2 h-2 bg-green-400 rounded-full" title="Connected" />
        )}
        <ChevronDown
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          size={16}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full mt-2 right-0 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-800">
              <p className="text-xs text-gray-400 font-medium">SELECT NETWORK</p>
            </div>

            <div className="p-2">
              {CHAINS.map((chain) => {
                const isSelected = chain.id === selectedChain.id;
                const isDisabled = !chain.enabled && !evmEnabled;

                return (
                  <button
                    key={chain.id}
                    onClick={() => handleChainSelect(chain)}
                    disabled={isDisabled}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                      ${isSelected ? 'bg-blue-500/10 border border-blue-500/30' : 'hover:bg-gray-800'}
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span className="text-2xl">{chain.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{chain.name}</span>
                        {chain.comingSoon && (
                          <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      {isDisabled && chain.type === 'evm' && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Configure Reown to enable
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="text-blue-400" size={18} />
                    )}
                  </button>
                );
              })}
            </div>

            {!evmEnabled && (
              <div className="p-3 border-t border-gray-800 bg-gray-800/50">
                <p className="text-xs text-gray-400 mb-2">
                  To enable EVM chains:
                </p>
                <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                  <li>Sign up at <span className="text-blue-400">cloud.reown.com</span></li>
                  <li>Add project ID to .env file</li>
                  <li>Restart development server</li>
                </ol>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
