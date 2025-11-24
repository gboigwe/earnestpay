# 🏗️ Multi-Chain Architecture Documentation

Technical architecture and implementation details for EarnestPay's multi-chain support.

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture Layers](#architecture-layers)
3. [Component Design](#component-design)
4. [State Management](#state-management)
5. [Error Handling](#error-handling)
6. [Performance Optimizations](#performance-optimizations)
7. [Testing Strategy](#testing-strategy)
8. [Security Considerations](#security-considerations)

---

## Overview

EarnestPay's multi-chain architecture enables seamless support for multiple blockchain networks while maintaining code modularity, performance, and user experience.

### Design Principles

1. **Chain Agnostic**: Core business logic works independently of blockchain
2. **Progressive Enhancement**: Aptos works always, EVM is additive
3. **Type Safety**: Full TypeScript with strict mode
4. **Performance First**: Lazy loading, code splitting, bundle optimization
5. **Error Resilience**: Comprehensive error handling with recovery actions
6. **User Focused**: Smooth animations, helpful messages, intuitive UI

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Components (UI)                                     │   │
│  │  ├─ ChainSelector (dropdown + animations)          │   │
│  │  ├─ SplitWalletButton (unified connect)            │   │
│  │  ├─ EnhancedWalletModal (Aptos wallets)            │   │
│  │  ├─ EVMWalletModal (Reown AppKit)                  │   │
│  │  └─ ErrorBoundary (error recovery)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ State Management (Contexts + Hooks)                │   │
│  │  ├─ ChainContext (selected chain + connections)    │   │
│  │  ├─ useMultiChainErrorHandler (error handling)     │   │
│  │  └─ useAsyncOperation (loading states)             │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Error Handling (Custom Errors)                     │   │
│  │  ├─ MultiChainErrors.ts (error types)              │   │
│  │  └─ parseErrorMessage() (friendly messages)        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Wallet Providers (Blockchain Integration)          │   │
│  │  ├─ WalletProvider (Aptos)                         │   │
│  │  │   └─ @aptos-labs/wallet-adapter-react           │   │
│  │  ├─ ReownProvider (EVM)                            │   │
│  │  │   ├─ Wagmi (core hooks)                         │   │
│  │  │   ├─ Viem (low-level utilities)                 │   │
│  │  │   └─ Reown AppKit (UI + WalletConnect)          │   │
│  │  └─ MultiChainWalletProvider (unified wrapper)     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Blockchain Layer                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Aptos               │  Ethereum, Arbitrum, Base,    │   │
│  │ (Move contracts)    │  Polygon (Solidity contracts) │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Design

### 1. MultiChainWalletProvider

**Purpose**: Root provider that orchestrates all wallet connections

**Location**: `/frontend/frontend/components/MultiChainWalletProvider.tsx`

**Implementation**:
```typescript
export function MultiChainWalletProvider({ children }: PropsWithChildren) {
  const reownEnabled = !!import.meta.env.VITE_REOWN_PROJECT_ID;

  return (
    <WalletProvider>
      {reownEnabled ? (
        <Suspense fallback={<ReownLoadingFallback />}>
          <ReownProvider>{children}</ReownProvider>
        </Suspense>
      ) : (
        children
      )}
    </WalletProvider>
  );
}
```

**Key Features**:
- Lazy loads ReownProvider (reduces initial bundle by ~493 KB)
- Graceful degradation if Reown not configured
- Suspense-based loading state
- Proper provider nesting order (Aptos wrapper, EVM inner)

---

### 2. ChainContext

**Purpose**: Global state for chain selection and wallet connections

**Location**: `/frontend/frontend/contexts/ChainContext.tsx`

**State Schema**:
```typescript
interface ChainContextType {
  selectedChain: ChainType;                    // 'aptos' | 'ethereum' | 'arbitrum' | 'base' | 'polygon'
  setSelectedChain: (chain: ChainType) => void;
  isAptosChain: boolean;
  isEVMChain: boolean;
  walletConnections: {
    aptos: { isConnected: boolean; address?: string };
    evm: { isConnected: boolean; address?: string };
  };
  switchChain: (chain: ChainType, disconnectOthers?: boolean) => Promise<void>;
}
```

**Implementation Details**:
- **localStorage Persistence**: Saves selected chain across sessions
- **Safe Defaults**: Nullish coalescing prevents undefined errors
- **Optional Disconnect**: Can disconnect other chain when switching
- **Wallet State Tracking**: Monitors both Aptos and EVM connections

**Usage**:
```typescript
const { selectedChain, setSelectedChain, walletConnections } = useChain();
```

---

### 3. ChainSelector Component

**Purpose**: Dropdown for switching between blockchains

**Location**: `/frontend/frontend/components/ChainSelector.tsx`

**Features**:
- Animated dropdown with Framer Motion
- Pulsing connection indicators
- Network switching via Wagmi hooks
- Error handling for unsupported networks
- Visual feedback (icons, colors, badges)

**Chain Metadata**:
```typescript
const CHAINS = [
  { id: 'aptos', name: 'Aptos', icon: '🟣', color: '#00D1B2' },
  { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: '#627EEA', chainId: 1 },
  { id: 'arbitrum', name: 'Arbitrum', icon: '🔷', color: '#28A0F0', chainId: 42161 },
  { id: 'base', name: 'Base', icon: '🔵', color: '#0052FF', chainId: 8453 },
  { id: 'polygon', name: 'Polygon', icon: '🟪', color: '#8247E5', chainId: 137 },
];
```

**Animations**:
- Button hover: scale 1.02
- Icon rotation: -180° → 0° on chain switch
- Dropdown: slide down with scale (y: -10→0, scale: 0.95→1)
- List items: staggered by 50ms
- Checkmark: spring-based rotation

---

### 4. SplitWalletButton Component

**Purpose**: Smart wallet connection button

**Location**: `/frontend/frontend/components/SplitWalletButton.tsx`

**Logic Flow**:
```
User Clicks "Connect Wallet"
         ↓
    Opens Dropdown
         ↓
    User Selects Wallet Type
         ↓
    ┌─────────┴─────────┐
    ↓                   ↓
Aptos Wallet       EVM Wallet
    ↓                   ↓
EnhancedWalletModal  Reown AppKit Modal
    ↓                   ↓
Petra/Martian/etc   MetaMask/Coinbase/etc
```

**Lazy Loading**:
```typescript
const EnhancedWalletModal = lazy(() =>
  import('./EnhancedWalletModal').then(module => ({
    default: module.EnhancedWalletModal
  }))
);
```

**Benefits**:
- Only loads wallet modal code when user initiates connection
- Reduces initial bundle size
- Smooth loading animation during code fetch

---

### 5. Error Handling System

**Purpose**: User-friendly error messages with recovery actions

**Location**: `/frontend/frontend/errors/MultiChainErrors.ts`

**Error Class Hierarchy**:
```
MultiChainError (base)
├─ WalletConnectionError (wallet not found, connection failed)
├─ NetworkSwitchError (network not added, user rejection)
├─ TransactionError (gas estimation, execution failure)
├─ InsufficientBalanceError (not enough tokens)
├─ WalletNotFoundError (extension not installed)
├─ UserRejectedError (user cancelled operation)
├─ NetworkError (RPC issues, network down)
└─ UnsupportedOperationError (feature not supported on chain)
```

**Error Handler Hook**:
```typescript
const { handleError, handleWalletError, handleNetworkError } =
  useMultiChainErrorHandler();

// Usage
try {
  await switchEVMChain({ chainId: chain.chainId });
} catch (error) {
  handleNetworkError(error, fromChain, toChain, retryFn);
}
```

**Recovery Actions**:
- "Install Wallet" → Opens wallet download page
- "Try Again" → Retries failed operation
- "Add Funds" → Navigates to funding page
- "Add Network" → Shows network configuration

---

## State Management

### ChainContext Implementation

**Provider Setup**:
```typescript
export const ChainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedChain, setSelectedChainState] = useState<ChainType>(() => {
    // Load from localStorage
    const stored = localStorage.getItem('earnestpay_selected_chain');
    return (stored as ChainType) || 'aptos';
  });

  // Track wallet connections
  const aptosWallet = useWallet();
  const evmAccount = useAccount();

  const walletConnections = {
    aptos: {
      isConnected: aptosWallet.connected ?? false,
      address: aptosWallet.account?.address,
    },
    evm: {
      isConnected: evmAccount.isConnected ?? false,
      address: evmAccount.address,
    },
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('earnestpay_selected_chain', selectedChain);
  }, [selectedChain]);

  return (
    <ChainContext.Provider value={{ selectedChain, setSelectedChain, walletConnections }}>
      {children}
    </ChainContext.Provider>
  );
};
```

**Benefits**:
- Single source of truth for chain state
- Automatic persistence across sessions
- Type-safe chain types
- Wallet connection tracking

---

## Error Handling

### Error Flow

```
Error Occurs
     ↓
parseErrorMessage(error, chain)
     ↓
Determine Error Type
     ↓
Generate User-Friendly Message
     ↓
Determine Recovery Action
     ↓
Display Toast with Action Button
     ↓
User Clicks Action
     ↓
Execute Recovery (retry/install/add funds)
```

### Example: Network Switch Error

**Technical Error**:
```json
{
  "code": 4902,
  "message": "Unrecognized chain ID. Try adding the chain using wallet_addEthereumChain first."
}
```

**User-Friendly Message**:
```
Title: "Network Not Added"
Message: "Please add Base network to your wallet first."
Recovery Action: "Add Network" button
```

**Implementation**:
```typescript
if (error.code === 4902) {
  return new NetworkSwitchError(
    'Network not added',
    ERROR_MESSAGES.NETWORK_NOT_ADDED(chainName),
    fromChain,
    toChain,
    'Add Network'
  );
}
```

---

## Performance Optimizations

### 1. Code Splitting

**Manual Chunking Strategy** (`vite.config.ts`):
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react/jsx-runtime'],
          'aptos-wallet': ['@aptos-labs/wallet-adapter-react', '@aptos-labs/ts-sdk'],
          'evm-wallet-core': ['wagmi', 'viem'],
          'evm-wallet-reown': ['@reown/appkit', '@reown/appkit-adapter-wagmi'],
          'ui-radix': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'utils': ['framer-motion', 'lucide-react', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
});
```

**Results**:
- Initial bundle: 1,925 KB → 1,571 KB gzipped (-18.4%)
- EVM code (493 KB) lazy loads only when needed
- Better browser caching (vendor chunks rarely change)

### 2. Lazy Loading

**ReownProvider**:
```typescript
const ReownProvider = lazy(() =>
  import('@/components/ReownProvider').then(module => ({
    default: module.ReownProvider
  }))
);
```

**EnhancedWalletModal**:
```typescript
const EnhancedWalletModal = lazy(() =>
  import('./EnhancedWalletModal').then(module => ({
    default: module.EnhancedWalletModal
  }))
);
```

**Benefits**:
- Faster initial page load
- Only loads code when user interacts
- Reduced memory footprint

### 3. Animation Performance

**GPU-Accelerated Properties**:
```typescript
// ✅ Good (GPU-accelerated)
<motion.div
  animate={{ opacity: 1, scale: 1, x: 0 }}
/>

// ❌ Avoid (CPU-bound)
<motion.div
  animate={{ width: 200, height: 100 }}
/>
```

**Animation Best Practices**:
- Use `transform` (scale, translate, rotate) instead of top/left
- Use `opacity` for fade effects
- Avoid animating `width`, `height`, `padding`
- Use `will-change` sparingly

---

## Testing Strategy

### Test Suite Architecture

```
__tests__/
├─ mocks/
│  └─ wallets.ts              # Mock wallet providers
├─ contexts/
│  └─ ChainContext.test.tsx   # Context unit tests
├─ components/
│  └─ ChainSelector.test.tsx  # Component tests
└─ integration/
   └─ wallet-connection.test.tsx  # Integration tests
```

### Test Coverage Goals

- **Unit Tests**: >90% coverage
  - ChainContext
  - Error handlers
  - Utility functions

- **Component Tests**: >85% coverage
  - ChainSelector
  - SplitWalletButton
  - EnhancedWalletModal

- **Integration Tests**: >80% coverage
  - Wallet connection flows
  - Chain switching
  - Error scenarios

### Mock Strategy

**Aptos Wallet Mock**:
```typescript
export const createMockPetraWallet = () => ({
  name: 'Petra',
  connect: vi.fn().mockResolvedValue({
    address: '0x123...',
    publicKey: '0xabc...',
  }),
  disconnect: vi.fn().mockResolvedValue(undefined),
  connected: true,
});
```

**EVM Wallet Mock**:
```typescript
export const createMockWagmiAccount = () => ({
  address: '0x456...',
  isConnected: true,
  isConnecting: false,
  isDisconnected: false,
});
```

---

## Security Considerations

### 1. Environment Variables

**Safe Usage**:
```typescript
// ✅ Client-side only (VITE_ prefix)
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

// ❌ Never expose server secrets
// Don't use: REOWN_API_SECRET, PRIVATE_KEY, etc.
```

### 2. Wallet Permissions

**Limited Scope**:
- Request only necessary permissions
- Don't request `eth_accounts` until user initiates connection
- Clear permission requests in UI

### 3. Network Validation

**Chain ID Verification**:
```typescript
if (currentChainId !== expectedChainId) {
  throw new NetworkSwitchError('Wrong network');
}
```

### 4. Error Message Sanitization

**Don't Expose Sensitive Data**:
```typescript
// ✅ Good
logError(error, 'WalletConnect');  // Logs internally only

// ❌ Bad
console.error(error.stack);  // Exposes stack trace to user
```

---

## Future Enhancements

### Planned Features

1. **Balance Display** (Issue #22)
   - Fetch balances from all connected chains
   - Display in unified dashboard
   - Real-time updates via WebSocket

2. **Transaction History** (Issue #23)
   - Aggregate transactions from all chains
   - Unified timeline view
   - Filter by chain/type/date

3. **EVM Smart Contracts** (Issue #27)
   - Solidity payroll contracts
   - Cross-chain messaging
   - Bridge integration

### Architecture Considerations

**Scalability**:
- Add new chains with minimal code changes
- Modular wallet provider system
- Chain-agnostic business logic

**Performance**:
- Continue optimizing bundle size
- Implement virtual scrolling for large lists
- Add service worker for offline support

**User Experience**:
- Progressive Web App (PWA)
- Mobile-responsive design
- Multi-language support

---

## Appendix

### Key Files Reference

| File | Purpose | Lines of Code |
|------|---------|---------------|
| `MultiChainWalletProvider.tsx` | Root wallet provider | ~50 |
| `ChainContext.tsx` | Chain state management | ~120 |
| `ChainSelector.tsx` | Chain switching UI | ~320 |
| `SplitWalletButton.tsx` | Wallet connection UI | ~220 |
| `EnhancedWalletModal.tsx` | Aptos wallet modal | ~400 |
| `MultiChainErrors.ts` | Error definitions | ~350 |
| `useMultiChainErrorHandler.tsx` | Error handling hook | ~210 |
| `ErrorBoundary.tsx` | Error boundary | ~190 |

**Total**: ~1,860 lines of multi-chain code

### Dependencies

**Aptos**:
- `@aptos-labs/wallet-adapter-react`: ^3.7.1
- `@aptos-labs/ts-sdk`: ^1.32.1

**EVM**:
- `wagmi`: ^2.15.2
- `viem`: ^2.21.54
- `@reown/appkit`: ^1.6.3
- `@reown/appkit-adapter-wagmi`: ^1.6.3

**UI**:
- `framer-motion`: ^12.23.22
- `lucide-react`: ^0.469.0
- `@radix-ui/react-dialog`: ^1.1.2

**Testing**:
- `vitest`: ^2.1.8
- `@testing-library/react`: ^16.1.0
- `jsdom`: ^25.0.1

---

**Last Updated**: January 24, 2025
**Version**: 1.0.0
**Maintainer**: @gboigwe
