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
      title: "Secure & Reliable",
      description: "Built on Aptos blockchain with enterprise-grade security. Your payroll data is cryptographically protected and immutable."
    },
    {
      icon: <Network className="w-8 h-8 text-purple-400" />,
      title: "Transparent & Auditable",
      description: "Every transaction is recorded on-chain with complete transparency. Track payments in real-time with full audit trails."
    },
    {
      icon: <Coins className="w-8 h-8 text-green-400" />,
      title: "Flexible Payments",
      description: "Pay in APT, USDC, USDT, or any supported token. Schedule recurring payments and manage payroll with ease."
    },
    {
      icon: <Wallet className="w-8 h-8 text-yellow-400" />,
      title: "Easy Integration",
      description: "Connect with Petra, Martian, and other Aptos wallets. Simple onboarding for both employers and employees."
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
              <img
                src="/earnestpay-icon.svg"
                alt="EarnestPay Logo"
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  EarnestPay
                </h1>
                <p className="text-xs text-gray-400">Payroll you can trust</p>
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
              Payroll you can trust—
            </span>
            <br />
            <span className="text-white">on time, every time.</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Modern payroll and payouts platform for companies and salary earners.
            Secure, reliable, and transparent payment processing powered by Aptos blockchain technology.
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
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-900 transition-all">
              View Protocol
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {[
              { number: "500+", label: "Companies Trust Us" },
              { number: "₳2.1B", label: "Processed Volume" },
              { number: "15", label: "Supported Tokens" },
              { number: "100%", label: "Reliable Uptime" }
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
              Built for Modern Organizations
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Aptos blockchain technology delivers security, speed, and transparency.
              Professional payroll management you can rely on.
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

      {/* How It Works Section */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              How EarnestPay Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Simple, secure payroll in three easy steps. Get started in minutes, not days.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Connect & Register</h3>
                <p className="text-gray-300 mb-4">
                  Connect your Aptos wallet (Petra, Martian, or any supported wallet) and register your company on the blockchain. Set up your payroll treasury in seconds.
                </p>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Secure wallet integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>One-time company setup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Fund treasury with APT or stablecoins</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Add Employees</h3>
                <p className="text-gray-300 mb-4">
                  Create employee profiles with wallet addresses, salaries, roles, and tax information. Import via CSV or add individually.
                </p>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Complete employee profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Role-based permissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Bulk CSV import support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Process Payroll</h3>
                <p className="text-gray-300 mb-4">
                  Schedule automated payments or process manually. Employees receive instant payments to their wallets with full transparency.
                </p>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Automated scheduling options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Instant blockchain payments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Complete audit trail on-chain</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Why Choose EarnestPay?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Traditional payroll systems are slow, expensive, and opaque. EarnestPay brings transparency, speed, and reliability to modern organizations.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left side - Benefits list */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Trustless & Transparent</h3>
                  <p className="text-gray-300">
                    Every payment is recorded on the Aptos blockchain. No hidden fees, no black boxes. Employees can verify their payments instantly with full transaction history.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Lightning Fast Payments</h3>
                  <p className="text-gray-300">
                    Aptos delivers sub-second finality. Employees receive their salaries instantly—no more waiting 3-5 business days for bank transfers to clear.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Cost Effective</h3>
                  <p className="text-gray-300">
                    Eliminate expensive intermediaries and payment processors. Transaction fees on Aptos are a fraction of traditional payroll costs—often less than $0.01 per payment.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Enterprise Security</h3>
                  <p className="text-gray-300">
                    Built on Aptos Move—a language designed for financial applications with formal verification. Multi-signature support and role-based access control ensure your funds are safe.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Stats/Metrics */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20">
              <h3 className="text-2xl font-bold text-white mb-8">By The Numbers</h3>
              <div className="space-y-6">
                <div className="border-b border-gray-700 pb-6">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    &lt; 1 sec
                  </div>
                  <p className="text-gray-300">Average payment settlement time on Aptos blockchain</p>
                </div>
                <div className="border-b border-gray-700 pb-6">
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    99.9%
                  </div>
                  <p className="text-gray-300">Uptime guarantee with blockchain infrastructure</p>
                </div>
                <div className="border-b border-gray-700 pb-6">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    $0.0001
                  </div>
                  <p className="text-gray-300">Average transaction cost per payment</p>
                </div>
                <div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                    100%
                  </div>
                  <p className="text-gray-300">Payment transparency with on-chain verification</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to modernize your payroll?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join forward-thinking companies using EarnestPay for transparent, reliable, and instant payroll payments on Aptos blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleGetStarted}
              disabled={isLoading}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
            >
              <Wallet className="mr-3" size={24} />
              {isLoading ? 'Connecting...' : connected ? 'Launch Dashboard' : 'Get Started Free'}
            </Button>
            <Button
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-6 text-lg transition-all font-semibold"
            >
              View Documentation
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            No credit card required • Connect wallet in 30 seconds • Built on Aptos
          </p>
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