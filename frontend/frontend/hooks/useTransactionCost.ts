import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network, AccountAddress } from '@aptos-labs/ts-sdk';

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

  const estimateGas = async (transaction: {
    sender: string;
    payload: any;
    maxGasAmount?: string | number;
  }): Promise<TransactionCost> => {
    setLoading(true);
    setError(null);

    try {
      // Initialize Aptos client with the correct network
      const config = new AptosConfig({ network: Network.TESTNET });
      const client = new Aptos(config);
      
      // Get gas price estimation
      const gasPrice = await client.estimateGasPrice();
      
      // Simulate the transaction to get gas used
      const senderAddress = AccountAddress.fromString(transaction.sender);
      const simulation = await client.transaction.simulate.simple({
        signerPublicKey: senderAddress, // Using signerPublicKey instead of sender
        transaction: {
          sender: senderAddress,
          data: transaction.payload,
          options: {
            maxGasAmount: transaction.maxGasAmount?.toString() || '100000',
          },
        },
        withEffects: true,
        estimateGasUnitPrice: true,
        estimateMaxGasAmount: true,
      });

      if (!simulation[0]?.success) {
        throw new Error('Transaction simulation failed');
      }

      const gasUsed = Number(simulation[0].gas_used);
      const gasPriceValue = Number(gasPrice.gas_estimate);
      const gasFee = (gasUsed * gasPriceValue) / 1e8; // Convert to APT

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
