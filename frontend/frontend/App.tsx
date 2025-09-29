import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal Components
import LandingPage from "@/components/LandingPage";
import { PayrollDashboard } from "@/components/PayrollDashboard";

function App() {
  const { connected } = useWallet();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');

  const handleGetStarted = () => {
    if (connected) {
      setCurrentView('dashboard');
    }
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  // Show the appropriate view based on connection and user choice
  if (currentView === 'landing' || !connected) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return <PayrollDashboard onBack={handleBackToLanding} />;
}

export default App;
