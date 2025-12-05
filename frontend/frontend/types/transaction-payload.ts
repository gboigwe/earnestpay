import { TransactionPayload as AptosTransactionPayload } from '@aptos-labs/ts-sdk';

export type TransactionPayload = {
  type: string;
  function: string;
  type_arguments: string[];
  arguments: unknown[];
} | AptosTransactionPayload;

export interface TransactionRequest {
  sender: string;
  payload: TransactionPayload;
  maxGasAmount?: string | number;
  gasUnitPrice?: string | number;
  expirationTimestampSecs?: string | number;
  chainId?: number;
}

export interface TransactionCost {
  gasFee: number;
  gasFeeUSD: number | null;
  gasPrice: number;
  gasLimit: number;
  loading: boolean;
  error: string | null;
}
