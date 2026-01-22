# Smart Contract Deployment Checklist

Complete guide for deploying EarnestPay smart contracts to Base blockchain.

## Pre-Deployment Checklist

### Code Quality
- [ ] All unit tests passing (`forge test`)
- [ ] Integration tests passing
- [ ] Gas optimization reviewed
- [ ] Code formatted (`forge fmt`)
- [ ] No compiler warnings
- [ ] Security best practices followed

### Configuration
- [ ] Foundry properly installed (`forge --version`)
- [ ] `.env` file created with required variables:
  - [ ] `PRIVATE_KEY` - Deployer private key
  - [ ] `BASESCAN_API_KEY` - For contract verification
- [ ] RPC endpoints configured in `foundry.toml`
- [ ] Network configuration verified

### Testing
- [ ] Contracts deployed to Base Sepolia (testnet)
- [ ] All functions tested on testnet
- [ ] Gas costs acceptable
- [ ] Edge cases tested
- [ ] Multi-user scenarios tested

### Security
- [ ] Code audited (if budget allows)
- [ ] Known vulnerabilities checked
- [ ] Access controls verified
- [ ] Reentrancy guards in place
- [ ] Integer overflow/underflow protected

### Documentation
- [ ] Contract documentation complete
- [ ] Deployment instructions clear
- [ ] API integration guide ready
- [ ] Frontend integration planned

## Testnet Deployment (Base Sepolia)

### 1. Environment Setup

```bash
# Install dependencies
forge install

# Copy environment template
cp .env.example .env

# Edit .env and add:
# - PRIVATE_KEY (your deployer wallet private key)
# - BASESCAN_API_KEY (from https://basescan.org/myapikey)
```

### 2. Get Testnet ETH

- Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- Connect your deployer wallet
- Request testnet ETH (0.05 ETH recommended)
- Wait 1-2 minutes for ETH to arrive

### 3. Run Gas Estimation

```bash
# Estimate deployment costs
forge script contracts/script/GasEstimation.s.sol:GasEstimation \
    --rpc-url base_sepolia
```

**Review Output:**
- [ ] Total deployment cost acceptable
- [ ] Deployer has sufficient balance
- [ ] Gas price reasonable

### 4. Deploy to Testnet

```bash
# Run deployment script
./contracts/scripts/deploy-testnet.sh
```

**Monitor Deployment:**
- [ ] TaxCompliance deployed successfully
- [ ] Default tax rates initialized
- [ ] PayrollManager deployed successfully
- [ ] Deployment addresses logged

### 5. Verify on BaseScan

Contracts should auto-verify, but if needed:

```bash
# Manual verification
./contracts/scripts/verify-contracts.sh base_sepolia
```

**Verification Checklist:**
- [ ] TaxCompliance verified on BaseScan
- [ ] PayrollManager verified on BaseScan
- [ ] Source code readable on explorer
- [ ] Contract ABI available

### 6. Test on Testnet

- [ ] Add employee function works
- [ ] Payment processing works
- [ ] Tax calculations correct
- [ ] Batch operations work
- [ ] Emergency functions accessible
- [ ] Events emitted correctly

### 7. Update Configuration

```bash
# Add to .env
VITE_PAYROLL_CONTRACT_ADDRESS=0x...
VITE_TAX_CONTRACT_ADDRESS=0x...
```

- [ ] Frontend .env updated
- [ ] Contract addresses documented
- [ ] Network set to Base Sepolia

### 8. Integration Testing

```bash
# Run integration tests
npm run test:integration
```

- [ ] Frontend can connect to contracts
- [ ] Transactions submit successfully
- [ ] UI updates correctly
- [ ] Error handling works

## Mainnet Deployment (Base Mainnet)

### Pre-Mainnet Checklist

#### Critical Requirements
- [ ] **Testnet deployment successful for at least 1 week**
- [ ] All testnet tests passing
- [ ] No critical issues found in testnet
- [ ] Code freeze in effect (no changes during deployment)
- [ ] Team aware of deployment schedule
- [ ] Support team on standby
- [ ] Rollback plan documented

#### Financial Requirements
- [ ] Deployer wallet has sufficient ETH (0.1 ETH minimum)
- [ ] Gas costs calculated and budgeted
- [ ] Treasury wallet ready (if needed)
- [ ] Multi-sig setup (if required)

#### Legal/Compliance
- [ ] Legal review complete (if required)
- [ ] Terms of service updated
- [ ] Privacy policy current
- [ ] Regulatory requirements met

### 1. Final Code Review

