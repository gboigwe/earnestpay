# Gas Optimization Guide

This document explains the gas optimization features implemented for the EarnestPay payroll system on Base blockchain.

## Overview

The gas optimization system provides:
- Real-time gas price estimation
- Multi-tier gas pricing (slow, standard, fast)
- Batch processing optimization
- Gas-optimized contract interactions
- User-friendly gas fee displays

## Components

### 1. Gas Utilities (`utils/gas.ts`)

Core utilities for gas estimation and optimization:

```typescript
import { getCurrentGasPrices, estimateGasWithTiers } from '@/utils/gas';

// Get current network gas prices
const { baseFee, priorityFee } = await getCurrentGasPrices(publicClient);

// Estimate gas with tiers
const prices = await estimateGasWithTiers(publicClient, gasLimit);
```

**Key Functions:**
- `getCurrentGasPrices()` - Fetch current Base network gas prices
- `estimateGasWithTiers()` - Calculate slow/standard/fast tier pricing
- `formatGasPrice()` - Format gas prices for display
- `getOptimizedGasLimit()` - Add safety buffer to gas estimates
- `shouldUseBatchProcessing()` - Determine if batching saves gas

### 2. useGasEstimation Hook (`hooks/useGasEstimation.ts`)

React hook for gas estimation in components:

```typescript
import { useGasEstimation } from '@/hooks/useGasEstimation';

function MyComponent() {
  const {
    gasPrices,
    selectedTier,
    setSelectedTier,
    optimizationTips,
  } = useGasEstimation(gasLimit);

  return <GasFeeDisplay gasPrices={gasPrices} />;
}
```

**Features:**
- Automatic gas price updates every 30 seconds
- Chain-specific optimization tips
- Error handling and retry logic
- Tier selection state management

### 3. GasFeeDisplay Component (`components/GasFeeDisplay.tsx`)

Visual component for displaying gas fees:

```typescript
import { GasFeeDisplay } from '@/components/GasFeeDisplay';

<GasFeeDisplay
  gasPrices={gasPrices}
  selectedTier={selectedTier}
  onTierChange={setSelectedTier}
  showOptimizationTips={true}
  optimizationTips={optimizationTips}
/>
```

**Features:**
- Three-tier pricing display (slow/standard/fast)
- ETH and USD cost estimates
- Estimated transaction time
- Interactive tier selection
- Collapsible optimization tips

**Compact Version:**
```typescript
<GasFeeDisplayCompact
  gasPrices={gasPrices}
  selectedTier={selectedTier}
/>
```

### 4. GasEstimator Wrapper (`components/GasEstimator.tsx`)

Wrapper component for forms with automatic gas estimation:

```typescript
import { GasEstimator } from '@/components/GasEstimator';

<GasEstimator
  gasLimit={BigInt(200000)}
  showTips={true}
  onGasEstimated={(estimate) => console.log(estimate)}
>
  <YourFormComponent />
</GasEstimator>
```

**Batch Processing Comparison:**
```typescript
<BatchGasEstimator
  individualGasLimit={BigInt(150000)}
  batchGasLimit={BigInt(500000)}
  numberOfOperations={10}
  onShouldBatch={(shouldBatch) => {
    if (shouldBatch) {
      // Use batch processing
    }
  }}
/>
```

### 5. Optimized Contract Functions (`utils/contractsOptimized.ts`)

Gas-optimized contract interaction functions:

```typescript
import {
  registerCompanyOptimized,
  createEmployeeOptimized,
  processBatchPaymentsOptimized,
} from '@/utils/contractsOptimized';

// Register company with gas optimization
const { hash, gasUsed } = await registerCompanyOptimized(
  publicClient,
  walletClient,
  account,
  'My Company',
  {
    maxFeePerGas: gasPrices.standard.maxFeePerGas,
    maxPriorityFeePerGas: gasPrices.standard.maxPriorityFeePerGas,
  }
);

// Batch payment processing (most gas-efficient)
const result = await processBatchPaymentsOptimized(
  publicClient,
  walletClient,
  account,
  [employee1, employee2, employee3],
  [amount1, amount2, amount3],
  'monthly_salary'
);

console.log('Gas per employee:', result.gasPerEmployee);
```

## Usage Examples

### Example 1: Employee Registration Form

```typescript
import { useGasEstimation } from '@/hooks/useGasEstimation';
import { GasEstimator } from '@/components/GasEstimator';
import { createEmployeeOptimized } from '@/utils/contractsOptimized';

function EmployeeRegistrationForm() {
  const estimatedGas = BigInt(250000); // Estimated for createEmployee

  const {
    gasPrices,
    selectedTier,
    setSelectedTier,
  } = useGasEstimation(estimatedGas);

  const handleSubmit = async (data) => {
    const gasOptions = gasPrices ? {
      maxFeePerGas: gasPrices[selectedTier].maxFeePerGas,
      maxPriorityFeePerGas: gasPrices[selectedTier].maxPriorityFeePerGas,
    } : undefined;

    const result = await createEmployeeOptimized(
      publicClient,
      walletClient,
      account,
      data,
      gasOptions
    );

    console.log('Transaction hash:', result.hash);
    console.log('Gas used:', result.gasUsed.toString());
  };

  return (
    <GasEstimator gasLimit={estimatedGas}>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
    </GasEstimator>
  );
}
```

