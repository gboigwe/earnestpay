import { useState } from "react";
// Internal Components
import LandingPage from "@/components/LandingPage";
import { PayrollDashboard } from "@/components/PayrollDashboard";
import TransactionHistory from "@/components/TransactionHistory";

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'transactions'>('landing');

  const handleGetStarted = () => {
    setCurrentView('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleViewTransactions = () => {
    setCurrentView('transactions');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Show the appropriate view based on user choice
  switch (currentView) {
    case 'landing':
      return <LandingPage onGetStarted={handleGetStarted} />;
    case 'transactions':
      return <TransactionHistory onBack={handleBackToDashboard} />;
    case 'dashboard':
    default:
      return <PayrollDashboard onBack={handleBackToLanding} onViewTransactions={handleViewTransactions} />;
  }
}

export default App;
