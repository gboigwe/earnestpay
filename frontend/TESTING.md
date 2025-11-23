# Multi-Chain Testing Suite

Comprehensive testing documentation for the EarnestPay multi-chain wallet functionality.

## 📋 Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Coverage](#coverage)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The testing suite covers:

- ✅ **Unit Tests**: ChainContext, components, and utilities
- ✅ **Integration Tests**: Wallet connections, chain switching
- ✅ **Mock Providers**: Aptos (Petra) and EVM (MetaMask, Wagmi) wallets
- ✅ **Coverage Reporting**: Detailed coverage metrics with v8 provider

### Testing Framework

- **Vitest**: Fast, Vite-native testing framework
- **Testing Library**: React component testing utilities
- **jsdom**: Browser environment simulation

## 🚀 Setup

### Install Dependencies

```bash
npm install
```

This will install all testing dependencies including:
- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `@vitest/ui`
- `@vitest/coverage-v8`
- `jsdom`

### Configuration Files

- **`vitest.config.ts`**: Main Vitest configuration
- **`vitest.setup.ts`**: Global test setup and mocks
- **`__tests__/`**: Test files directory

## 🧪 Running Tests

### Run All Tests (Watch Mode)

```bash
npm test
```

This runs tests in watch mode, re-running on file changes.

### Run Tests Once

```bash
npm run test:run
```

Runs all tests once and exits.

### Run Tests with UI

```bash
npm run test:ui
```

Opens an interactive UI to view and run tests.

### Generate Coverage Report

```bash
npm run test:coverage
```

Generates detailed coverage reports in:
- `coverage/index.html` - HTML report
- `coverage/lcov.info` - LCOV format
- `coverage/coverage-final.json` - JSON format

## 📁 Test Structure

```
frontend/
├── __tests__/
│   ├── components/          # Component unit tests
│   │   └── ChainSelector.test.tsx
│   ├── contexts/            # Context unit tests
│   │   └── ChainContext.test.tsx
│   ├── integration/         # Integration tests
│   │   └── wallet-connection.test.tsx
│   └── mocks/              # Mock utilities
│       └── wallets.ts
├── vitest.config.ts        # Vitest configuration
└── vitest.setup.ts         # Global test setup
```

## ✍️ Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Integration Test Example

```typescript
import { renderHook, act } from '@testing-library/react';
import { ChainProvider, useChain } from '@/contexts/ChainContext';

describe('Chain Switching', () => {
  it('should switch chains', () => {
    const { result } = renderHook(() => useChain(), {
      wrapper: ChainProvider,
    });

    act(() => {
      result.current.setSelectedChain('ethereum');
    });

    expect(result.current.selectedChain).toBe('ethereum');
  });
});
```

### Using Mock Wallets

```typescript
import { createMockPetraWallet, createMockMetaMaskWallet } from '../mocks/wallets';

// Mock Aptos wallet
const mockPetra = createMockPetraWallet();
vi.mock('@aptos-labs/wallet-adapter-react', () => ({
  useWallet: () => mockPetra,
}));

// Mock EVM wallet
const mockMetaMask = createMockMetaMaskWallet();
(global as any).window.ethereum = mockMetaMask;
```

## 📊 Coverage

### Coverage Goals

| Component Type | Target Coverage |
|---------------|-----------------|
| Critical (ChainContext, Providers) | 100% |
| Important (Components, Hooks) | 80%+ |
| Integration Tests | 70%+ |

### View Coverage Report

After running `npm run test:coverage`, open:

```
coverage/index.html
```

in your browser to view detailed coverage metrics.

### Coverage Configuration

Coverage settings in `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: [
    'node_modules/',
    'dist/',
    '**/*.d.ts',
    '**/*.config.*',
    '**/mockData',
    'tests/',
  ],
}
```

## 🔧 Mock Providers

### Available Mocks

Located in `__tests__/mocks/wallets.ts`:

- **`createMockPetraWallet()`** - Mock Petra wallet (Aptos)
- **`createMockMetaMaskWallet()`** - Mock MetaMask (EVM)
- **`createMockAptosWalletAdapter()`** - Mock Aptos adapter
- **`createMockWagmiAccount()`** - Mock Wagmi account hook
- **`createMockWagmiDisconnect()`** - Mock disconnect hook
- **`createMockWagmiSwitchChain()`** - Mock chain switching
- **`createMockAppKit()`** - Mock Reown AppKit

### Mock Usage Example

```typescript
import { createMockPetraWallet } from '../mocks/wallets';

vi.mock('@aptos-labs/wallet-adapter-react', () => ({
  useWallet: () => createMockPetraWallet(),
}));
```

## 🐛 Troubleshooting

### Tests Failing with "Cannot find module"

Make sure path aliases are configured correctly in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './frontend'),
  },
}
```

### "localStorage is not defined"

Already mocked in `vitest.setup.ts`. If issues persist, check the setup file is imported.

### "window.matchMedia is not a function"

Already mocked in `vitest.setup.ts`. For component-specific media queries, add:

```typescript
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  // ... other properties
}));
```

### Import Errors with Wagmi/Reown

Make sure to mock these modules properly:

```typescript
vi.mock('wagmi', () => ({
  useAccount: () => createMockWagmiAccount(),
  // ... other hooks
}));
```

### Tests Running Slowly

Use `test.concurrent` for independent tests:

```typescript
describe.concurrent('Fast tests', () => {
  it('test 1', async () => { /* ... */ });
  it('test 2', async () => { /* ... */ });
});
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library User Events](https://testing-library.com/docs/user-event/intro)
- [Wagmi Testing Guide](https://wagmi.sh/react/guides/testing)

## ✅ Test Checklist

- [ ] Unit tests for new components
- [ ] Integration tests for new features
- [ ] Mock providers for external dependencies
- [ ] Coverage > 80% for critical paths
- [ ] All tests pass: `npm run test:run`
- [ ] Coverage report generated: `npm run test:coverage`
- [ ] Documentation updated

## 🎯 Next Steps

1. Run initial test suite: `npm run test:run`
2. Check coverage: `npm run test:coverage`
3. Add tests for new features as they're developed
4. Maintain coverage above 80%
5. Run tests before committing: `npm test`

---

**Note**: Tests are designed to work without external wallet extensions or network connections. All wallet interactions are mocked for fast, reliable testing.
