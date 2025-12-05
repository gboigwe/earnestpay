export type Address = `0x${string}` | string;

export interface GasEstimate {
  gasFee: number;
  gasFeeUSD: number | null;
  gasPrice: number;
  gasLimit: number;
  loading: boolean;
  error: string | null;
}

export interface TransactionRequest {
  to?: Address;
  from?: Address;
  value?: string | bigint;
  data?: string;
  gasPrice?: string | bigint;
  gasLimit?: string | bigint;
  chainId?: number;
  nonce?: number;
  // Add any other transaction properties that might be needed
  [key: string]: any;
}

export interface TransactionResponse {
  hash: string;
  wait: () => Promise<TransactionReceipt>;
  // Add other response properties as needed
}

export interface TransactionReceipt {
  status: 'success' | 'reverted' | 'failed';
  transactionHash: string;
  blockNumber: number;
  gasUsed: bigint;
  // Add other receipt properties as needed
}

export interface TransactionButtonProps {
  transaction: TransactionRequest | undefined;
  onSuccess?: (result: TransactionResponse) => void;
  onError?: (error: Error) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  showGasEstimate?: boolean;
}
