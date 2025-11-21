import "../vite.polyfills";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "@/App.tsx";
// Internal components
import { Toaster } from "@/components/ui/toaster.tsx";
import { MultiChainWalletProvider } from "@/components/MultiChainWalletProvider.tsx";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";
import { ChainProvider } from "@/contexts/ChainContext";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChainProvider>
      <MultiChainWalletProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <WrongNetworkAlert />
          <Toaster />
        </QueryClientProvider>
      </MultiChainWalletProvider>
    </ChainProvider>
  </React.StrictMode>,
);
