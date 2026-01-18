# EarnestPay Smart Contracts for Base

Solidity smart contracts for payroll management on Base blockchain.

## Contracts

### PayrollManager.sol
Main contract for managing employee profiles and processing payroll payments.

**Features:**
- Company registration
- Employee profile management
- Single and batch payment processing
- Payment history tracking
- Gas-optimized for Base blockchain

**Key Functions:**
- `registerCompany(string companyName)` - Register a new company
- `createEmployee(...)` - Create employee profile
- `updateEmployeeSalary(address employee, uint256 newSalary)` - Update salary
- `processPayment(address employee, uint256 amount, string paymentType)` - Process single payment
- `processBatchPayments(address[] employees, uint256[] amounts, string paymentType)` - Process multiple payments

### TaxCompliance.sol
Tax rate management and calculation contract.

**Features:**
- Configurable tax rates per jurisdiction
- Automatic tax calculations
- YTD (Year-to-Date) tracking
- Support for multiple tax jurisdictions

**Key Functions:**
- `configureTaxRates(...)` - Set tax rates for a jurisdiction
- `calculateTax(string jurisdiction, uint256 grossAmount)` - Calculate tax breakdown
- `updateYTD(address employee, uint256 grossAmount, string jurisdiction)` - Update YTD summary
- `getSupportedJurisdictions(address company)` - Get all configured jurisdictions

## Setup

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Base Sepolia ETH for testnet deployment
- Private key for deployment

### Installation

```bash
# Install Foundry (if not installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts
```

### Compile Contracts

```bash
forge build
```

### Run Tests

```bash
forge test
```

### Deploy to Base Sepolia

1. Create a `.env` file:
```env
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

2. Deploy:
```bash
forge script contracts/script/Deploy.s.sol:DeployScript \
  --rpc-url base_sepolia \
  --broadcast \
  --verify
```

### Deploy to Base Mainnet

```bash
forge script contracts/script/Deploy.s.sol:DeployScript \
  --rpc-url base \
  --broadcast \
  --verify
```

## Contract Addresses

### Base Sepolia (Testnet)
- PayrollManager: `TBD`
- TaxCompliance: `TBD`

### Base Mainnet
- PayrollManager: `TBD`
- TaxCompliance: `TBD`

## Gas Optimization

The contracts are optimized for Base's gas model:
- Batch operations for multiple payments
- Efficient storage patterns
- Via IR compilation enabled
- 200 optimizer runs

## Security

- Uses OpenZeppelin's battle-tested contracts
- ReentrancyGuard protection on payment functions
- Ownable access control
- Input validation on all external functions

## Integration

After deployment, add the contract addresses to your `.env` file:

```env
VITE_PAYROLL_CONTRACT_ADDRESS=0x...
VITE_TAX_CONTRACT_ADDRESS=0x...
```

## License

MIT
