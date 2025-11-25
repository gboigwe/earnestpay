import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptosClient } from 'aptos';
import { aptosClient } from '@/utils/aptosClient';

type GasEstimate = {
  gas_estimate: number;
  gas_unit_price: number;
  gas_fee: number; // gas_estimate * gas_unit_price
  max_gas: number;
  min_gas_price: number;
  max_gas_price: number;
};

type TransactionCost = {
  gasFee: number; // in APT
  gasFeeUSD: number | null;
  gasPrice: number;
  gasLimit: number;
  loading: boolean;
  error: string | null;
};

export function useTransactionCost() {
  const [aptPrice, setAptPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { network } = useWallet();

  // Fetch APT price in USD
  useEffect(() => {
    const fetchAptPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd');
        const data = await response.json();
        setAptPrice(data.aptos?.usd || null);
      } catch (err) {
        console.error('Failed to fetch APT price:', err);
        setAptPrice(null);
      }
    };

    fetchAptPrice();
    const interval = setInterval(fetchAptPrice, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const estimateGas = async (transaction: any): Promise<TransactionCost> => {
    setLoading(true);
    setError(null);

    try {
      // Get gas estimation from the node
      const client = aptosClient(network?.name.toLowerCase() || 'testnet');
      const gasEstimate = await client.estimateGasPrice();
      
      // Simulate the transaction to get gas used
      const txnRequest = await client.generateTransaction(transaction.sender, transaction.payload);
      const simulation = await client.simulateTransaction(transaction.sender, txnRequest.payload, {
        estimateGasUnitPrice: true,
        estimateMaxGasAmount: true,
      });

      if (!simulation[0]?.success) {
        throw new Error('Transaction simulation failed');
      }

      const gasUsed = Number(simulation[0].gas_used);
      const gasPrice = Number(gasEstimate.gas_estimate);
      const gasFee = (gasUsed * gasPrice) / 1e8; // Convert to APT

      return {
        gasFee,
        gasFeeUSD: aptPrice ? gasFee * aptPrice : null,
        gasPrice,
        gasLimit: gasUsed,
        loading: false,
        error: null,
      };
    } catch (err: any) {
      console.error('Error estimating gas:', err);
      setError(err.message || 'Failed to estimate gas');
      return {
        gasFee: 0,
        gasFeeUSD: null,
        gasPrice: 0,
        gasLimit: 0,
        loading: false,
        error: err.message || 'Failed to estimate gas',
      };
    } finally {
      setLoading(false);
    }
  };

  return { estimateGas, aptPrice, loading, error };
}
