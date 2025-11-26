# TransactionModal Usage Guide

The `TransactionModal` component provides comprehensive visual feedback for all transaction states, from initial confirmation through to success or failure.

## Features

- ✅ Transaction confirmation with gas estimates
- ✅ "Waiting for signature" state with spinner
- ✅ Pending transaction state with hash display
- ✅ Success state with transaction hash and explorer link
- ✅ Error state with detailed error messages
- ✅ Multi-chain support (Aptos, Ethereum, Arbitrum, Base, Polygon)

## Quick Start with Hook

The easiest way to use the TransactionModal is with the `useTransactionModal` hook:

```tsx
import { TransactionModal } from '@/components/TransactionModal';
import { useTransactionModal } from '@/hooks/useTransactionModal';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

function SendTokens() {
  const { signAndSubmitTransaction, account } = useWallet();
  const modal = useTransactionModal({
    onSuccess: (hash) => console.log('Transaction successful:', hash),
    onError: (error) => console.error('Transaction failed:', error),
  });

  const handleSend = async () => {
    modal.open();

    await modal.execute(async () => {
      const response = await signAndSubmitTransaction({
        sender: account!.address,
        data: {
          function: '0x1::coin::transfer',
          typeArguments: ['0x1::aptos_coin::AptosCoin'],
          functionArguments: [recipientAddress, amount],
        },
      });
      return response.hash;
    });
  };

  return (
    <>
      <button onClick={handleSend}>Send Tokens</button>

      <TransactionModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onConfirm={handleSend}
        state={modal.state}
        transactionHash={modal.transactionHash}
        error={modal.error}
        transactionDetails={{
          title: 'Send APT',
          description: 'Transfer APT tokens to another wallet',
          from: account?.address || '',
          to: recipientAddress,
          amount: '10',
          token: 'APT',
        }}
        chain="aptos"
      />
    </>
  );
}
```

## Manual State Management

For more control, you can manage the state manually:

```tsx
import { TransactionModal, TransactionState } from '@/components/TransactionModal';
import { useState } from 'react';

function ManualExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<TransactionState>('idle');
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();

  const handleConfirm = async () => {
    try {
      // 1. Set signing state
      setState('signing');

      // 2. Sign transaction
      const response = await signAndSubmitTransaction({ /* ... */ });

      // 3. Set pending state with hash
      setState('pending');
      setTxHash(response.hash);

      // 4. Wait for confirmation (optional)
      await waitForTransaction(response.hash);

      // 5. Set success state
      setState('success');
    } catch (err: any) {
      // 6. Handle errors
      setState('error');
      setError(err.message);
    }
  };

  return (
    <TransactionModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onConfirm={handleConfirm}
      state={state}
      transactionHash={txHash}
      error={error}
      transactionDetails={{
        title: 'Transfer Tokens',
        from: senderAddress,
        to: recipientAddress,
        amount: '100',
      }}
    />
  );
}
```

## Transaction States

The modal supports five states:

### 1. `idle` - Initial Confirmation
Shows transaction details and gas estimates. User can confirm or cancel.

```tsx
state="idle"
```

### 2. `signing` - Waiting for Wallet Signature
Shows spinner with "Waiting for Signature" message.

```tsx
state="signing"
```

### 3. `pending` - Transaction Submitted
Shows spinner with "Transaction Pending" message and transaction hash.

```tsx
state="pending"
transactionHash="0x1234..."
```

### 4. `success` - Transaction Confirmed
Shows success checkmark, transaction hash, and link to block explorer.

```tsx
state="success"
transactionHash="0x1234..."
```

### 5. `error` - Transaction Failed
Shows error icon and error message.

```tsx
state="error"
error="Insufficient funds for gas"
```

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Called when modal should close |
| `onConfirm` | `() => Promise<void>` | Transaction submission function |
| `transactionDetails` | `object` | Transaction information to display |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `TransactionState` | `'idle'` | Current transaction state |
| `transactionHash` | `string` | - | Transaction hash (for pending/success states) |
| `error` | `string` | - | Error message (for error state) |
| `explorerUrl` | `string` | - | Custom block explorer URL |
| `gasEstimate` | `object` | - | Gas fee estimation data |
| `chain` | `string` | `'aptos'` | Blockchain network |

### Transaction Details Object

```tsx
transactionDetails={{
  title: string;           // Modal title
  description?: string;    // Optional description
  from: string;           // Sender address
  to: string;             // Recipient address
  amount?: string;        // Optional amount
  token?: string;         // Optional token symbol
}}
```

### Gas Estimate Object

```tsx
gasEstimate={{
  gasFee: number;          // Total gas fee in native token
  gasFeeUSD: number | null; // Gas fee in USD
  gasPrice: number;        // Gas price
  gasLimit: number;        // Gas limit
  loading: boolean;        // Is estimation loading
  error: string | null;    // Estimation error
}}
```

## Multi-Chain Support

The modal automatically shows the correct block explorer for each chain:

```tsx
// Aptos
<TransactionModal chain="aptos" transactionHash="0x..." />
// Links to: https://explorer.aptoslabs.com/txn/0x...

// Ethereum
<TransactionModal chain="ethereum" transactionHash="0x..." />
// Links to: https://etherscan.io/tx/0x...

// Arbitrum
<TransactionModal chain="arbitrum" transactionHash="0x..." />
// Links to: https://arbiscan.io/tx/0x...

// Base
<TransactionModal chain="base" transactionHash="0x..." />
// Links to: https://basescan.org/tx/0x...

// Polygon
<TransactionModal chain="polygon" transactionHash="0x..." />
// Links to: https://polygonscan.com/tx/0x...
```

## Custom Explorer URL

You can provide a custom explorer URL instead of using the default:

```tsx
<TransactionModal
  explorerUrl={`https://custom-explorer.com/tx/${txHash}`}
  transactionHash={txHash}
/>
```

## Best Practices

1. **Always show gas estimates** in the idle state so users know the cost upfront
2. **Handle user rejection** gracefully - don't show error state for cancelled transactions
3. **Auto-close on success** after a delay to let users see the success state
4. **Provide meaningful error messages** instead of raw error codes
5. **Test all states** to ensure smooth UX flow

## Example: Complete Transaction Flow

```tsx
function CompleteExample() {
  const { account, signAndSubmitTransaction } = useWallet();
  const { estimateGas } = useTransactionCost();
  const modal = useTransactionModal();
  const [gasEstimate, setGasEstimate] = useState(null);

  // Estimate gas when modal opens
  useEffect(() => {
    if (modal.isOpen && modal.state === 'idle') {
      estimateGas({ /* transaction */ }).then(setGasEstimate);
    }
  }, [modal.isOpen, modal.state]);

  const handleSend = async () => {
    await modal.execute(async () => {
      const response = await signAndSubmitTransaction({ /* ... */ });
      return response.hash;
    });
  };

  return (
    <TransactionModal
      isOpen={modal.isOpen}
      onClose={modal.close}
      onConfirm={handleSend}
      state={modal.state}
      transactionHash={modal.transactionHash}
      error={modal.error}
      gasEstimate={gasEstimate}
      transactionDetails={{
        title: 'Send APT',
        from: account?.address || '',
        to: recipientAddress,
        amount: '10',
        token: 'APT',
      }}
      chain="aptos"
    />
  );
}
```