### Example 2: Batch Payroll Processing

```typescript
import { BatchGasEstimator } from '@/components/GasEstimator';
import { processBatchPaymentsOptimized } from '@/utils/contractsOptimized';

function BatchPayrollForm() {
  const [useBatch, setUseBatch] = useState(false);
  const employees = [...]; // Array of employee addresses
  const amounts = [...]; // Array of payment amounts

  const individualGas = BigInt(180000);
  const batchGas = BigInt(350000 + (employees.length * 50000));

  const handleBatchPayment = async () => {
    const result = await processBatchPaymentsOptimized(
      publicClient,
      walletClient,
      account,
      employees,
      amounts,
      'monthly_salary'
    );

    console.log('Batch payment completed');
    console.log('Total gas used:', result.gasUsed.toString());
    console.log('Gas per employee:', result.gasPerEmployee.toString());
  };

  return (
    <div>
      <BatchGasEstimator
        individualGasLimit={individualGas}
        batchGasLimit={batchGas}
        numberOfOperations={employees.length}
        onShouldBatch={setUseBatch}
      />

      {useBatch && (
        <button onClick={handleBatchPayment}>
          Process Batch Payment (Optimized)
        </button>
      )}
    </div>
  );
}
```

## Base Blockchain Optimizations

### Why Base is Gas-Efficient

Base is an Ethereum Layer 2 (L2) solution that offers:
- **~10-100x lower gas costs** than Ethereum mainnet
- **Fast block times** (~2 seconds)
- **EVM compatibility** - all Ethereum tools work

### Typical Gas Costs on Base

| Operation | Estimated Gas | Cost (at 0.01 gwei) |
|-----------|---------------|---------------------|
| Register Company | 150,000 | < $0.001 |
| Create Employee | 250,000 | < $0.002 |
| Update Salary | 80,000 | < $0.001 |
| Single Payment | 180,000 | < $0.002 |
| Batch Payment (10) | 500,000 | < $0.005 |

### Batch Processing Benefits

For multiple operations, batch processing can save 40-60% on gas:

```
Individual: 10 payments × 180,000 gas = 1,800,000 gas
Batch: 500,000 gas (72% savings!)
```

## Best Practices

### 1. Always Use Gas Estimation
```typescript
// ✅ Good - Estimate before transaction
const { gasPrices } = useGasEstimation(gasLimit);

// ❌ Bad - Hardcoded gas values
const gasLimit = BigInt(1000000);
```

### 2. Prefer Batch Operations
```typescript
// ✅ Good - Batch multiple payments
await processBatchPaymentsOptimized(employees, amounts);

// ❌ Bad - Individual payments in a loop
for (const employee of employees) {
  await processPayment(employee);
}
```

### 3. Let Users Choose Gas Tier
```typescript
// ✅ Good - User selects speed/cost tradeoff
<GasFeeDisplay
  gasPrices={gasPrices}
  selectedTier={selectedTier}
  onTierChange={setSelectedTier}
/>

// ❌ Bad - Force fastest (most expensive) tier
const gasPrice = gasPrices.fast.maxFeePerGas;
```

### 4. Show Gas Estimates Before Transactions
```typescript
// ✅ Good - Show estimate before user commits
<GasEstimator gasLimit={estimatedGas}>
  <TransactionForm />
</GasEstimator>

// ❌ Bad - No visibility into costs
<TransactionForm />
```

### 5. Add Buffer to Gas Estimates
```typescript
// ✅ Good - Use optimized gas limit with buffer
const gasLimit = getOptimizedGasLimit(estimatedGas); // +10% buffer

// ❌ Bad - Use exact estimate (may fail)
const gasLimit = estimatedGas;
```

## Monitoring Gas Usage

Track gas usage for optimization:

```typescript
const result = await createEmployeeOptimized(...);

// Log gas metrics
console.log('Gas used:', result.gasUsed.toString());
console.log('Gas limit:', gasLimit.toString());
console.log('Gas efficiency:',
  (Number(result.gasUsed) / Number(gasLimit) * 100).toFixed(2) + '%'
);

// Store for analytics
analyticsService.track('transaction_gas', {
  operation: 'create_employee',
  gasUsed: result.gasUsed.toString(),
  gasLimit: gasLimit.toString(),
});
```

## Troubleshooting

### Gas Estimation Fails
```typescript
// Fallback to conservative estimate
const gasLimit = options?.gasLimit || BigInt(500000);
```

### Transaction Runs Out of Gas
- Increase buffer in `getOptimizedGasLimit()` from 10% to 20%
- Check if contract state changed between estimation and execution

### Gas Prices Too High
- Use 'slow' tier for non-urgent transactions
- Wait for lower network congestion
- On Base, gas is typically very low anyway

## Resources

- [Base Documentation](https://docs.base.org/)
- [Viem Documentation](https://viem.sh/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Gas Optimization Patterns](https://github.com/ethereum/solidity/issues)

## Future Improvements

- [ ] Historical gas price charts
- [ ] Predictive gas pricing based on network activity
- [ ] Gas refund calculations for storage cleanup
- [ ] Multi-chain gas comparison
- [ ] Gasless transactions via meta-transactions
