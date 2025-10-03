import { PropsWithChildren } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
// Internal components
import { useToast } from "@/components/ui/use-toast";
// Internal constants
import { APTOS_API_KEY, NETWORK } from "@/constants";

export function WalletProvider({ children }: PropsWithChildren) {
  const { toast } = useToast();

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: NETWORK, aptosApiKeys: {[NETWORK]: APTOS_API_KEY} }}
      onError={(error) => {
        // Only show toast for actual errors, not user cancellations
        const errorMsg = String(error || "");

        if (errorMsg.includes("User rejected") || errorMsg.includes("cancelled")) {
          // User cancelled - don't show error
          return;
        }

        toast({
          variant: "destructive",
          title: "Wallet Error",
          description: errorMsg || "An error occurred with your wallet connection",
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
