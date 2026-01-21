import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

// Reown/WalletConnect project ID
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '';

/**
 * Wagmi configuration for Base blockchain
 * Includes Coinbase Wallet, WalletConnect, and injected wallet support
 */
export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    // Coinbase Wallet - Primary wallet for Base
    coinbaseWallet({
      appName: 'EarnestPay',
      appLogoUrl: typeof window !== 'undefined'
        ? `${window.location.origin}/earnestpay-icon.svg`
        : 'https://earnestpay.com/earnestpay-icon.svg',
      preference: 'all', // Supports both mobile app and browser extension
      version: '4',
    }),

    // WalletConnect - For mobile wallets
    walletConnect({
      projectId,
      metadata: {
        name: 'EarnestPay',
        description: 'Blockchain payroll and payouts platform on Base',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://earnestpay.com',
        icons: [
          typeof window !== 'undefined'
            ? `${window.location.origin}/earnestpay-icon.svg`
            : 'https://earnestpay.com/earnestpay-icon.svg'
        ],
      },
      showQrModal: true,
    }),

    // Injected wallets (MetaMask, Rabby, etc.)
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: false,
});
