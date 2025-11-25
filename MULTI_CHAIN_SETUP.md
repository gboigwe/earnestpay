# 🌐 Multi-Chain Setup Guide

Complete guide for setting up and using EarnestPay's multi-chain functionality.

---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Aptos Setup (Required)](#aptos-setup-required)
4. [EVM Setup (Optional)](#evm-setup-optional)
5. [Testing Multi-Chain Features](#testing-multi-chain-features)
6. [Troubleshooting](#troubleshooting)

---

## Overview

EarnestPay supports multiple blockchain networks:

- **Aptos** - Primary blockchain (always active)
- **Ethereum** - EVM support (requires Reown configuration)
- **Arbitrum** - L2 scaling solution
- **Base** - Coinbase's L2 network
- **Polygon** - Ethereum sidechain

### Architecture

```
┌─────────────────────────────────────────┐
│         EarnestPay Frontend             │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   MultiChainWalletProvider      │   │
│  │   ├─ WalletProvider (Aptos)     │   │
│  │   └─ ReownProvider (EVM)        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       ChainContext              │   │
│  │   ├─ Selected Chain State       │   │
│  │   ├─ Wallet Connections         │   │
│  │   └─ localStorage Persistence   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    UI Components                │   │
│  │   ├─ ChainSelector              │   │
│  │   ├─ SplitWalletButton          │   │
│  │   ├─ EnhancedWalletModal        │   │
│  │   └─ ErrorBoundary              │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Prerequisites

### System Requirements
- **Node.js**: v16 or higher
- **npm**: v8 or higher
- **Git**: Latest version

### Wallet Requirements
- **For Aptos**: Petra, Martian, Pontem, MSafe, or Nightly wallet
- **For EVM**: MetaMask, Coinbase Wallet, or any WalletConnect-compatible wallet

---

## Aptos Setup (Required)

### 1. Install Aptos Wallet

**Petra Wallet (Recommended)**
1. Visit [petra.app](https://petra.app)
2. Install browser extension for Chrome, Brave, or Edge
3. Create a new wallet or import existing
4. Save your recovery phrase securely

**Alternative Wallets**
- [Martian Wallet](https://martianwallet.xyz) - Developer-friendly
- [Pontem Wallet](https://pontem.network/pontem-wallet) - DeFi-focused
- [MSafe](https://www.m-safe.io/) - Multi-sig for teams
- [Nightly](https://nightly.app) - Multi-chain support

### 2. Get Test APT (Testnet)

```bash
# Using Aptos CLI
aptos account fund-with-faucet --account <YOUR_ADDRESS>

# Or use the faucet website
# Visit: https://aptoslabs.com/testnet-faucet
```

### 3. Test Aptos Connection

1. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to `http://localhost:5173`

3. Click "Connect Wallet" → Choose "Aptos Wallet"

4. Select your installed wallet (e.g., Petra)

5. Approve the connection

**Success Indicators:**
- ✅ Wallet address displayed in UI
- ✅ Green pulsing connection indicator
- ✅ "Aptos" chain selected in ChainSelector

---

## EVM Setup (Optional)

### 1. Create Reown Account

1. Visit [cloud.reown.com](https://cloud.reown.com)
2. Sign up with email or GitHub
3. Verify your email

### 2. Create Project

1. Click "Create Project"
2. Project Name: `EarnestPay`
3. Project Type: `App`
4. Select SDK: `AppKit`

### 3. Get Project ID

1. Go to project settings
2. Copy your **Project ID** (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 4. Configure Environment

Create or update `frontend/.env`:

```bash
# EVM Support (Optional)
VITE_REOWN_PROJECT_ID=your_project_id_here
```

**Security Note**: Never commit `.env` to version control. The `.gitignore` file already excludes it.

### 5. Configure Allowed Origins

In Reown dashboard:

1. Go to project settings
2. Find "Allowed Origins"
3. Add these URLs:
   ```
   http://localhost:5173
   http://localhost:5174
   https://your-production-domain.com
   ```

### 6. Install EVM Wallet

**MetaMask (Recommended)**
1. Visit [metamask.io](https://metamask.io)
2. Install browser extension
3. Create new wallet or import existing
4. Add test networks if needed

**Alternative Wallets**
- [Coinbase Wallet](https://www.coinbase.com/wallet) - User-friendly
- [Rainbow](https://rainbow.me) - Modern interface
- [Trust Wallet](https://trustwallet.com) - Mobile-first
- Any WalletConnect-compatible wallet

### 7. Add Test Networks

**Testnet Networks for Development:**

1. **Sepolia (Ethereum Testnet)**
   - Network Name: `Sepolia`
   - RPC URL: `https://rpc.sepolia.org`
   - Chain ID: `11155111`
   - Currency: `ETH`
   - Explorer: `https://sepolia.etherscan.io`

2. **Arbitrum Sepolia**
   - Network Name: `Arbitrum Sepolia`
   - RPC URL: `https://sepolia-rollup.arbitrum.io/rpc`
   - Chain ID: `421614`
   - Currency: `ETH`
   - Explorer: `https://sepolia.arbiscan.io`

3. **Base Sepolia**
   - Network Name: `Base Sepolia`
   - RPC URL: `https://sepolia.base.org`
   - Chain ID: `84532`
   - Currency: `ETH`
   - Explorer: `https://sepolia.basescan.org`

4. **Polygon Mumbai**
   - Network Name: `Polygon Mumbai`
   - RPC URL: `https://rpc-mumbai.maticvigil.com`
   - Chain ID: `80001`
   - Currency: `MATIC`
   - Explorer: `https://mumbai.polygonscan.com`

### 8. Get Test ETH

**Sepolia Faucet:**
- [Alchemy Faucet](https://sepoliafaucet.com)
- [Infura Faucet](https://www.infura.io/faucet/sepolia)

**Arbitrum Sepolia Faucet:**
- [Arbitrum Faucet](https://faucet.arbitrum.io)

**Base Sepolia Faucet:**
- [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

**Polygon Mumbai Faucet:**
- [Polygon Faucet](https://faucet.polygon.technology)

### 9. Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Restart with new environment variables
npm run dev
```

### 10. Test EVM Connection

1. Navigate to `http://localhost:5173`

2. Click "Connect Wallet" → Choose "EVM Wallet"

3. Select your wallet (e.g., MetaMask)

4. Approve the connection

5. Switch networks using ChainSelector:
   - Click ChainSelector dropdown
   - Choose Ethereum, Arbitrum, Base, or Polygon
   - Approve network switch in wallet

**Success Indicators:**
- ✅ Wallet address displayed in UI
- ✅ Green pulsing connection indicator
- ✅ Selected EVM network shown in ChainSelector
- ✅ "Active" badge on current network

---

## Testing Multi-Chain Features

### Manual Testing Checklist

**Chain Switching**
- [ ] Switch from Aptos to Ethereum
- [ ] Switch between EVM networks (Ethereum → Arbitrum → Base → Polygon)
- [ ] Switch back to Aptos
- [ ] Verify smooth animations during transitions

**Wallet Connections**
- [ ] Connect Aptos wallet (Petra)
- [ ] Connect EVM wallet (MetaMask)
- [ ] Disconnect Aptos wallet
- [ ] Disconnect EVM wallet
- [ ] Verify connection indicators update correctly

**Error Handling**
- [ ] Try switching to network not added to wallet (should show helpful error)
- [ ] Reject connection in wallet (should show user-friendly message)
- [ ] Try connecting without wallet installed (should show "Install" option)
- [ ] Test with wallet locked (should prompt unlock)

**UI/UX**
- [ ] Verify ChainSelector animations (icon rotation, dropdown slide)
- [ ] Check pulsing connection indicators
- [ ] Test wallet modal animations (fade in/out, staggered list)
- [ ] Verify hover effects on buttons
- [ ] Test loading states during connections

**Persistence**
- [ ] Select a chain and refresh page (should remember selection)
- [ ] Connect wallet and refresh page (should attempt reconnection)
- [ ] Clear localStorage and verify default chain (should be Aptos)

### Automated Testing

Run the test suite:

```bash
cd frontend

# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test

# Run with UI
npm run test:ui
```

**Expected Coverage:**
- ChainContext: >90%
- ChainSelector: >85%
- Wallet Components: >80%
- Error Handlers: >90%

---

## Troubleshooting

### Aptos Issues

**Problem: Wallet not detected**
- Solution: Refresh page after installing wallet extension
- Solution: Check if wallet is unlocked
- Solution: Try a different browser (Chrome recommended)

**Problem: Connection fails**
- Solution: Check if on correct network (Testnet/Mainnet)
- Solution: Try disconnecting and reconnecting
- Solution: Clear wallet cache and retry

**Problem: Transaction fails**
- Solution: Check if you have enough APT for gas fees
- Solution: Verify smart contract is deployed on current network
- Solution: Check Aptos network status

### EVM Issues

**Problem: "Configure Reown to enable" message**
- Solution: Add `VITE_REOWN_PROJECT_ID` to `.env` file
- Solution: Restart development server after adding variable
- Solution: Verify Project ID is correct (no spaces/typos)

**Problem: Network switch fails**
- Solution: Check if network is added to your wallet
- Solution: Manually add network to MetaMask
- Solution: Try switching in wallet first, then in app

**Problem: "Allowed Origins" error**
- Solution: Add `http://localhost:5173` to Reown dashboard
- Solution: Check for typos in origin URL (no trailing slash)
- Solution: Wait 5-10 minutes for changes to propagate

**Problem: Wallet connection stuck**
- Solution: Reject and retry connection
- Solution: Clear browser cache and retry
- Solution: Try different wallet (MetaMask, Coinbase, etc.)

### Build Issues

**Problem: TypeScript errors**
- Solution: Run `npm run build` to check for compilation errors
- Solution: Check import paths use `.tsx` extension where needed
- Solution: Verify all dependencies are installed

**Problem: Module not found**
- Solution: Run `npm install` to ensure all dependencies are installed
- Solution: Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Solution: Check if package versions are compatible

**Problem: Vite build fails**
- Solution: Check for circular dependencies
- Solution: Verify `vite.config.ts` is properly configured
- Solution: Clear Vite cache: `rm -rf node_modules/.vite`

### Performance Issues

**Problem: Slow page load**
- Solution: Check if lazy loading is working (network tab)
- Solution: Verify code splitting chunks are generated
- Solution: Run production build: `npm run build`

**Problem: Animations laggy**
- Solution: Check GPU acceleration is enabled
- Solution: Reduce `prefers-reduced-motion` if enabled
- Solution: Test on different device/browser

---

## Next Steps

### For Users
- Connect your wallets and try switching chains
- Test transaction flows on different networks
- Provide feedback on UX improvements

### For Developers
- Review [MULTI_CHAIN_ARCHITECTURE.md](./MULTI_CHAIN_ARCHITECTURE.md) for technical details
- Check [ROADMAP_PROGRESS.md](./ROADMAP_PROGRESS.md) for implementation status
- See [WALLET_FEATURES.md](./WALLET_FEATURES.md) for wallet integration details

### For Contributors
- Start with "Good First Issues" in GitHub
- Review testing documentation
- Follow commit message conventions

---

## Support

### Documentation
- [WALLET_FEATURES.md](./WALLET_FEATURES.md) - Wallet integration details
- [MULTI_CHAIN_ARCHITECTURE.md](./MULTI_CHAIN_ARCHITECTURE.md) - Technical architecture
- [ROADMAP_PROGRESS.md](./ROADMAP_PROGRESS.md) - Implementation status

### External Resources
- [Aptos Documentation](https://aptos.dev)
- [Reown Documentation](https://docs.reown.com)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)

### Getting Help
- Open an issue on [GitHub](https://github.com/gboigwe/earnestpay/issues)
- Check existing issues for solutions
- Review troubleshooting section above

---

**Last Updated**: January 24, 2025
**Version**: 1.0.0
**Maintainer**: @gboigwe
