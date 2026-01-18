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
  const [nameError, setNameError] = useState<string>("");

  const validateCompanyName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setNameError("Company name is required");
    } else if (trimmed.length < 3) {
      setNameError("Company name must be at least 3 characters");
    } else if (trimmed.length > 100) {
      setNameError("Company name must be less than 100 characters");
    } else {
      setNameError("");
    }
  };

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
    <div className="space-y-5">
      {!account && (
        <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 text-sm flex items-start gap-3">
          <div className="mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Wallet Connection Required</h4>
            <p>Connect your wallet to register your company on the Aptos blockchain. Your wallet address will become your unique company identifier.</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Company Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="companyName"
          placeholder="Enter your company name (e.g. Acme Corp)"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          onBlur={(e) => validateCompanyName(e.target.value)}
          error={nameError}
          className="text-base py-5"
        />
        {!nameError && (
          <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>This will be stored on-chain and cannot be changed later. Choose carefully!</span>
          </p>
        )}
      </div>

      <Button
        onClick={onRegister}
        disabled={!account || submitting || alreadyRegistered === true || !companyName.trim()}
        className="w-full gradient-primary text-white font-semibold py-6 text-base hover-lift"
      >
        {alreadyRegistered === true ? "✓ Company Already Registered" : submitting ? "Registering on Blockchain..." : "Register Company"}
      </Button>

      {alreadyRegistered === false && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>No company registered yet. You're all set to create one!</span>
        </div>
      )}

      {alreadyRegistered === true && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>Company already registered on this wallet address</span>
        </div>
      )}

      {txHash && (
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
          <p className="text-sm font-mono text-gray-700 break-all">{txHash}</p>
        </div>
      )}
    </div>
  );
}
