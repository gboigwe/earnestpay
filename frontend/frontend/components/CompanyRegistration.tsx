import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import { registerCompany } from "@/utils/payroll";
import { aptosClient } from "@/utils/aptosClient";
import { MODULE_ADDRESS } from "@/constants";

export function CompanyRegistration() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [companyName, setCompanyName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function checkRegistered() {
      if (!account?.address) {
        setAlreadyRegistered(null);
        return;
      }
      try {
        // Try view: get_company_info(company_address)
        await aptosClient().view({
          payload: {
            function: `${MODULE_ADDRESS}::payroll_manager::get_company_info`,
            functionArguments: [account.address],
          },
        });
        if (!cancelled) setAlreadyRegistered(true);
      } catch {
        if (!cancelled) setAlreadyRegistered(false);
      }
    }
    checkRegistered();
    return () => {
      cancelled = true;
    };
  }, [account?.address]);

  const onRegister = async () => {
    if (!account) {
      toast({ title: "Wallet not connected", variant: "destructive" });
      return;
    }
    if (!companyName.trim()) {
      toast({ title: "Enter a company name", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setTxHash(null);
    try {
      const walletLike: any = { account, signAndSubmitTransaction };
      const tx = await registerCompany(walletLike, companyName.trim());
      setTxHash(tx.hash);
      toast({
        title: "✅ Company Registered Successfully!",
        description: `Your company "${companyName.trim()}" is now on the blockchain. Transaction: ${tx.hash.slice(0, 10)}...`,
      });
      setAlreadyRegistered(true);
    } catch (e: any) {
      console.error('Company registration error:', e);

      // Handle different types of errors with friendly messages
      let errorTitle = "Registration Failed";
      let errorMessage = "An unexpected error occurred";

      // Check for simulation errors (these happen BEFORE wallet popup)
      if (e?.message?.includes('MAX_GAS_UNITS_BELOW_MIN_TRANSACTION_GAS_UNITS')) {
        errorTitle = '💰 Insufficient Gas Funds';
        errorMessage = 'You need APT tokens in your wallet to pay for transaction gas fees. Please fund your wallet from the Aptos faucet first.';
      } else if (e?.message?.includes('INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE')) {
        errorTitle = '💰 Insufficient Balance';
        errorMessage = 'You don\'t have enough APT to pay for gas fees. Please add funds to your wallet from the faucet.';
      } else if (e?.message?.includes("User rejected") || e?.code === 4001) {
        // Silent - user cancelled on purpose
        setSubmitting(false);
        return;
      } else if (e?.message?.includes("Insufficient")) {
        errorTitle = "Insufficient Funds";
        errorMessage = "You don't have enough APT to pay for transaction fees.";
      } else if (e?.message?.includes("already exists") || e?.message?.includes("RESOURCE_ALREADY_EXISTS")) {
        errorTitle = "Company Already Registered";
        errorMessage = "A company is already registered with this wallet address.";
        setAlreadyRegistered(true);
      } else if (e?.message) {
        errorMessage = e.message;
      } else if (e?.vm_status) {
        errorMessage = `Blockchain error: ${e.vm_status}`;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!account && (
        <div className="p-3 rounded border border-amber-300 bg-amber-50 text-amber-800 text-sm mb-2">
          Please connect your wallet to register your company on the blockchain.
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Company Name</label>
        <Input
          placeholder="e.g. MyCompany Inc"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">Enter your company name. You can register it after connecting your wallet.</p>
      </div>
      <Button onClick={onRegister} disabled={!account || submitting || alreadyRegistered === true} className="w-full">
        {alreadyRegistered === true ? "Company Already Registered" : submitting ? "Registering..." : "Register Company"}
      </Button>
      {alreadyRegistered === false && (
        <p className="text-xs text-green-600">No company found at your address. You can register one.</p>
      )}
      {alreadyRegistered === true && (
        <p className="text-xs text-blue-600">A company is already registered at your address.</p>
      )}
      {txHash && (
        <p className="text-sm text-gray-500 break-all">Transaction: {txHash}</p>
      )}
    </div>
  );
}
