# Transaction Handling Guide

Complete transaction lifecycle management for Base blockchain with status tracking, history, and user-friendly confirmation dialogs.

## Features

✅ Transaction status tracking with real-time updates
✅ Persistent transaction history in local storage
✅ Transaction confirmation modal with progress tracking
✅ Automatic retry and error handling
✅ Block explorer integration
✅ Gas usage tracking
✅ Transaction filtering and search

## Quick Start

### 1. Submit Transaction with Confirmation

```typescript
import { useState } from 'react';
import { TransactionConfirmation } from '@/components';
import { saveTransaction } from '@/utils/transactions';

function MyComponent() {
  const [txHash, setTxHash] = useState<Hash>();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async () => {
    // Submit your transaction
    const hash = await walletClient.writeContract({...});

    // Save to history
    saveTransaction({
      hash,
      status: 'pending',
      metadata: {
        type: 'create_employee',
        description: 'Creating new employee profile',
        fromAddress: account,
        timestamp: Date.now(),
      },
      confirmations: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    setTxHash(hash);
    setShowConfirmation(true);
  };

  return (
    <>
      <button onClick={handleSubmit}>Submit</button>

      <TransactionConfirmation
        hash={txHash}
        type="create_employee"
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onSuccess={() => console.log('Transaction confirmed!')}
      />
    </>
  );
}
```

### 2. Display Transaction History

```typescript
import { TransactionHistoryEnhanced } from '@/components';

function HistoryPage() {
  return (
    <div>
      <h1>My Transactions</h1>
      <TransactionHistoryEnhanced
        maxItems={50}
        showFilters={true}
      />
    </div>
  );
}
```

### 3. Track Transaction Status

```typescript
import { useTransactionStatus } from '@/hooks';

function StatusTracker({ hash }: { hash: Hash }) {
  const { status, confirmations, isSuccess, isError } = useTransactionStatus({
    hash,
    onSuccess: (receipt) => {
      console.log('Transaction confirmed!', receipt);
    },
    onError: (error) => {
      console.error('Transaction failed:', error);
    },
  });

  return (
    <div>
      <p>Status: {status}</p>
      <p>Confirmations: {confirmations}</p>
    </div>
  );
}
```

## Components

### TransactionConfirmation

Modal dialog that shows transaction status with automatic updates.

**Props:**
```typescript
interface TransactionConfirmationProps {
  hash?: Hash;
  type: TransactionType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}
```

**Features:**
- Real-time status updates
- Confirmation progress bar
- Block explorer link
- Auto-close on success (configurable)
- Error display with details

### TransactionHistoryEnhanced

Enhanced transaction history with filtering and details.

**Props:**
```typescript
interface TransactionHistoryEnhancedProps {
  address?: Address;
  maxItems?: number;
  showFilters?: boolean;
}
```

**Features:**
- Status filtering (all, confirmed, pending, failed)
- Expandable transaction details
- Copy transaction hash
- Clear history option
- Gas usage display
- Relative timestamps

### TransactionStatusBadge

Compact status badge for inline display.

```typescript
<TransactionStatusBadge
  hash={txHash}
  type="process_payment"
/>
```

## Hooks

### useTransactionStatus

Track single transaction status with automatic polling.

```typescript
const {
  status,
  receipt,
  confirmations,
  isLoading,
  isSuccess,
  isError,
  error,
  transaction,
} = useTransactionStatus({
  hash: txHash,
  enabled: true,
  onSuccess: (receipt) => {},
  onError: (error) => {},
  onConfirmation: (count) => {},
});
```

**Options:**
- `hash` - Transaction hash to track
- `enabled` - Enable/disable tracking
- `onSuccess` - Callback when transaction confirms
- `onError` - Callback on error
- `onConfirmation` - Callback on each confirmation

**Auto-polling:**
- Polls every 3 seconds while pending/confirming
- Stops polling when confirmed or failed
- Automatic cleanup on unmount

### useMultipleTransactionStatus

Track multiple transactions simultaneously.

```typescript
const { statuses, refresh } = useMultipleTransactionStatus([
  hash1,
  hash2,
  hash3,
]);

statuses.get(hash1)?.status; // 'confirmed'
```

## Utilities

### Transaction Storage

```typescript
import {
  getTransactionHistory,
  saveTransaction,
  updateTransactionStatus,
  clearTransactionHistory,
  getTransactionByHash,
  getPendingTransactions,
  getFailedTransactions,
} from '@/utils/transactions';

// Get all transactions for an address
const history = getTransactionHistory(userAddress);

// Get specific transaction
const tx = getTransactionByHash(hash);

// Get pending transactions
const pending = getPendingTransactions(userAddress);

// Clear all history
clearTransactionHistory();
```

### Transaction Helpers

```typescript
import {
  formatTransactionAge,
  getBlockExplorerUrl,
  getTransactionStatusColor,
  getTransactionTypeDescription,
  isTransactionFinalized,
} from '@/utils/transactions';

// Format age
const age = formatTransactionAge(timestamp); // "5m ago"

// Get explorer URL
const url = getBlockExplorerUrl(hash, chainId);

// Get status colors
const colors = getTransactionStatusColor('confirmed');
// { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' }

// Get human-readable description
const desc = getTransactionTypeDescription('create_employee');
// "Employee Creation"

// Check if finalized
const isFinalized = isTransactionFinalized(confirmations, chainId);
```

