import { useState } from 'react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useSwitchChain, useChainId } from 'wagmi';
import { mainnet, arbitrum, base, polygon } from 'wagmi/chains';
import { useChain, ChainType } from '@/contexts/ChainContext';
import { toast } from './ui/use-toast';

/**
 * ChainSelector Component with EVM Network Switching
 *
 * Allows users to switch between:
 * - Aptos blockchain
 * - EVM networks (Ethereum, Arbitrum, Base, Polygon)
 */

type Chain = {
  id: string;
  name: string;
  icon: string;
  type: 'aptos' | 'evm';
  enabled: boolean;
  chainId?: number;
  color?: string;
};

const CHAINS: Chain[] = [
  {
    id: 'aptos',
    name: 'Aptos',
    icon: '🟣',
    type: 'aptos',
    enabled: true,
    color: '#00D1B2',
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    icon: '⟠',
    type: 'evm',
    enabled: true,
    chainId: mainnet.id,
    color: '#627EEA',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    icon: '🔷',
    type: 'evm',
    enabled: true,
    chainId: arbitrum.id,
    color: '#28A0F0',
  },
  {
    id: 'base',
    name: 'Base',
    icon: '🔵',
    type: 'evm',
    enabled: true,
    chainId: base.id,
    color: '#0052FF',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    icon: '🟪',
    type: 'evm',
    enabled: true,
    chainId: polygon.id,
    color: '#8247E5',
  },
];

export const ChainSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const { selectedChain: selectedChainId, setSelectedChain } = useChain();
  const { connected: aptosConnected } = useWallet();

  // EVM network switching
  const { switchChain: switchEVMChain } = useSwitchChain();
  const currentEVMChainId = useChainId();

  // Check if Reown is configured
  const reownProjectId = import.meta.env.VITE_REOWN_PROJECT_ID;
  const evmEnabled = !!reownProjectId;

  // Find the selected chain object
  const selectedChain = CHAINS.find(c => c.id === selectedChainId) || CHAINS[0];

  const handleChainSelect = async (chain: Chain) => {
    if (!chain.enabled) {
      return;
    }

    // If selecting an EVM chain, switch the network
    if (chain.type === 'evm' && chain.chainId && evmEnabled) {
      if (!switchEVMChain) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect an EVM wallet first to switch networks.",
          variant: "destructive",
        });
        setIsOpen(false);
        return;
      }

      setIsSwitching(true);
      try {
        await switchEVMChain({ chainId: chain.chainId });

        // Update the context after successful switch
        setSelectedChain(chain.id as ChainType);

        toast({
          title: "Network Switched",
          description: `Successfully switched to ${chain.name}`,
        });
      } catch (error: any) {
        console.error('Network switch error:', error);

        let errorMessage = 'Failed to switch network. Please try again.';

        if (error.code === 4902) {
          errorMessage = `Please add ${chain.name} network to your wallet first.`;
        } else if (error.message?.includes('User rejected')) {
          errorMessage = 'Network switch cancelled by user.';
        }

        toast({
          title: "Network Switch Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsSwitching(false);
      }
    } else {
      // Aptos chain or EVM when Reown not configured
      setSelectedChain(chain.id as ChainType);
    }

    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors disabled:opacity-50"
      >
        <span className="text-xl">{selectedChain.icon}</span>
        <span className="text-white font-medium">{selectedChain.name}</span>
        {selectedChain.type === 'aptos' && aptosConnected && (
          <span className="w-2 h-2 bg-green-400 rounded-full" title="Connected" />
        )}
        {selectedChain.type === 'evm' && currentEVMChainId === selectedChain.chainId && (
          <span className="w-2 h-2 bg-green-400 rounded-full" title="Connected" />
        )}
        {isSwitching ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
        ) : (
          <ChevronDown
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            size={16}
          />
        )}
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
                const isSelected = chain.id === selectedChainId;
                const isCurrentEVMNetwork = chain.type === 'evm' && chain.chainId === currentEVMChainId;
                const isDisabled = chain.type === 'evm' && !evmEnabled;

                return (
                  <button
                    key={chain.id}
                    onClick={() => handleChainSelect(chain)}
                    disabled={isDisabled || isSwitching}
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
                        {isCurrentEVMNetwork && (
                          <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      {isDisabled && (
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
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle size={16} className="text-yellow-400 mt-0.5" />
                  <p className="text-xs text-gray-400">
                    To enable EVM networks:
                  </p>
                </div>
                <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside ml-4">
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
