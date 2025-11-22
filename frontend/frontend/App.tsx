import { useState } from "react";
// Internal Components
import LandingPage from "@/components/LandingPage";
import { PayrollDashboard } from "@/components/PayrollDashboard";

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');

  const handleGetStarted = () => {
    setCurrentView('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  // Show the appropriate view based on user choice
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return <PayrollDashboard onBack={handleBackToLanding} />;
}

export default App;