## Transaction Types

Supported transaction types:

```typescript
type TransactionType =
  | 'register_company'
  | 'create_employee'
  | 'update_salary'
  | 'deactivate_employee'
  | 'process_payment'
  | 'batch_payment'
  | 'configure_tax'
  | 'other';
```

## Transaction Statuses

```typescript
type TransactionStatus =
  | 'pending'      // Submitted to network
  | 'confirming'   // In block, awaiting confirmations
  | 'confirmed'    // Fully confirmed
  | 'failed'       // Transaction failed
  | 'reverted';    // Transaction reverted
```

## Base Blockchain Specifics

### Fast Finality
Base has ~2 second block times and fast finality:
- **1 confirmation** is usually sufficient
- Polling interval: 3 seconds
- Quick user feedback

### Low Gas Costs
Base transactions are very cheap:
- Typical cost: < $0.01
- Gas tracking helps monitor costs
- Batch operations still recommended for multiple txs

## Complete Example

```typescript
import { useState } from 'react';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import {
  TransactionConfirmation,
  TransactionHistoryEnhanced,
} from '@/components';
import {
  createEmployeeOptimized,
  saveTransaction,
  type TransactionType,
} from '@/utils';

function EmployeeForm() {
  const [txHash, setTxHash] = useState<Hash>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { address } = useAccount();
  const walletClient = useWalletClient();
  const publicClient = usePublicClient();

  const handleSubmit = async (data: EmployeeData) => {
    if (!walletClient || !publicClient || !address) return;

    try {
      // Submit transaction with gas optimization
      const { hash, gasUsed } = await createEmployeeOptimized(
        publicClient,
        walletClient.data,
        address,
        data
      );

      // Save to history immediately
      saveTransaction({
        hash,
        status: 'pending',
        metadata: {
          type: 'create_employee',
          description: `Creating employee: ${data.firstName} ${data.lastName}`,
          fromAddress: address,
          timestamp: Date.now(),
        },
        confirmations: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Show confirmation modal
      setTxHash(hash);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Transaction error:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button type="submit">Create Employee</button>
      </form>

      <button onClick={() => setShowHistory(true)}>
        View History
      </button>

      {/* Transaction Confirmation Modal */}
      <TransactionConfirmation
        hash={txHash}
        type="create_employee"
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onSuccess={() => {
          toast.success('Employee created successfully!');
          // Refresh employee list
        }}
        onError={() => {
          toast.error('Failed to create employee');
        }}
      />

      {/* Transaction History */}
      {showHistory && (
        <div className="modal">
          <TransactionHistoryEnhanced
            address={address}
            maxItems={50}
            showFilters={true}
          />
          <button onClick={() => setShowHistory(false)}>Close</button>
        </div>
      )}
    </div>
  );
}
```

## Storage Management

Transaction history is stored in localStorage:
- Key: `earnestpay_transactions`
- Max items: 100 (oldest removed automatically)
- Per-address filtering available
- Manual clear option in UI

**Important:** Users can clear history, but it doesn't affect on-chain data.

## Best Practices

### 1. Always Save Transactions
```typescript
// ✅ Good
const hash = await submitTransaction();
saveTransaction({...});

// ❌ Bad - No history tracking
const hash = await submitTransaction();
```

### 2. Provide User Feedback
```typescript
// ✅ Good - Show confirmation modal
<TransactionConfirmation
  hash={hash}
  isOpen={true}
  onClose={...}
  onSuccess={() => toast.success('Done!')}
/>

// ❌ Bad - No feedback
await submitTransaction();
```

### 3. Handle Errors Gracefully
```typescript
// ✅ Good
try {
  const hash = await submitTransaction();
  saveTransaction({...});
} catch (error) {
  toast.error('Transaction failed');
  console.error(error);
}
```

### 4. Update UI After Confirmation
```typescript
// ✅ Good
<TransactionConfirmation
  onSuccess={() => {
    refreshData();
    toast.success('Success!');
  }}
/>
```

## Troubleshooting

### Transaction Not Updating
- Check if polling is enabled
- Verify hash is correct
- Check network connection
- Try manual refresh

### History Not Showing
- Check localStorage availability
- Verify wallet is connected
- Check browser console for errors

### Slow Confirmations
- Base should confirm in ~2-6 seconds
- If slower, check network status
- Verify Base network is selected

## Resources

- [Base Documentation](https://docs.base.org/)
- [Viem Transaction Docs](https://viem.sh/docs/actions/public/getTransaction)
- [Wagmi Transaction Hooks](https://wagmi.sh/react/hooks/useTransaction)

## Future Enhancements

- [ ] Export transaction history (CSV/JSON)
- [ ] Advanced filtering (date range, amount)
- [ ] Transaction analytics dashboard
- [ ] Push notifications for confirmations
- [ ] Transaction notes/labels
- [ ] Multi-wallet support
