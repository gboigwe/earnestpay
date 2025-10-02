import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { fundTreasuryWithWalletTransfer, addEmployee, processPayment } from "@/utils/payroll";
import { listCompanyEmployees } from "@/utils/payroll";
import { listEmployees as listCachedEmployees } from "@/lib/employeeCache";
import { useCompanyRegistration } from "@/hooks/useCompanyRegistration";

export function CompanyOps() {
  const { account, signAndSubmitTransaction } = useWallet();
  const walletLike: any = { account, signAndSubmitTransaction };

  const [fundAmount, setFundAmount] = useState<string>("");
  const [newEmployee, setNewEmployee] = useState<string>("");
  const [payEmployee, setPayEmployee] = useState<string>("");
  const [payAmount, setPayAmount] = useState<string>("");

  const [loading, setLoading] = useState<{ fund?: boolean; add?: boolean; pay?: boolean }>({});
  const [employees, setEmployees] = useState<{ address: string; label: string }[]>([]);
  const companyAddress = (account?.address as any)?.toString?.() ?? (account?.address ? String(account.address) : "");
  const { registered, loading: regLoading, refresh: refreshRegistration } = useCompanyRegistration(companyAddress);

  function shortAddress(addr: string) {
    const a = (addr || "").toString();
    if (!a.startsWith("0x") || a.length < 14) return a;
    return `${a.slice(0, 6)}...${a.slice(-4)}`;
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const company = (account?.address as any)?.toString?.() ?? (account?.address ? String(account.address) : "");
        if (!company) { if (!cancelled) { setEmployees([]); } return; }
        // Ensure registration state is up-to-date
        await refreshRegistration(company);
        let list = await listCompanyEmployees(company, true);
        let merged = (list || []).slice();
        if (!merged.length) {
          // Retry including inactive/unprofiled employees
          list = await listCompanyEmployees(company, false).catch(() => []);
          merged = (list || []).slice();
        }
        // Fallback to cached employees if on-chain list is empty
        if (!merged.length) {
          try {
            const cached = listCachedEmployees();
            merged = (cached || []).map((c: any) => ({ address: c.address, firstName: c.firstName, lastName: c.lastName }));
          } catch {}
        }
        const opts = (merged || []).map((e: any) => {
          const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
          const label = name || shortAddress(e.address);
          return { address: e.address, label };
        });
        if (!cancelled) setEmployees(opts);
      } catch {
        if (!cancelled) { setEmployees([]); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [account?.address]);

  async function onFund() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!registered) return toast({ title: "Register company first", description: "Go to Settings → Company Registration", variant: "destructive" });
    const amt = Number(fundAmount);
    if (!amt || amt <= 0) return toast({ title: "Enter a positive amount", variant: "destructive" });
    setLoading((s) => ({ ...s, fund: true }));
    try {
      const res = await fundTreasuryWithWalletTransfer(walletLike, amt);
      toast({ title: "Treasury funded", description: `${amt} APT sent. Tx: ${res.transferHash?.slice?.(0,10) ?? ''}...` });
      setFundAmount("");
    } catch (e: any) {
      toast({ title: "Failed to fund treasury", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading((s) => ({ ...s, fund: false }));
    }
  }

  async function onAddEmployee() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!newEmployee) return toast({ title: "Enter employee address", variant: "destructive" });
    setLoading((s) => ({ ...s, add: true }));
    try {
      await addEmployee(walletLike, newEmployee);
      toast({ title: "Employee added" });
      setNewEmployee("");
    } catch (e: any) {
      toast({ title: "Failed to add employee", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading((s) => ({ ...s, add: false }));
    }
  }

  async function onProcessPayment() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!payEmployee) return toast({ title: "Enter employee address", variant: "destructive" });
    const apt = Number(payAmount);
    if (!apt || apt <= 0) return toast({ title: "Enter a positive amount (APT)", variant: "destructive" });
    const octas = Math.round(apt * 1e8);
    setLoading((s) => ({ ...s, pay: true }));
    try {
      await processPayment(walletLike, payEmployee, octas);
      toast({ title: "Payment processed", description: `${apt} APT sent` });
      setPayEmployee("");
      setPayAmount("");
    } catch (e: any) {
      toast({ title: "Failed to process payment", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading((s) => ({ ...s, pay: false }));
    }
  }

  return (
    <div className="space-y-6">
      {!registered && (
        <div className="p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
          Company not registered. Please register your company in Settings → Company Registration to use these actions.
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Fund Treasury</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Input type="number" placeholder="Amount (APT, e.g. 0.01)" step="0.00000001" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} disabled={!registered || regLoading} />
          <Button onClick={onFund} disabled={!!loading.fund || !registered || regLoading}>Fund</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Employee (payroll_manager)</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">{employees.length ? 'Select employee to add' : 'Enter employee address to add'}</label>
            {employees.length ? (
              <select
                className="w-full border rounded-md h-10 px-3 bg-white text-gray-900"
                value={newEmployee}
                onChange={(e) => setNewEmployee(e.target.value)}
                disabled={!registered || regLoading}
              >
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.address} value={e.address}>{e.label}</option>
                ))}
              </select>
            ) : (
              <Input placeholder="0x... employee address" value={newEmployee} onChange={(e) => setNewEmployee(e.target.value)} disabled={!registered || regLoading} />
            )}
          </div>
          <Button variant="outline" onClick={onAddEmployee} disabled={!!loading.add || !registered || regLoading}>Add</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Process Payment (one-off)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{employees.length ? 'Select employee' : 'Enter employee address'}</label>
            {employees.length ? (
              <select
                className="w-full border rounded-md h-10 px-3 bg-white text-gray-900"
                value={payEmployee}
                onChange={(e) => setPayEmployee(e.target.value)}
                disabled={!registered || regLoading}
              >
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.address} value={e.address}>{e.label}</option>
                ))}
              </select>
            ) : (
              <Input placeholder="0x... employee address" value={payEmployee} onChange={(e) => setPayEmployee(e.target.value)} disabled={!registered || regLoading} />
            )}
          </div>
          <Input type="number" placeholder="Amount (APT, e.g. 0.05)" step="0.00000001" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} disabled={!registered || regLoading} />
          <Button onClick={onProcessPayment} disabled={!!loading.pay || !registered || regLoading}>Process</Button>
        </CardContent>
      </Card>
    </div>
  );
}
