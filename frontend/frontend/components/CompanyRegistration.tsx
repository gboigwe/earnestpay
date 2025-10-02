import React, { useEffect, useState } from "react";
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
      toast({ title: "Company registered", description: `Tx: ${tx.hash.slice(0, 10)}...` });
      setAlreadyRegistered(true);
    } catch (e: any) {
      console.error(e);
      const msg = e?.message ?? String(e);
      toast({ title: "Registration failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Company Name</label>
        <Input
          placeholder="e.g. EarnestPay"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </div>
      <Button onClick={onRegister} disabled={submitting || alreadyRegistered === true} className="w-full">
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
