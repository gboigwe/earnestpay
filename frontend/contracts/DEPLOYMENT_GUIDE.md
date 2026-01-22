# Base Smart Contract Deployment Guide

Complete guide for deploying EarnestPay smart contracts to Base blockchain.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Deployment](#detailed-deployment)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

## Overview

EarnestPay uses Foundry for smart contract development and deployment. This guide covers deploying to both Base Sepolia (testnet) and Base Mainnet (production).

### Contracts

- **PayrollManager**: Main contract for managing employees and payments
- **TaxCompliance**: Handles tax calculations and compliance

### Networks

- **Base Sepolia** (Testnet): Chain ID 84532
- **Base Mainnet** (Production): Chain ID 8453

## Prerequisites

### Required Software

```bash
# Foundry (Forge, Cast, Anvil)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version
cast --version

# Node.js and npm (for frontend integration)
node --version  # v18+
npm --version
```

### Required Accounts

1. **Deployer Wallet**
   - Private key for deploying contracts
   - Needs ETH for gas fees
   - **Testnet**: 0.05 ETH minimum
   - **Mainnet**: 0.1 ETH minimum

2. **BaseScan Account**
   - Get API key from https://basescan.org/myapikey
   - Required for contract verification
   - Free tier sufficient

### Environment Setup

Create `.env` file in project root:

```bash
# Required
PRIVATE_KEY=your_deployer_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here

# Optional
DEFAULT_NETWORK=testnet  # or mainnet
```

**Security Note**: Never commit `.env` to version control!

## Quick Start

### 1. Install Dependencies

```bash
# Install Forge dependencies
forge install

# Install npm dependencies (if needed)
npm install
```

### 2. Deploy to Testnet

```bash
# One command deployment to Base Sepolia
./contracts/scripts/deploy-testnet.sh
```

This script will:
- Check your balance
- Estimate gas costs
- Deploy both contracts
- Verify on BaseScan
- Output contract addresses

### 3. Update Frontend

```bash
# Add to frontend/.env
VITE_PAYROLL_CONTRACT_ADDRESS=<payroll_address>
VITE_TAX_CONTRACT_ADDRESS=<tax_address>
VITE_DEFAULT_NETWORK=testnet
```

### 4. Test Integration

```bash
# Start frontend
cd frontend
npm run dev

# In another terminal
npm run test:integration
```

## Detailed Deployment

### Step 1: Pre-Deployment Checks

```bash
# Run all tests
forge test -vvv

# Check code coverage
forge coverage

# Format code
forge fmt

# Build contracts
forge build
```

**Checklist:**
- ✅ All tests passing
- ✅ No compiler warnings
- ✅ Code formatted
- ✅ `.env` configured

### Step 2: Get Testnet ETH

For Base Sepolia testnet:

1. Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Connect your deployer wallet
3. Request ETH
4. Wait 1-2 minutes

Check balance:
```bash
cast balance <your_address> --rpc-url https://sepolia.base.org
```

### Step 3: Gas Estimation

```bash
# Estimate deployment costs
forge script contracts/script/GasEstimation.s.sol:GasEstimation \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY
```

**Review Output:**
- Total gas required
- Estimated cost in ETH
- Estimated cost in USD
- Current gas price

### Step 4: Deploy Contracts

#### Option A: Automated Deployment (Recommended)

```bash
# Testnet
./contracts/scripts/deploy-testnet.sh

# Mainnet (after thorough testing)
./contracts/scripts/deploy-mainnet.sh
```

#### Option B: Manual Deployment

```bash
# Deploy with verification
forge script contracts/script/DeployWithVerification.s.sol:DeployWithVerification \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $BASESCAN_API_KEY \
    -vvv
```

**Deployment Process:**
1. TaxCompliance deployed
2. Default tax rates initialized
3. PayrollManager deployed
4. Verification submitted to BaseScan

### Step 5: Save Deployment Info

Contracts are saved to `contracts/broadcast/` directory:

```bash
# View deployment data
cat contracts/broadcast/DeployWithVerification.s.sol/84532/run-latest.json
```

**Save Immediately:**
- Contract addresses
- Transaction hashes
- Block numbers
- Gas used
- Deployer address

### Step 6: Verify Deployment

#### Automatic Verification

Verification happens automatically during deployment if:
- `BASESCAN_API_KEY` is set
- `--verify` flag is used
- Network is supported

#### Manual Verification

If auto-verification fails:

```bash
# Run verification script
./contracts/scripts/verify-contracts.sh base_sepolia

# Or manually
forge verify-contract <contract_address> \
    contracts/src/PayrollManager.sol:PayrollManager \
    --chain base_sepolia \
    --etherscan-api-key $BASESCAN_API_KEY \
    --watch
```

### Step 7: Test Deployment

```bash
# Test read functions
cast call <payroll_address> "owner()" --rpc-url base_sepolia

# Test write functions (small amounts only!)
# Add test employee
cast send <payroll_address> \
    "addEmployee(address,string,string,uint256)" \
    <employee_address> "John" "Doe" 5000000000000000000 \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY
```

## Verification

### On BaseScan

1. Go to contract address on BaseScan
2. Click "Contract" tab
3. Look for green checkmark
4. "Read Contract" and "Write Contract" buttons should be visible

**Example URLs:**
- Mainnet: `https://basescan.org/address/<contract_address>`
- Testnet: `https://sepolia.basescan.org/address/<contract_address>`

### Verification Status

```bash
# Check verification status
curl "https://api.basescan.org/api?module=contract&action=getabi&address=<contract_address>&apikey=$BASESCAN_API_KEY"
```

**Response:**
- `status: "1"` = Verified
- `status: "0"` = Not verified or error

## Troubleshooting

### Issue: "Insufficient funds for gas"

**Solution:**
```bash
# Check balance
cast balance <your_address> --rpc-url <rpc_url>

# Get more testnet ETH
# Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
```

### Issue: "Nonce too low"

**Solution:**
```bash
# Get current nonce
cast nonce <your_address> --rpc-url <rpc_url>

# Wait a few seconds and retry
# Or use --nonce flag to specify nonce manually
```

### Issue: "Verification failed"

**Causes:**
1. Wrong compiler settings
2. Wrong Solidity version
3. Constructor arguments mismatch
4. Network issues

**Solution:**
```bash
# Check compiler settings in foundry.toml
# Ensure solc_version matches contract

# Verify with exact settings
forge verify-contract <address> \
    <path>:<contract_name> \
    --chain <network> \
    --etherscan-api-key $BASESCAN_API_KEY \
    --compiler-version 0.8.20 \
    --optimizer-runs 200
```

### Issue: "Contract already deployed at address"

**Solution:**
This happens if deployment partially succeeded. Options:

1. Use existing deployment
2. Change deployer nonce
3. Use CREATE2 for deterministic addresses

### Issue: "RPC Error"

**Solution:**
```bash
# Try fallback RPC
forge script ... --rpc-url https://base.llamarpc.com

# Or use different RPC from foundry.toml
forge script ... --rpc-url base_fallback
```

### Issue: "Gas price too high"

**Solution:**
```bash
# Wait for lower gas prices
# Base typically has very low gas

# Or set max gas price
forge script ... --with-gas-price 1000000000  # 1 gwei
```

## Best Practices

### Security

1. **Private Keys**
   - Never hardcode private keys
   - Use environment variables
   - Consider hardware wallets for mainnet

2. **Testing**
   - Test thoroughly on testnet first
   - Run for at least 1 week on testnet
   - Test all functions and edge cases

3. **Audits**
   - Consider professional audit for mainnet
   - Have code reviewed by team
   - Check for known vulnerabilities

### Gas Optimization

1. **Deployment**
   - Use `optimizer = true` in foundry.toml
   - Set appropriate `optimizer_runs`
   - Use production profile for mainnet

2. **Monitoring**
   - Track gas costs
   - Optimize expensive operations
   - Use events instead of storage when possible

### Verification

1. **Immediate Verification**
   - Verify contracts immediately after deployment
   - Don't wait - verification can fail later

2. **Check Verification**
   - Always verify on BaseScan
   - Test read/write functions on explorer
   - Ensure ABI is correct

### Documentation

1. **Deployment Records**
   - Document all deployments
   - Save transaction hashes
   - Note any issues encountered

2. **Update Docs**
   - Keep README updated
   - Document contract addresses
   - Update integration guides

## Mainnet Deployment

### Additional Considerations

1. **Final Testing**
   - All testnet tests passing
   - No open issues
   - Team approval obtained

2. **Risk Assessment**
   - Identify potential issues
   - Plan for rollback
   - Have support ready

3. **Deployment Window**
   - Choose low-traffic time
   - Have team available
   - Monitor closely after deployment

4. **Communication**
   - Notify team before deployment
   - Update status during deployment
   - Announce completion

### Mainnet Checklist

Before deploying to mainnet:

- [ ] Tested on testnet for 1+ week
- [ ] All tests passing
- [ ] Code audited (if budget allows)
- [ ] Team approval
- [ ] Sufficient ETH in deployer wallet
- [ ] BaseScan API key ready
- [ ] Rollback plan documented
- [ ] Support team ready
- [ ] Monitoring setup
- [ ] Documentation updated

## Useful Commands

```bash
# Check deployer address
cast wallet address --private-key $PRIVATE_KEY

# Check balance
cast balance <address> --rpc-url <rpc_url>

# Get current nonce
cast nonce <address> --rpc-url <rpc_url>

# Get gas price
cast gas-price --rpc-url <rpc_url>

# Get block number
cast block-number --rpc-url <rpc_url>

# Send ETH
cast send <to_address> \
    --value 0.1ether \
    --rpc-url <rpc_url> \
    --private-key $PRIVATE_KEY

# Call contract (read)
cast call <contract_address> "functionName()" --rpc-url <rpc_url>

# Send transaction (write)
cast send <contract_address> \
    "functionName(arg1,arg2)" \
    arg1_value arg2_value \
    --rpc-url <rpc_url> \
    --private-key $PRIVATE_KEY

# Estimate gas
cast estimate <contract_address> "functionName()" --rpc-url <rpc_url>
```

## Resources

- **Base Docs**: https://docs.base.org/
- **Foundry Book**: https://book.getfoundry.sh/
- **BaseScan**: https://basescan.org/
- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **Foundry GitHub**: https://github.com/foundry-rs/foundry

## Support

For help with deployment:

1. Check [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
2. Review [Troubleshooting](#troubleshooting) section
3. Search Foundry documentation
4. Ask team in Slack
5. Create GitHub issue

---

**Remember**: When in doubt, test more on testnet!
