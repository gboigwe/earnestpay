/**
 * Mobile detection and deep linking utilities
 */

/**
 * Detect if the user is on a mobile device
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Detect if the user is on iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;

  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Detect if the user is on Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;

  return /Android/.test(navigator.userAgent);
}

/**
 * Wallet deep link configurations
 */
export interface WalletDeepLink {
  name: string;
  scheme: string; // e.g., "metamask://"
  appStore: string; // iOS App Store URL
  playStore: string; // Android Play Store URL
  universal?: string; // Universal link (https://)
}

export const WALLET_DEEP_LINKS: Record<string, WalletDeepLink> = {
  metamask: {
    name: 'MetaMask',
    scheme: 'metamask://wc?uri=',
    universal: 'https://metamask.app.link/wc?uri=',
    appStore: 'https://apps.apple.com/us/app/metamask/id1438144202',
    playStore: 'https://play.google.com/store/apps/details?id=io.metamask',
  },
  trust: {
    name: 'Trust Wallet',
    scheme: 'trust://wc?uri=',
    universal: 'https://link.trustwallet.com/wc?uri=',
    appStore: 'https://apps.apple.com/us/app/trust-crypto-bitcoin-wallet/id1288339409',
    playStore: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
  },
  rainbow: {
    name: 'Rainbow',
    scheme: 'rainbow://wc?uri=',
    universal: 'https://rainbow.me/wc?uri=',
    appStore: 'https://apps.apple.com/us/app/rainbow-ethereum-wallet/id1457119021',
    playStore: 'https://play.google.com/store/apps/details?id=me.rainbow',
  },
  coinbase: {
    name: 'Coinbase Wallet',
    scheme: 'cbwallet://wc?uri=',
    universal: 'https://go.cb-w.com/wc?uri=',
    appStore: 'https://apps.apple.com/us/app/coinbase-wallet/id1278383455',
    playStore: 'https://play.google.com/store/apps/details?id=org.toshi',
  },
};

/**
 * Generate a deep link URL for a wallet
 *
 * @param walletId - The wallet identifier (e.g., 'metamask', 'trust')
 * @param wcUri - The WalletConnect URI
 * @param useUniversal - Whether to use universal links (recommended for iOS)
 * @returns The deep link URL
 */
export function generateDeepLink(
  walletId: string,
  wcUri: string,
  useUniversal: boolean = isIOS()
): string {
  const wallet = WALLET_DEEP_LINKS[walletId];
  if (!wallet) {
    throw new Error(`Unknown wallet: ${walletId}`);
  }

  const encodedUri = encodeURIComponent(wcUri);

  // Use universal link if available and requested (better for iOS)
  if (useUniversal && wallet.universal) {
    return `${wallet.universal}${encodedUri}`;
  }

  // Otherwise use custom scheme
  return `${wallet.scheme}${encodedUri}`;
}

/**
 * Open a wallet app via deep link
 *
 * @param walletId - The wallet identifier
 * @param wcUri - The WalletConnect URI
 * @param fallbackToStore - Whether to fallback to app store if wallet not installed
 */
export function openWalletDeepLink(
  walletId: string,
  wcUri: string,
  fallbackToStore: boolean = true
): void {
  const deepLink = generateDeepLink(walletId, wcUri);
  const wallet = WALLET_DEEP_LINKS[walletId];

  if (!wallet) {
    console.error(`Unknown wallet: ${walletId}`);
    return;
  }

  // Try to open the wallet app
  window.location.href = deepLink;

  if (fallbackToStore) {
    // If the app doesn't open in 2 seconds, redirect to store
    setTimeout(() => {
      const storeUrl = isIOS() ? wallet.appStore : wallet.playStore;

      // Check if we're still on the page (app didn't open)
      if (document.hasFocus()) {
        window.location.href = storeUrl;
      }
    }, 2000);
  }
}

/**
 * Get the app store URL for a wallet
 */
export function getWalletStoreUrl(walletId: string): string {
  const wallet = WALLET_DEEP_LINKS[walletId];
  if (!wallet) {
    return '';
  }

  return isIOS() ? wallet.appStore : wallet.playStore;
}

/**
 * Check if deep linking is supported in the current environment
 */
export function isDeepLinkSupported(): boolean {
  return isMobile();
}
