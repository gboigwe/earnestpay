import React, { useState } from 'react';
import { ModernApp } from './ModernApp';
import './styles/globals.css';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>();

  const handleWalletConnect = () => {
    // Simulated wallet connection
    setWalletConnected(true);
    setWalletAddress('0x7f7cbb5829aa8d4165c0e2cc038745407bdde62654af1bc1ac46a69c05aa2de4');
  };

  return (
    <ModernApp 
      walletConnected={walletConnected}
      walletAddress={walletAddress}
      onWalletConnect={handleWalletConnect}
    />
  );
}

export default App;
