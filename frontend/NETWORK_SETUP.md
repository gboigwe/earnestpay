# Quick Network Setup Guide

Get started with Base network configuration in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- A wallet that supports Base (Coinbase Wallet, MetaMask, etc.)
- Testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet) (for testing)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create `.env` file:

```bash
# Reown/WalletConnect Project ID (get from https://cloud.reown.com)
VITE_REOWN_PROJECT_ID=your_project_id_here

# Default network (mainnet or testnet)
VITE_DEFAULT_NETWORK=testnet
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Connect Wallet

1. Click "Connect Wallet" button
2. Choose your wallet (Coinbase Wallet recommended)
3. Approve connection
4. Select Base Sepolia (testnet) or Base Mainnet

## Network Information

### Base Mainnet
- **Chain ID**: 8453
- **RPC**: https://mainnet.base.org
- **Explorer**: https://basescan.org
- **Currency**: ETH

### Base Sepolia (Testnet)
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Currency**: ETH (Test)
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## Adding Base to Your Wallet

### Automatic (Recommended)

The app will automatically prompt to add Base network when needed.

### Manual Setup

**Base Mainnet:**
1. Open wallet settings
2. Add Custom Network
3. Enter:
   - Network Name: Base
   - RPC URL: https://mainnet.base.org
   - Chain ID: 8453
   - Currency Symbol: ETH
   - Block Explorer: https://basescan.org

**Base Sepolia:**
1. Open wallet settings
2. Add Custom Network
3. Enter:
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.basescan.org

## Get Testnet ETH

1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Connect your wallet
3. Request testnet ETH
4. Wait 1-2 minutes for ETH to arrive

## Network Indicator

The app shows current network in the top-right corner:

- 🟢 **Base Mainnet** - Blue badge
- 🟡 **Base Sepolia** - Yellow badge with "Testnet"
- 🔴 **Wrong Network** - Red warning

Click the badge to switch networks.

## Troubleshooting

### "Unsupported Network" Error

**Solution**: Click the network badge and select Base Mainnet or Base Sepolia.

### "No Testnet ETH" Error

**Solution**: Get testnet ETH from the [faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet).

### "Can't Connect Wallet"

**Solutions**:
1. Refresh the page
2. Disconnect and reconnect wallet
3. Try a different wallet
4. Clear browser cache

### Transactions Failing

**Solutions**:
1. Ensure you have enough ETH for gas
2. Check you're on the correct network
3. Try increasing gas limit
4. Wait a few seconds and retry

## Testing Checklist

Before deploying to mainnet, test on Base Sepolia:

- [ ] Connect wallet successfully
- [ ] Switch between mainnet and testnet
- [ ] View network indicator
- [ ] Check transaction history
- [ ] Test all features with testnet ETH
- [ ] Verify gas estimation works
- [ ] Check error handling

## Next Steps

- Read full [Network Configuration Guide](./NETWORK_CONFIGURATION.md)
- Check out [Base Documentation](https://docs.base.org/)
- Join [Base Discord](https://discord.gg/buildonbase)

## Support

Having issues? Check:
1. [Network Configuration Guide](./NETWORK_CONFIGURATION.md)
2. [Base Documentation](https://docs.base.org/)
3. [GitHub Issues](https://github.com/gboigwe/earnestpay/issues)

---

**Quick Links**:
- 🌐 [Base Website](https://base.org/)
- 📖 [Base Docs](https://docs.base.org/)
- 🔍 [Base Explorer](https://basescan.org/)
- 💧 [Testnet Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
