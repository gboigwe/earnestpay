import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Wallet,
  HelpCircle,
  ExternalLink,
  Smartphone,
  Monitor,
  Info,
  Shield,
  Globe
} from 'lucide-react';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { toast } from './ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface EVMWalletInfo {
  name: string;
  icon: string;
  description: string;
  downloadUrl: string;
  mobileSupport: boolean;
  connectorId?: string;
}

const EVM_WALLETS: EVMWalletInfo[] = [
  {
    name: 'MetaMask',
    icon: '🦊',
    description: 'Most popular Ethereum wallet',
    downloadUrl: 'https://metamask.io',
    mobileSupport: true,
    connectorId: 'metaMask'
  },
  {
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Secure wallet by Coinbase',
    downloadUrl: 'https://www.coinbase.com/wallet',
    mobileSupport: true,
    connectorId: 'coinbaseWallet'
  },
  {
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect any mobile wallet',
    downloadUrl: 'https://walletconnect.com',
    mobileSupport: true,
    connectorId: 'walletConnect'
  },
  {
    name: 'Rainbow',
    icon: '🌈',
    description: 'Fun and easy to use',
    downloadUrl: 'https://rainbow.me',
    mobileSupport: true,
    connectorId: 'rainbow'
  }
];

const NETWORK_INFO = {
  mainnet: { name: 'Ethereum', icon: '⟠', color: 'blue' },
  arbitrum: { name: 'Arbitrum', icon: '🔷', color: 'sky' },
  base: { name: 'Base', icon: '🔵', color: 'indigo' },
  polygon: { name: 'Polygon', icon: '🟣', color: 'purple' }
};

interface EVMWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EVMWalletModal: React.FC<EVMWalletModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const [showMobileQR, setShowMobileQR] = useState(false);
  const [showWalletInfo, setShowWalletInfo] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if Reown is configured
  const reownProjectId = import.meta.env.VITE_REOWN_PROJECT_ID;
  const reownEnabled = !!reownProjectId;

  const handleWalletConnect = async () => {
    if (!reownEnabled) {
      toast({
        title: "Configuration Required",
        description: "Please configure Reown Project ID to enable EVM wallet connections.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Open Reown AppKit modal
      await open();

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to EVM wallet",
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('EVM wallet connection failed:', error);

      let errorMessage = 'Failed to connect wallet. Please try again.';
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Connection cancelled by user.';
      }

      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMobileConnect = () => {
    setShowMobileQR(true);
  };

  return (
    <>
      <Dialog open={isOpen && !showWalletInfo && !showMobileQR} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Connect EVM Wallet
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose your preferred Ethereum wallet to continue
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Configuration Check */}
            {!reownEnabled && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <strong>Setup Required:</strong> To enable EVM wallet connections, configure your Reown Project ID in the .env file.
                    <a
                      href="https://cloud.reown.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 text-yellow-400 hover:text-yellow-300 underline"
                    >
                      Get Project ID at cloud.reown.com →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Current Network Display */}
            {isConnected && chainId && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">
                    {NETWORK_INFO[chainId as keyof typeof NETWORK_INFO]?.icon || '🌐'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-green-400">Connected</div>
                    <div className="text-xs text-gray-400">
                      {NETWORK_INFO[chainId as keyof typeof NETWORK_INFO]?.name || 'Ethereum Network'}
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>
            )}

            {/* Wallet Options */}
            <div>
              <div className="text-sm font-medium text-gray-400 mb-3">Available Wallets</div>
              <div className="space-y-2">
                {EVM_WALLETS.map((wallet) => (
                  <div key={wallet.name} className="space-y-2">
                    <button
                      onClick={handleWalletConnect}
                      disabled={isConnecting || !reownEnabled}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                        {wallet.icon}
                      </div>
                      <div className="text-left flex-1">
                        <div className="text-white font-semibold flex items-center gap-2">
                          {wallet.name}
                        </div>
                        <div className="text-gray-400 text-sm">{wallet.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {wallet.mobileSupport && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMobileConnect();
                            }}
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                            title="Connect via mobile"
                            disabled={!reownEnabled}
                          >
                            <Smartphone size={18} className="text-gray-400" />
                          </button>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Install Wallet Links */}
            {!isConnected && (
              <div className="pt-4 border-t border-gray-800">
                <div className="text-sm font-medium text-gray-400 mb-3">Don't have a wallet?</div>
                <div className="grid grid-cols-2 gap-2">
                  {EVM_WALLETS.slice(0, 2).map((wallet) => (
                    <a
                      key={wallet.name}
                      href={wallet.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg border border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all text-sm"
                    >
                      <span className="text-xl">{wallet.icon}</span>
                      <div className="flex-1">
                        <div className="text-white font-medium text-xs">{wallet.name}</div>
                      </div>
                      <ExternalLink size={14} className="text-purple-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <button
              onClick={() => setShowWalletInfo(true)}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <HelpCircle size={16} />
              What is an EVM wallet?
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile QR Code Dialog */}
      <Dialog open={showMobileQR} onOpenChange={(open) => !open && setShowMobileQR(false)}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Connect via Mobile
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Scan this QR code with your mobile wallet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl">
              <QRCodeSVG
                value={`${window.location.origin}?connect=evm`}
                size={256}
                level="H"
                className="w-full h-auto"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 font-bold">1</span>
                </div>
                <div>Open your EVM wallet app on your mobile device</div>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 font-bold">2</span>
                </div>
                <div>Find the WalletConnect or QR scanner feature</div>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 font-bold">3</span>
                </div>
                <div>Scan this QR code to connect</div>
              </div>
            </div>

            <button
              onClick={() => setShowMobileQR(false)}
              className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Use Desktop Instead
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wallet Info Dialog */}
      <Dialog open={showWalletInfo} onOpenChange={(open) => !open && setShowWalletInfo(false)}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              What is an EVM Wallet?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              An EVM (Ethereum Virtual Machine) wallet allows you to interact with Ethereum and other compatible blockchains like Arbitrum, Base, and Polygon.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">Multi-Chain Support</div>
                  <div className="text-sm text-gray-400">
                    Access Ethereum, Arbitrum, Base, Polygon, and hundreds of other EVM-compatible networks.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">DeFi & dApps</div>
                  <div className="text-sm text-gray-400">
                    Connect to thousands of decentralized applications and DeFi protocols.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">Your Keys, Your Crypto</div>
                  <div className="text-sm text-gray-400">
                    You maintain full control of your private keys and assets.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Monitor className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">Browser Extension</div>
                  <div className="text-sm text-gray-400">
                    Most EVM wallets work as browser extensions for easy access.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <strong>Security Tip:</strong> Never share your seed phrase or private key with anyone. EarnestPay will never ask for it.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWalletInfo(false)}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all font-semibold"
            >
              Got it, thanks!
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
