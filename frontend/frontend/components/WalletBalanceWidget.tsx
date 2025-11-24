import React, { useEffect, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import { useBalance } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { useChain, ChainType } from '@/contexts/ChainContext';
import { formatUnits } from 'viem';

interface BalanceItemProps {
  chain: string;
  symbol: string;
  balance: string | null;
  usdValue?: number;
  loading: boolean;
}

const BalanceItem: React.FC<BalanceItemProps> = ({ chain, symbol, balance, usdValue, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {chain} {symbol}
        </span>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          {balance} {symbol}
        </div>
        {usdValue !== undefined && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ${usdValue.toFixed(2)} USD
          </div>
        )}
      </div>
    </div>
  );
};

export const WalletBalanceWidget: React.FC = () => {
  const { account } = useWallet();
  const { selectedChain } = useChain();
  const chainIdMap: Record<ChainType, number> = {
    ethereum: 1,
    arbitrum: 42161,
    base: 8453,
    polygon: 137,
    aptos: 0, // Not used for EVM
  };
  const [aptBalance, setAptBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState({
    aptos: true,
    evm: true
  });

  // Fetch Aptos balance
  useEffect(() => {
    const fetchAptosBalance = async () => {
      if (!account?.address) {
        setAptBalance(null);
        setIsLoading(prev => ({ ...prev, aptos: false }));
        return;
      }

      try {
        setIsLoading(prev => ({ ...prev, aptos: true }));
        // @ts-ignore - The type definition seems to be incorrect
        const aptos = new Aptos(new AptosConfig({ network: 'mainnet' }));
        const balance = await aptos.getAccountAPTAmount({ accountAddress: account.address });
        // Convert from octas to APT (1 APT = 10^8 octas)
        const aptBalance = (parseInt(balance.toString()) / 10**8).toFixed(2);
        setAptBalance(aptBalance);
      } catch (error) {
        console.error('Error fetching Aptos balance:', error);
        setAptBalance('0.00');
      } finally {
        setIsLoading(prev => ({ ...prev, aptos: false }));
      }
    };

    fetchAptosBalance();
  }, [account?.address]);

  // Fetch EVM balance based on selected chain
  const isEVMChain = selectedChain !== 'aptos';
  const { data: evmBalance, isLoading: isEvmLoading } = useBalance({
    address: account?.address as `0x${string}` | undefined,
    chainId: chainIdMap[selectedChain],
    // @ts-ignore - enabled is a valid property in newer versions
    enabled: !!account?.address && isEVMChain,
  });

  // Update loading state for EVM
  useEffect(() => {
    setIsLoading(prev => ({
      ...prev,
      evm: isEvmLoading && !!account?.address && isEVMChain
    }));
  }, [isEvmLoading, account?.address, isEVMChain]);

  // Format EVM balance
  const formatEvmBalance = () => {
    if (!evmBalance || !evmBalance.value) return null;
    return parseFloat(formatUnits(evmBalance.value, evmBalance.decimals)).toFixed(4);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Wallet Balances
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Aptos Balance */}
          <BalanceItem
            chain="Aptos"
            symbol="APT"
            balance={aptBalance}
            loading={isLoading.aptos}
          />

          {/* EVM Balance - Only show if EVM chain is selected */}
          {isEVMChain && (
            <BalanceItem
              chain={selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)}
              symbol={evmBalance?.symbol || (selectedChain === 'polygon' ? 'MATIC' : 'ETH')}
              balance={formatEvmBalance()}
              loading={isLoading.evm}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalanceWidget;
