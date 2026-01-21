# Base Blockchain Testing Suite

Comprehensive testing documentation for the EarnestPay Base blockchain integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Coverage](#coverage)
- [E2E Testing](#e2e-testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The testing suite covers:

- ✅ **Unit Tests**: Components, hooks, and utilities
- ✅ **Integration Tests**: Transaction flows, gas estimation
- ✅ **E2E Tests**: Complete user journeys with Playwright
- ✅ **Mock Providers**: Wagmi, Viem, and wallet connections
- ✅ **Coverage Reporting**: Detailed coverage metrics with v8 provider

### Testing Framework

- **Vitest**: Fast, Vite-native testing framework
- **Testing Library**: React component testing utilities
- **Playwright**: Cross-browser E2E testing
- **jsdom**: Browser environment simulation
- **Wagmi Mock Connector**: Wallet connection mocking

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

### Run All Unit Tests (Watch Mode)

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

### Run E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```

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
│   └── integration/                    # Integration tests
│       └── transaction-flow.test.tsx
├── components/
│   └── __tests__/                     # Component unit tests
│       ├── LoadingStates.test.tsx
│       ├── ErrorStates.test.tsx
│       └── MobileOptimized.test.tsx
├── hooks/
│   └── __tests__/                     # Hook unit tests
│       ├── useGasEstimation.test.ts
│       └── useTransactionStatus.test.ts
├── utils/
│   └── __tests__/                     # Utility unit tests
│       ├── transactions.test.ts
│       ├── gas.test.ts
│       └── responsive.test.ts
├── test/
│   ├── setup.ts                       # Test environment setup
│   └── utils.tsx                      # Test utilities and mocks
├── e2e/                               # E2E tests
│   ├── home.spec.ts
│   └── wallet.spec.ts
├── vitest.config.ts                   # Vitest configuration
├── vitest.setup.ts                    # Global test setup
└── playwright.config.ts               # Playwright E2E configuration
```

## ✍️ Writing Tests

### Component Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Spinner } from '../LoadingStates';

describe('LoadingStates', () => {
  it('renders spinner with default size', () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-6', 'h-6');
  });
});
```

### Hook Test Example

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useGasEstimation } from '../useGasEstimation';
import { TestProviders } from '../../test/utils';

describe('useGasEstimation', () => {
  it('returns gas estimates', async () => {
    const gasLimit = BigInt(200000);
    const { result } = renderHook(
      () => useGasEstimation(gasLimit),
      { wrapper: TestProviders }
    );

    await waitFor(() => {
      expect(result.current.gasPrices).toBeDefined();
    });
  });
});
```

### Integration Test Example

```typescript
describe('Transaction Flow', () => {
  it('completes full transaction lifecycle', async () => {
    // 1. Save transaction
    saveTransaction(initialTx);

    // 2. Verify it's saved
    const savedTx = getTransactionByHash(hash);
    expect(savedTx).toBeDefined();

    // 3. Update status
    updateTransactionStatus(hash, 'confirmed', receipt);

    // 4. Verify status updated
    const confirmedTx = getTransactionByHash(hash);
    expect(confirmedTx?.status).toBe('confirmed');
  });
});
```

### Using Test Utilities

```typescript
import {
  TestProviders,
  MOCK_ADDRESSES,
  MOCK_TX_HASHES,
  createMockTransaction,
  createMockEmployee,
  mockLocalStorage,
} from '../../test/utils';

// Use mock addresses
const userAddress = MOCK_ADDRESSES.user1;

// Create mock transaction
const tx = createMockTransaction({
  hash: MOCK_TX_HASHES.confirmed,
  status: 'confirmed',
});

// Mock localStorage
global.localStorage = mockLocalStorage() as any;
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

## 🎭 E2E Testing

End-to-end tests verify complete user journeys using Playwright.

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Wallet Connection', () => {
  test('should display connect button', async ({ page }) => {
    await page.goto('/');

    const connectButton = page.getByRole('button', { name: /connect/i });
    await expect(connectButton).toBeVisible();
  });

  test('should handle wallet modal', async ({ page }) => {
    await page.goto('/');

    const connectButton = page.getByRole('button', { name: /connect/i });
    await connectButton.click();

    // Wait for modal
    await page.waitForTimeout(1000);
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });
});
```

### Running Specific E2E Tests

```bash
# Run specific test file
npx playwright test wallet.spec.ts

# Run on specific browser
npx playwright test --project=chromium

# Run on mobile viewport
npx playwright test --project="Mobile Chrome"

# Debug mode
npx playwright test --debug

# Headed mode with slowdown
npx playwright test --headed --slow-mo=1000
```

### E2E Test Best Practices

1. **Use semantic queries**: Prefer `getByRole`, `getByLabel` over selectors
2. **Wait for elements**: Use `waitFor` instead of fixed timeouts
3. **Test user flows**: Focus on complete journeys, not individual actions
4. **Mobile testing**: Include mobile viewport tests
5. **Accessibility**: Use ARIA roles and labels

## 🔧 Mock Providers

### Available Mocks

Located in `frontend/test/utils.tsx`:

- **`TestProviders`** - Wrapper with WagmiProvider and QueryClientProvider
- **`createMockWagmiConfig()`** - Mock Wagmi configuration
- **`createMockTransaction()`** - Mock transaction data
- **`createMockEmployee()`** - Mock employee data
- **`createMockTxReceipt()`** - Mock transaction receipt
- **`mockLocalStorage()`** - Mock localStorage
- **`mockConnectedWallet()`** - Mock wallet connection

### Mock Usage Example

```typescript
import { TestProviders, MOCK_ADDRESSES, createMockTransaction } from '../../test/utils';

describe('My Component', () => {
  it('renders with mocked data', () => {
    const tx = createMockTransaction({
      hash: MOCK_TX_HASHES.confirmed,
      fromAddress: MOCK_ADDRESSES.user1,
    });

    render(<MyComponent transaction={tx} />, {
      wrapper: TestProviders,
    });
  });
});
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