```bash
# Run all tests
forge test -vvv

# Check coverage
forge coverage

# Format code
forge fmt --check

# Build for production
FOUNDRY_PROFILE=production forge build
```

**Code Review Checklist:**
- [ ] All tests passing (100% if possible)
- [ ] No TODO/FIXME comments
- [ ] No debug code
- [ ] Gas optimization complete
- [ ] Comments accurate and helpful

### 2. Mainnet Deployment

```bash
# Deploy to mainnet
./contracts/scripts/deploy-mainnet.sh
```

**During Deployment:**
1. Review gas estimation
2. Confirm deployment parameters
3. Type confirmation phrase exactly
4. Monitor transaction status
5. Save deployment addresses immediately
6. Backup broadcast files

**Post-Deployment Verification:**
- [ ] TaxCompliance deployed at correct address
- [ ] PayrollManager deployed at correct address
- [ ] Both contracts verified on BaseScan
- [ ] Initialization successful
- [ ] No errors in deployment logs

### 3. Verification

```bash
# Verify contracts (if auto-verification failed)
./contracts/scripts/verify-contracts.sh base
```

- [ ] Both contracts verified
- [ ] Source code matches deployed bytecode
- [ ] Read functions accessible on BaseScan
- [ ] Write functions visible (for testing)

### 4. Post-Deployment Testing

**Smoke Tests (Small Amounts Only):**
- [ ] Read functions working
- [ ] Can add test employee
- [ ] Can process small test payment
- [ ] Events emitting correctly
- [ ] Gas costs as expected

### 5. Frontend Integration

```bash
# Update production .env
VITE_PAYROLL_CONTRACT_ADDRESS=0x...
VITE_TAX_CONTRACT_ADDRESS=0x...
VITE_DEFAULT_NETWORK=mainnet
```

- [ ] Production .env updated
- [ ] Frontend rebuilt
- [ ] Test with MetaMask/Coinbase Wallet
- [ ] All features working
- [ ] Error messages clear

### 6. Monitoring Setup

- [ ] BaseScan alerts configured
- [ ] Transaction monitoring active
- [ ] Error logging enabled
- [ ] Team notifications setup

### 7. Documentation

- [ ] Deployment addresses documented
- [ ] Deployment date/time recorded
- [ ] Deployer address saved
- [ ] Transaction hashes saved
- [ ] Network details confirmed
- [ ] Integration guide updated

### 8. Announcement

- [ ] Internal team notified
- [ ] Documentation updated
- [ ] Support team briefed
- [ ] Users notified (if applicable)

## Post-Deployment Checklist

### First 24 Hours
- [ ] Monitor all transactions
- [ ] Check for unexpected behavior
- [ ] Review gas costs
- [ ] User feedback collected
- [ ] No critical issues

### First Week
- [ ] Daily monitoring
- [ ] Performance metrics collected
- [ ] User adoption tracked
- [ ] Support tickets reviewed
- [ ] Optimization opportunities identified

### First Month
- [ ] Weekly reviews
- [ ] Security monitoring
- [ ] Cost analysis
- [ ] Feature usage stats
- [ ] Planning for v2 (if needed)

## Emergency Procedures

### If Something Goes Wrong

1. **Stop All Activity**
   - Pause frontend immediately
   - Notify all users
   - Document the issue

2. **Assess Severity**
   - Critical: Funds at risk
   - Major: Core functionality broken
   - Minor: UI issues or edge cases

3. **Execute Response Plan**
   - Critical: Emergency pause (if implemented)
   - Major: Hotfix deployment
   - Minor: Schedule regular fix

4. **Communication**
   - Notify team immediately
   - Update status page
   - Inform users
   - Document incident

### Rollback Plan

If deployment fails:
1. Do NOT panic
2. Save all transaction hashes
3. Document what went wrong
4. Analyze the issue
5. Fix in testnet first
6. Redeploy when ready

## Deployment Success Criteria

Deployment is considered successful when:
- [ ] All contracts deployed and verified
- [ ] All smoke tests passing
- [ ] Frontend integration working
- [ ] No critical issues in first 24 hours
- [ ] Monitoring active and showing healthy status
- [ ] Team confident in deployment
- [ ] Documentation complete

## Resources

- **Base Documentation**: https://docs.base.org/
- **Foundry Documentation**: https://book.getfoundry.sh/
- **BaseScan**: https://basescan.org/
- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **Support**: Team Slack channel

---

**Remember**: Better to deploy slowly and correctly than quickly and incorrectly. When in doubt, ask the team!
