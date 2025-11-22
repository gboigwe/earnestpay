# 🌐 Multi-Chain Setup Guide

This guide will help you set up and configure EarnestPay's multi-chain functionality, allowing you to interact with multiple blockchains including Aptos, Ethereum, Arbitrum, Base, and Polygon.

## Prerequisites

- Node.js 18+
- Git
- Package manager (npm, yarn, or pnpm)
- Aptos wallet (Petra recommended)
- EVM-compatible wallet (MetaMask recommended)

## Quick Start

### Step 1: Get Reown Project ID

1. Visit [Reown Cloud](https://cloud.reown.com)
2. Sign up for a free account if you don't have one
3. Create a new project
4. Copy your Project ID from the dashboard

### Step 2: Configure Environment

1. Copy the example environment file:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Update the environment variables in `frontend/.env`:
   ```env
   VITE_REOWN_PROJECT_ID=your_project_id_here
   VITE_APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
   VITE_ETHERSCAN_API_KEY=your_etherscan_api_key
   VITE_ALCHEMY_API_KEY=your_alchemy_api_key
   ```

3. Install dependencies:
   ```bash
   cd frontend
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

## Wallet Connection

### Aptos Wallet

1. Install the [Petra Wallet](https://petra.app/) extension
2. Create or import an Aptos account
3. Ensure you have test APT for the testnet

### EVM Wallet (MetaMask)

1. Install the [MetaMask](https://metamask.io/) extension
2. Create or import an Ethereum account
3. Add the following networks to your wallet:
   - **Arbitrum One**
   - **Base**
   - **Polygon**

## Testing Multi-Chain Functionality

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test wallet connections:
   - Click "Connect Wallet" in the top-right corner
   - Select either Aptos or EVM wallet
   - Verify your balance is displayed correctly

3. Test chain switching:
   - Use the chain selector in the wallet widget
   - Verify the UI updates to show the correct chain

## Troubleshooting

### Common Issues

1. **Wallet Not Connecting**
   - Ensure the wallet extension is installed and unlocked
   - Check browser console for errors
   - Try disconnecting and reconnecting the wallet

2. **Incorrect Network**
   - Make sure you're connected to the correct network in your wallet
   - Check that the chain ID matches the expected network

3. **Missing Dependencies**
   - Run `npm install` to ensure all dependencies are installed
   - Clear your browser cache and restart the development server

### Getting Help

If you encounter any issues, please:
1. Check the [FAQ](#faq) section below
2. Search for similar issues in our [GitHub Issues](https://github.com/gboigwe/earnestpay/issues)
3. Open a new issue if your problem isn't listed

## FAQ

### Which wallets are supported?
- **Aptos**: Petra Wallet, Martian Wallet
- **EVM**: MetaMask, WalletConnect, Coinbase Wallet

### How do I get test tokens?
- **Aptos Testnet**: Use the [Aptos Faucet](https://faucet.testnet.aptoslabs.com/)
- **Ethereum Goerli**: Use [Goerli Faucet](https://goerlifaucet.com/)
- **Arbitrum Goerli**: Use [Arbitrum Faucet](https://faucet.quicknode.com/arbitrum/goerli)

### How do I add a new chain?
1. Update the `ChainContext` with the new chain configuration
2. Add the chain to the `supportedChains` array
3. Update the UI components to handle the new chain

## Next Steps

- [View Architecture Documentation](./ARCHITECTURE.md)
- [Learn about Contributing](../CONTRIBUTING.md)
- [Report an Issue](https://github.com/gboigwe/earnestpay/issues/new)
