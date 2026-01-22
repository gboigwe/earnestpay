# Base Network Configuration Guide

Complete guide for Base blockchain network configuration and management.

## Table of Contents

1. [Overview](#overview)
2. [Supported Networks](#supported-networks)
3. [Configuration Files](#configuration-files)
4. [Network Switching](#network-switching)
5. [Components](#components)
6. [Hooks](#hooks)
7. [Utilities](#utilities)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

EarnestPay is configured to work seamlessly with both Base Mainnet and Base Sepolia testnet, providing a complete blockchain payroll solution.

### Key Features

- ✅ **Dual Network Support**: Base Mainnet and Base Sepolia
- ✅ **Automatic Network Detection**: Identifies current network
- ✅ **One-Click Switching**: Easy network transitions
- ✅ **Network Guards**: Prevents wrong-network operations
- ✅ **Multiple RPC Fallbacks**: High availability
- ✅ **Network Status Monitoring**: Real-time health checks

## Supported Networks

### Base Mainnet

- **Chain ID**: 8453 (0x2105)
- **Native Currency**: ETH
- **Block Explorer**: https://basescan.org
- **RPC Endpoints**:
  - https://mainnet.base.org (Primary)
  - https://base.llamarpc.com
  - https://base.blockpi.network/v1/rpc/public
  - https://base-rpc.publicnode.com
  - https://1rpc.io/base

**Supported Tokens**:
- ETH (Native)
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- USDbC: `0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA`
- DAI: `0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb`
- cbETH: `0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22`

### Base Sepolia (Testnet)

- **Chain ID**: 84532 (0x14a34)
- **Native Currency**: ETH (Testnet)
- **Block Explorer**: https://sepolia.basescan.org
- **RPC Endpoints**:
  - https://sepolia.base.org (Primary)
  - https://base-sepolia.blockpi.network/v1/rpc/public
  - https://base-sepolia-rpc.publicnode.com

**Supported Tokens**:
- ETH (Native)
- USDC (Test): `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

**Get Testnet ETH**: [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

## Configuration Files

### networks.config.ts

Central network configuration with all network details:

```typescript
import { BASE_MAINNET_CONFIG, BASE_SEPOLIA_CONFIG } from '@/config/networks.config';

// Get network configuration
const config = getNetworkConfig(chainId);

// Check if supported
if (isSupportedChain(chainId)) {
  // Network is supported
}

// Get network name
const name = getNetworkName(chainId);

// Get block explorer URLs
const addressUrl = getAddressExplorerUrl(chainId, address);
const txUrl = getTransactionExplorerUrl(chainId, txHash);
```

### rpc.config.ts

RPC provider configuration with fallbacks:

```typescript
import { getRpcConfig, getPrimaryRpcUrl } from '@/config/rpc.config';

// Get all RPC URLs for a chain
const rpcUrls = getAllRpcUrls(8453);

// Get primary RPC
const primaryRpc = getPrimaryRpcUrl(8453);
```

### tokens.config.ts

Token configurations for each network:

```typescript
import {
  getTokensByChainId,
  getTokenBySymbol,
  getNativeToken,
  getStablecoins,
} from '@/config/tokens.config';

// Get all tokens for chain
const tokens = getTokensByChainId(8453);

// Get specific token
const usdc = getTokenBySymbol('USDC', 8453);

// Get stablecoins only
const stables = getStablecoins(8453);
```

### wagmi.config.ts

Wagmi/Viem configuration:

```typescript
import { wagmiConfig } from '@/config/wagmi.config';

// Used with WagmiProvider
<WagmiProvider config={wagmiConfig}>
  <App />
</WagmiProvider>
```

## Network Switching

### Manual Switching

Users can switch networks using the Network Indicator component:

```tsx
import { NetworkIndicator } from '@/components/NetworkIndicator';

function Header() {
  return (
    <div className="flex items-center gap-4">
      <NetworkIndicator />
    </div>
  );
}
```

### Programmatic Switching

Switch networks in code:

```typescript
import { useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'viem/chains';

function MyComponent() {
  const { switchChain } = useSwitchChain();

  const switchToMainnet = () => {
    switchChain({ chainId: base.id });
  };

  const switchToTestnet = () => {
    switchChain({ chainId: baseSepolia.id });
  };

  return (
    <div>
      <button onClick={switchToMainnet}>Switch to Mainnet</button>
      <button onClick={switchToTestnet}>Switch to Testnet</button>
    </div>
  );
}
```

### Utility Functions

```typescript
import { switchNetwork, ensureCorrectNetwork } from '@/utils/network';

// Switch network
await switchNetwork(8453);

// Ensure correct network
const isCorrect = await ensureCorrectNetwork(8453);
if (!isCorrect) {
  // User cancelled or error occurred
}
```

## Components

### NetworkIndicator

Main network indicator with dropdown:

```tsx
import { NetworkIndicator } from '@/components/NetworkIndicator';

<NetworkIndicator />
```

**Features**:
- Shows current network
- Network switching dropdown
- Testnet badge
- Unsupported network warning

### NetworkIndicatorCompact

Compact version for mobile/limited space:

```tsx
import { NetworkIndicatorCompact } from '@/components/NetworkIndicator';

<NetworkIndicatorCompact />
```

### NetworkGuard

Prevents operations on wrong network:

```tsx
import { NetworkGuard } from '@/components/NetworkIndicator';
import { base } from 'viem/chains';

// Block if not on supported network
<NetworkGuard>
  <MyComponent />
</NetworkGuard>

// Require specific network
<NetworkGuard requiredChainId={base.id}>
  <MainnetOnlyFeature />
</NetworkGuard>
```

## Hooks

### useNetwork

Main hook for network management:

```typescript
import { useNetwork } from '@/hooks/useNetwork';

function MyComponent() {
  const {
    chainId,
    networkName,
    isSupported,
    isTestnet,
    switchNetwork,
    isSwitching,
    tokens,
    getAddressUrl,
    getTransactionUrl,
  } = useNetwork();

  return (
    <div>
      <p>Current Network: {networkName}</p>
      {isTestnet && <span>Testnet Mode</span>}
      {!isSupported && <button onClick={() => switchNetwork(8453)}>
        Switch to Base
      </button>}
    </div>
  );
}
```

### useNetworkChange

Watch for network changes:

```typescript
import { useNetworkChange } from '@/hooks/useNetwork';

function MyComponent() {
  useNetworkChange((chainId) => {
    console.log('Network changed to:', chainId);
    // Reload data, update state, etc.
  });

  return <div>...</div>;
}
```

### useRequireNetwork

Enforce required network:

```typescript
import { useRequireNetwork } from '@/hooks/useNetwork';
import { base } from 'viem/chains';

function MainnetFeature() {
  const { isCorrectNetwork, switchToRequired, isSwitching } =
    useRequireNetwork(base.id);

  if (!isCorrectNetwork) {
    return (
      <button onClick={switchToRequired} disabled={isSwitching}>
        {isSwitching ? 'Switching...' : 'Switch to Base Mainnet'}
      </button>
    );
  }

  return <div>Feature content...</div>;
}
```

### useNetworkFeature

Check if network supports a feature:

```typescript
import { useNetworkFeature } from '@/hooks/useNetwork';

function MyComponent() {
  const supportsEIP1559 = useNetworkFeature('eip1559');
  const supportsMulticall = useNetworkFeature('multicall');

  return (
    <div>
      {supportsEIP1559 && <p>Uses modern gas pricing</p>}
      {supportsMulticall && <p>Batch calls supported</p>}
    </div>
  );
}
```

### useNetworkStatus

Monitor network health:

```typescript
import { useNetworkStatus } from '@/hooks/useNetwork';

function NetworkStatus() {
  const { isOnline, latency, blockNumber } = useNetworkStatus();

  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      {latency && <p>Latency: {latency}ms</p>}
      {blockNumber && <p>Block: {blockNumber}</p>}
    </div>
  );
}
```

## Utilities

### Network Utils

```typescript
import {
  switchNetwork,
  addNetwork,
  checkNetwork,
  getCurrentNetwork,
  ensureCorrectNetwork,
  getChainById,
  isNetworkAvailable,
  getNetworkStatus,
  watchNetwork,
  getDefaultNetwork,
  validateNetworkConfig,
} from '@/utils/network';

// Check current network
const currentChainId = await getCurrentNetwork();

// Validate network is available
const isAvailable = await isNetworkAvailable(8453);

// Get network status with details
const status = await getNetworkStatus(8453);
// { available: true, latency: 120, blockNumber: 12345678 }

// Watch for changes
const unwatch = watchNetwork((chainId) => {
  console.log('Network changed:', chainId);
});

// Get default network for environment
const defaultChainId = getDefaultNetwork();
```

## Best Practices

### 1. Always Check Network

Before performing blockchain operations:

```typescript
import { useNetwork } from '@/hooks/useNetwork';

function TransferComponent() {
  const { isSupported, switchNetwork } = useNetwork();

  const handleTransfer = () => {
    if (!isSupported) {
      switchNetwork(8453);
      return;
    }

    // Proceed with transfer
  };
}
```

### 2. Use Network Guards

Wrap sensitive features:

```tsx
<NetworkGuard requiredChainId={base.id}>
  <ProductionFeature />
</NetworkGuard>
```

### 3. Handle Network Changes

React to network switches:

```typescript
useNetworkChange((chainId) => {
  // Clear cache
  // Reload data
  // Update UI
});
```

### 4. Provide Clear Feedback

Show network status to users:

```tsx
<NetworkIndicator />
{isTestnet && (
  <div className="bg-yellow-50 p-3">
    ⚠️ You're on testnet. Transactions use test ETH.
  </div>
)}
```

### 5. Use RPC Fallbacks

The configuration includes multiple RPC endpoints that automatically fallback if one fails.

### 6. Test on Both Networks

Always test features on both mainnet and testnet:

```typescript
const CHAIN_ID = process.env.NODE_ENV === 'production' ? 8453 : 84532;
```

## Troubleshooting

### Network Not Showing

**Problem**: Wallet doesn't show Base network

**Solution**: Add network manually:

```typescript
import { addNetwork } from '@/utils/network';

await addNetwork(8453); // Base Mainnet
await addNetwork(84532); // Base Sepolia
```

### RPC Connection Fails

**Problem**: Can't connect to RPC

**Solution**: The configuration automatically tries fallback RPCs. If all fail:

1. Check internet connection
2. Check if Base network is experiencing issues
3. Try different RPC manually

### Wrong Network Warning

**Problem**: App shows wrong network warning

**Solution**: Click "Switch Network" or use:

```typescript
const { switchNetwork } = useNetwork();
switchNetwork(8453); // Switch to Base
```

### Transactions Failing

**Problem**: Transactions fail on testnet

**Solution**:
1. Ensure you have testnet ETH
2. Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
3. Check gas settings

### Can't Switch Networks

**Problem**: Wallet won't switch networks

**Solution**:
1. Ensure wallet supports Base
2. Try adding network first: `addNetwork(8453)`
3. Switch manually in wallet

## Environment Variables

Set default network in `.env`:

```bash
# Use mainnet by default
VITE_DEFAULT_NETWORK=mainnet

# Use testnet by default
VITE_DEFAULT_NETWORK=testnet
```

## Additional Resources

- [Base Documentation](https://docs.base.org/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)

---

**Last Updated**: January 2026
