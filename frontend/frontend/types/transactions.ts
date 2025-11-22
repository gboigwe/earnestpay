export type ChainType = 'aptos' | 'ethereum' | 'arbitrum' | 'base' | 'polygon';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface UnifiedTransaction {
  hash: string;
  chain: ChainType;
  type: 'payment' | 'treasury_funding' | 'other';
  from: string;
  to: string;
  amount: string;
  token: 'APT' | 'ETH' | 'MATIC' | 'USDC' | 'USDT';
  timestamp: number;
  status: TransactionStatus;
  explorerUrl: string;
  label?: string;
}

export interface TransactionListProps {
  transactions: UnifiedTransaction[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export const formatAptosTransaction = (event: any): UnifiedTransaction => {
  // Convert Aptos event to unified format
  return {
    hash: event.txHash || event.version || '',
    chain: 'aptos',
    type: 'payment', // Default type, can be determined from event data
    from: event.from || '',
    to: event.to || '',
    amount: (event.amountOctas / 1e8).toString(), // Convert from octas to APT
    token: 'APT',
    timestamp: event.timestamp ? new Date(event.timestamp).getTime() : Date.now(),
    status: 'confirmed', // Default status for Aptos events
    explorerUrl: `https://explorer.aptoslabs.com/txn/${event.txHash || event.version}?network=mainnet`,
    label: event.label
  };
};

// Helper to get token symbol based on chain
export const getTokenSymbol = (chain: ChainType): 'APT' | 'ETH' | 'MATIC' | 'USDC' | 'USDT' => {
  switch (chain) {
    case 'aptos': return 'APT';
    case 'polygon': return 'MATIC';
    case 'ethereum':
    case 'arbitrum':
    case 'base':
    default:
      return 'ETH';
  }
};

// Helper to get explorer URL based on chain
export const getExplorerBaseUrl = (chain: ChainType): string => {
  const urls: Record<Exclude<ChainType, 'aptos'>, string> = {
    ethereum: 'https://etherscan.io/tx/',
    arbitrum: 'https://arbiscan.io/tx/',
    base: 'https://basescan.org/tx/',
    polygon: 'https://polygonscan.com/tx/'
  };
  
  return urls[chain as Exclude<ChainType, 'aptos'>] || 'https://etherscan.io/tx/';
};

export const formatEVMTransaction = (tx: any, chain: Exclude<ChainType, 'aptos'>): UnifiedTransaction => {
  const token = getTokenSymbol(chain);
  const explorerBaseUrl = getExplorerBaseUrl(chain);

  return {
    hash: tx.hash,
    chain,
    type: tx.to ? 'payment' : 'other',
    from: tx.from || '0x',
    to: tx.to || '0x',
    amount: tx.value ? (typeof tx.value === 'bigint' ? tx.value.toString() : String(tx.value)) : '0', // Will be formatted by the component
    token,
    timestamp: tx.blockTimestamp ? Number(tx.blockTimestamp) * 1000 : Date.now(),
    status: tx.status === 1 || tx.status === '0x1' ? 'confirmed' : 'failed',
    explorerUrl: `${explorerBaseUrl}${tx.hash}`
  };
};
