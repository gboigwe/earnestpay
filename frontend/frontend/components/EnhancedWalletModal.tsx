import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowRight,
  Wallet,
  HelpCircle,
  ExternalLink,
  Smartphone,
  Monitor,
  Info
} from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { toast } from './ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface WalletInfo {
  name: string;
  icon: string;
  description: string;
  downloadUrl: string;
  mobileSupport: boolean;
  deepLink?: string;
}

const WALLET_INFO: Record<string, WalletInfo> = {
  Petra: {
    name: 'Petra',
    icon: '🔺',
    description: 'Most popular Aptos wallet',
    downloadUrl: 'https://petra.app',
    mobileSupport: true,
    deepLink: 'petra://'
  },
  Martian: {
    name: 'Martian',
    icon: '👽',
    description: 'Developer-friendly wallet',
    downloadUrl: 'https://martianwallet.xyz',
    mobileSupport: true,
    deepLink: 'martian://'
  },
  Pontem: {
    name: 'Pontem',
    icon: '🌉',
    description: 'DeFi-focused wallet',
    downloadUrl: 'https://pontem.network/pontem-wallet',
    mobileSupport: false
  },
  MSafe: {
    name: 'MSafe',
    icon: '🔐',
    description: 'Multi-sig wallet for teams',
    downloadUrl: 'https://www.m-safe.io/',
    mobileSupport: false
  },
  Nightly: {
    name: 'Nightly',
    icon: '🌙',
    description: 'Multi-chain wallet',
    downloadUrl: 'https://nightly.app',
    mobileSupport: true
  }
};

interface EnhancedWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EnhancedWalletModal: React.FC<EnhancedWalletModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { connect, wallets } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showMobileQR, setShowMobileQR] = useState<string | null>(null);
  const [showWalletInfo, setShowWalletInfo] = useState(false);

  const handleWalletSelect = async (walletName: string) => {
    setIsConnecting(true);

    try {
      await connect(walletName);

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletName}`,
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Wallet connection failed:', error);

      let errorMessage = 'Failed to connect wallet. Please try again.';
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Connection cancelled by user.';
      } else if (error.message?.includes('not installed')) {
        errorMessage = `Please install ${walletName} wallet extension.`;
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

  const handleMobileConnect = (walletName: string) => {
    const walletInfo = WALLET_INFO[walletName];
    if (walletInfo?.deepLink) {
      setShowMobileQR(walletName);
    }
  };

  const getWalletInfo = (walletName: string): WalletInfo => {
    return WALLET_INFO[walletName] || {
      name: walletName,
      icon: '💼',
      description: 'Aptos Wallet',
      downloadUrl: 'https://aptoslabs.com/ecosystem',
      mobileSupport: false
    };
  };

  const availableWallets = wallets?.filter(w => w.readyState === 'Installed') || [];
  const notInstalledWallets = Object.keys(WALLET_INFO).filter(
    name => !availableWallets.some(w => w.name === name)
  );

  return (
    <>
      <Dialog open={isOpen && !showWalletInfo && !showMobileQR} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Connect Your Wallet
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose your preferred Aptos wallet to continue
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Installed Wallets */}
            {availableWallets.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-400 mb-3">Available Wallets</div>
                <div className="space-y-2">
                  {availableWallets.map((wallet, index) => {
                    const info = getWalletInfo(wallet.name);
                    return (
                      <div key={`${wallet.name}-${index}`} className="space-y-2">
                        <button
                          onClick={() => handleWalletSelect(wallet.name)}
                          disabled={isConnecting}
                          className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                            {info.icon}
                          </div>
                          <div className="text-left flex-1">
                            <div className="text-white font-semibold flex items-center gap-2">
                              {wallet.name}
                              <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                                Installed
                              </span>
                            </div>
                            <div className="text-gray-400 text-sm">{info.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {info.mobileSupport && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMobileConnect(wallet.name);
                                }}
                                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                title="Connect via mobile"
                              >
                                <Smartphone size={18} className="text-gray-400" />
                              </button>
                            )}
                            <ArrowRight className="text-gray-400 group-hover:text-blue-400 transition-colors" size={20} />
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Not Installed Wallets */}
            {notInstalledWallets.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-400 mb-3">Not Installed</div>
                <div className="space-y-2">
                  {notInstalledWallets.map((walletName) => {
                    const info = getWalletInfo(walletName);
                    return (
                      <a
                        key={walletName}
                        href={info.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-600/20 flex items-center justify-center text-2xl opacity-50">
                          {info.icon}
                        </div>
                        <div className="text-left flex-1">
                          <div className="text-white font-semibold">{walletName}</div>
                          <div className="text-gray-400 text-sm">{info.description}</div>
                        </div>
                        <div className="flex items-center gap-1 text-purple-400 text-sm">
                          <span>Install</span>
                          <ExternalLink size={16} />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Wallets Found */}
            {availableWallets.length === 0 && (
              <div className="text-center py-8">
                <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Wallets Detected</h3>
                <p className="text-gray-400 text-sm mb-4">
                  You need an Aptos wallet to continue. We recommend Petra for beginners.
                </p>
                <a
                  href="https://petra.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Install Petra Wallet
                  <ExternalLink size={16} />
                </a>
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
              What is a wallet?
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile QR Code Dialog */}
      <Dialog open={!!showMobileQR} onOpenChange={(open) => !open && setShowMobileQR(null)}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Connect via Mobile
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Scan this QR code with your mobile wallet
            </DialogDescription>
          </DialogHeader>

          {showMobileQR && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl">
                <QRCodeSVG
                  value={getWalletInfo(showMobileQR).deepLink || 'https://earnestpay.com'}
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
                  <div>Open {showMobileQR} wallet on your mobile device</div>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 font-bold">2</span>
                  </div>
                  <div>Scan this QR code with your wallet's scanner</div>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 font-bold">3</span>
                  </div>
                  <div>Approve the connection request on your phone</div>
                </div>
              </div>

              <button
                onClick={() => setShowMobileQR(null)}
                className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Use Desktop Instead
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Wallet Info Dialog */}
      <Dialog open={showWalletInfo} onOpenChange={(open) => !open && setShowWalletInfo(false)}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              What is a Wallet?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              A cryptocurrency wallet is a digital tool that allows you to store, manage, and interact with your digital assets on the blockchain.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">Secure Storage</div>
                  <div className="text-sm text-gray-400">
                    Your wallet securely stores your private keys, giving you full control over your funds.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Monitor className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">Web3 Access</div>
                  <div className="text-sm text-gray-400">
                    Wallets let you interact with blockchain applications like EarnestPay.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">Your Identity</div>
                  <div className="text-sm text-gray-400">
                    Your wallet address serves as your digital identity on the Aptos blockchain.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <strong>Important:</strong> Never share your private key or seed phrase with anyone. EarnestPay will never ask for it.
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
