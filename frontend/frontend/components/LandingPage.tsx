import React, { useState } from 'react';
import { 
  ArrowRight, 
  Shield, 
  Star,
  DollarSign,
  Menu,
  X,
  Wallet,
  Lock,
  TrendingUp,
  Network,
  Coins,
  CheckCircle
} from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { toast } from './ui/use-toast';
import { Button } from './ui/button';

const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { connect, wallets, connected, account } = useWallet();

  const handleGetStarted = async () => {
    if (!connected) {
      if (!wallets || wallets.length === 0) {
        toast({
          title: "No Wallets Found",
          description: "Please install an Aptos wallet like Petra to continue.",
          variant: "destructive",
        });
        return;
      }
      setShowWalletModal(true);
    } else {
      onGetStarted();
    }
  };

  const handleWalletSelect = async (walletName: string) => {
    setShowWalletModal(false);
    setIsConnecting(true);
    
    try {
      await connect(walletName);
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletName}`,
      });
      onGetStarted();
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

  const isLoading = isConnecting;

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-400" />,
      title: "Aptos Blockchain Security",
      description: "Built on Aptos Move language with formal verification. Your payroll data is cryptographically secured with immutable smart contracts."
    },
    {
      icon: <Network className="w-8 h-8 text-purple-400" />,
      title: "Decentralized Architecture", 
      description: "No central authority controls your payroll. Smart contracts execute automatically with full transparency and auditability."
    },
    {
      icon: <Coins className="w-8 h-8 text-green-400" />,
      title: "Native Crypto Payments",
      description: "Pay in APT, USDC, USDT, or any supported token. Real-time DeFi integration with automatic yield farming."
    },
    {
      icon: <Wallet className="w-8 h-8 text-yellow-400" />,
      title: "Web3 Wallet Integration",
      description: "Connect with Petra, Martian, Pontem, and all major Aptos wallets. Employees control their own keys."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="border-b border-gray-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <DollarSign className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AptosPayroll
                </h1>
                <p className="text-xs text-gray-400">Web3 Payroll Suite</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#protocol" className="text-gray-300 hover:text-white transition-colors">Protocol</a>
              <a href="#tokenomics" className="text-gray-300 hover:text-white transition-colors">Tokenomics</a>
              <a href="#docs" className="text-gray-300 hover:text-white transition-colors">Docs</a>
              <div className="flex items-center gap-2 text-sm mr-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Testnet</span>
              </div>
              <Button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <Wallet className="mr-2" size={16} />
                Launch App
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-800 py-4">
              <div className="space-y-2">
                <a href="#protocol" className="block px-3 py-2 text-gray-300 hover:text-white">Protocol</a>
                <a href="#tokenomics" className="block px-3 py-2 text-gray-300 hover:text-white">Tokenomics</a>
                <a href="#docs" className="block px-3 py-2 text-gray-300 hover:text-white">Docs</a>
                <div className="px-3 py-2">
                  <Button
                    onClick={handleGetStarted}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Wallet className="mr-2" size={16} />
                    Launch App
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Payroll for the
            </span>
            <br />
            <span className="text-white">Future</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Revolutionary blockchain-powered payroll system. Smart contracts handle payments, 
            DeFi yields grow your treasury, and employees control their crypto directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleGetStarted}
              disabled={isLoading}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg"
            >
              <Wallet className="mr-3" size={20} />
              {isLoading ? 'Connecting...' : connected ? 'Launch Dashboard' : 'Connect Wallet'}
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-gray-600 text-gray-300 hover:bg-gray-800">
              View Protocol
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {[
              { number: "500+", label: "DAOs & Web3 Companies" },
              { number: "₳2.1B", label: "On-Chain Volume" },
              { number: "15", label: "Supported Tokens" },
              { number: "100%", label: "Decentralized Uptime" }
            ].map((stat, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="protocol" className="py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Built for Web3 Native Organizations
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Move smart contracts on Aptos deliver unprecedented security, speed, and transparency. 
              The only DeFi-native payroll protocol you'll ever need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur rounded-xl p-6 hover:bg-gray-800/70 transition-colors"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-800">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400">Choose your preferred Aptos wallet to continue</p>
            </div>
            
            <div className="space-y-3">
              {wallets?.map((wallet, index) => (
                <button
                  key={`${wallet.name}-${index}`}
                  onClick={() => handleWalletSelect(wallet.name)}
                  disabled={isConnecting}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Wallet className="text-white" size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-semibold">{wallet.name}</div>
                    <div className="text-gray-400 text-sm">
                      {wallet.name === 'Petra' && 'Most Popular'}
                      {wallet.name === 'Martian' && 'Developer Friendly'}
                      {wallet.name === 'Pontem' && 'DeFi Focused'}
                      {!['Petra', 'Martian', 'Pontem'].includes(wallet.name) && 'Aptos Wallet'}
                    </div>
                  </div>
                  <ArrowRight className="text-gray-400" size={20} />
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowWalletModal(false)}
              className="w-full mt-6 p-3 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;