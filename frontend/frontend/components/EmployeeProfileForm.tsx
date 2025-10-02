import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import {
  createEmployeeProfile,
  updateEmployeeSalary,
  deactivateEmployee,
  getCompanyEmployeeCount,
} from "@/utils/payroll";
import { upsertEmployee } from "@/lib/employeeCache";
import { isCompanyRegistered } from "@/utils/payroll";
import { getSupportedJurisdictions } from "@/utils/payroll";

type EmployeeProfileFormProps = { onCreated?: () => void };

export function EmployeeProfileForm({ onCreated }: EmployeeProfileFormProps) {
  const { account, signAndSubmitTransaction } = useWallet();
  const walletLike: any = { account, signAndSubmitTransaction };

  const [employeeAddress, setEmployeeAddress] = useState("");
  const [employeeId, setEmployeeId] = useState<number>(Math.floor(Date.now() / 1000));
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<number>(0);
  const [department, setDepartment] = useState("");
  // Keep salary (APT) as a string so the input can be blank and not forced to 0
  const [salary, setSalary] = useState<string>("");
  const [managerAddress, setManagerAddress] = useState("");
  const [taxJurisdiction, setTaxJurisdiction] = useState("");
  const [paymentAddress, setPaymentAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [jurisdictions, setJurisdictions] = useState<string[]>([]);
  const [jurisLoading, setJurisLoading] = useState(false);
  const [registered, setRegistered] = useState<boolean>(false);
  const [regLoading, setRegLoading] = useState<boolean>(false);

  // Autofill defaults
  React.useEffect(() => {
    async function init() {
      if (account?.address && !managerAddress) {
        setManagerAddress(String(account.address));
      }
      // Check company registration
      try {
        setRegLoading(true);
        const addr = (account?.address as any)?.toString?.() ?? (account?.address ? String(account.address) : "");
        if (addr) {
          const reg = await isCompanyRegistered(addr);
          setRegistered(!!reg);
        } else {
          setRegistered(false);
        }
      } finally {
        setRegLoading(false);
      }
      // Derive sequential employee ID = current count + 1
      if (account?.address) {
        try {
          const count = await getCompanyEmployeeCount(String(account.address));
          const nextId = Number(count ?? 0) + 1;
          setEmployeeId(nextId < 1 ? 1 : nextId);
        } catch {
          setEmployeeId(1);
        }
      } else {
        setEmployeeId(1);
      }
      // Load supported jurisdictions from contract; fallback to sensible defaults if none
      try {
        if (account?.address) {
          setJurisLoading(true);
          const list = await getSupportedJurisdictions(String(account.address));
          const arr = Array.isArray(list) ? list.map((v: any) => String(v)) : [];
          const unique = Array.from(new Set(arr.filter(Boolean)));
          const fallback = ["US_FED", "US_CA", "US_NY"]; // defaults per Move initialization
          const options = unique.length > 0 ? unique : fallback;
          setJurisdictions(options);
          // If current selection is empty or not in options, set first option as default
          if (!taxJurisdiction || !options.includes(taxJurisdiction)) {
            setTaxJurisdiction(options[0] || "");
          }
        } else {
          setJurisdictions(["US_FED", "US_CA", "US_NY"]);
        }
      } catch {
        const fallback = ["US_FED", "US_CA", "US_NY"];
        setJurisdictions(fallback);
        if (!taxJurisdiction) setTaxJurisdiction(fallback[0]);
      } finally {
        setJurisLoading(false);
      }
    }
    init();
  }, [account?.address]);

  async function onCreateProfile() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!registered) return toast({ title: "Register company first", description: "Go to Settings → Company Registration", variant: "destructive" });
    if (!employeeAddress) return toast({ title: "Employee address required", variant: "destructive" });
    const parsedApt = Number(salary);
    if (!parsedApt || parsedApt <= 0) return toast({ title: "Monthly salary (APT) must be > 0", variant: "destructive" });
    const monthlyOctas = Math.round(parsedApt * 1e8);
    setLoading(true);
    try {
      await createEmployeeProfile(
        walletLike,
        employeeAddress,
        employeeId,
        firstName,
        lastName,
        email,
        role,
        department,
        monthlyOctas,
        managerAddress || String(account.address),
        taxJurisdiction,
        paymentAddress || employeeAddress
      );
      // Cache display data for the employee list UI
      upsertEmployee({
        address: employeeAddress,
        firstName,
        lastName,
        department,
        email,
        monthlySalary: parsedApt, // store APT for display
        roleCode: role,
      });
      toast({ title: "Employee profile created (event emitted)" });
      onCreated?.();
    } catch (e: any) {
      const msg = e?.message || e?.vm_status || String(e);
      toast({ title: "Failed to create employee profile", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function onUpdateSalary() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!employeeAddress) return toast({ title: "Employee address required", variant: "destructive" });
    const parsedApt = Number(salary);
    if (!parsedApt || parsedApt <= 0) return toast({ title: "Monthly salary (APT) must be > 0", variant: "destructive" });
    const monthlyOctas = Math.round(parsedApt * 1e8);
    setLoading(true);
    try {
      await updateEmployeeSalary(walletLike, employeeAddress, monthlyOctas);
      toast({ title: "Salary update attempted", description: `${parsedApt} APT / month` });
    } catch (e: any) {
      toast({ title: "Failed to update salary", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function onDeactivate() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!employeeAddress) return toast({ title: "Employee address required", variant: "destructive" });
    setLoading(true);
    try {
      await deactivateEmployee(walletLike, employeeAddress);
      toast({ title: "Deactivate employee attempted" });
    } catch (e: any) {
      toast({ title: "Failed to deactivate", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {!registered && (
        <div className="p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm mb-2">
          Company not registered. Please register your company in Settings → Company Registration to create employee profiles.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Employee Address *</label>
          <Input placeholder="0x... employee address" value={employeeAddress} onChange={(e) => setEmployeeAddress(e.target.value)} disabled={!registered || regLoading} />
          <p className="text-xs text-gray-500 mt-1">Recipient address for payroll and the employee identity key.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Employee ID</label>
          <Input type="number" value={employeeId} disabled readOnly />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">First Name *</label>
          <Input placeholder="Deborah" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!registered || regLoading} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <Input placeholder="Martins" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!registered || regLoading} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <Input placeholder="gboigwe@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!registered || regLoading} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role *</label>
          <select
            className="w-full border rounded-md h-10 px-3 bg-white text-gray-900"
            value={role}
            onChange={(e) => setRole(Number(e.target.value))}
            disabled={!registered || regLoading}
          >
            <option value={0}>Employee</option>
            <option value={1}>Manager</option>
            <option value={2}>HR</option>
            <option value={3}>Accountant</option>
            <option value={4}>Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Department *</label>
          <Input placeholder="Engineering" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={!registered || regLoading} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Monthly Salary (APT) *</label>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            step={0.00000001}
            placeholder="e.g. 2.5 (APT per month)"
            value={salary}
            onChange={(e) => {
              const v = e.target.value;
              // allow empty to let user clear; otherwise accept only digits
              if (v === "") return setSalary("");
              // allow decimals up to 8 places
              const cleaned = v.replace(/[^0-9.]/g, "");
              setSalary(cleaned);
            }}
            disabled={!registered || regLoading}
          />
          <p className="text-xs text-gray-500 mt-1">Enter salary in APT. It will be converted to Octas when submitting to the contract.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Manager Address</label>
          <Input placeholder="defaults to your wallet address" value={managerAddress} disabled readOnly />
          <p className="text-xs text-gray-500 mt-1">Derived from your connected wallet.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tax Jurisdiction *</label>
          <select
            className="w-full border rounded-md h-10 px-3 bg-white text-gray-900"
            value={taxJurisdiction}
            onChange={(e) => setTaxJurisdiction(e.target.value)}
            disabled={jurisLoading || !registered || regLoading}
          >
            {jurisdictions.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Select a jurisdiction configured in your company tax settings.</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Payment Address</label>
          <Input placeholder="defaults to Employee Address" value={paymentAddress} onChange={(e) => setPaymentAddress(e.target.value)} disabled={!registered || regLoading} />
        </div>
      </div>
      <div className="flex gap-3">
        <Button onClick={onCreateProfile} disabled={loading || !registered || regLoading}>Create Profile</Button>
        <Button variant="outline" onClick={onUpdateSalary} disabled={loading || !registered || regLoading}>Update Salary</Button>
        <Button variant="destructive" onClick={onDeactivate} disabled={loading || !registered || regLoading}>Deactivate</Button>
      </div>
      <p className="text-xs text-gray-500">Note: Current on-chain deployment emits events and updates registry count, but does not store full profiles; reads/updates may fail.</p>
    </div>
  );
}
