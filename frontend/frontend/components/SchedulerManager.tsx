import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "./ui/use-toast";
import {
  createPaymentSchedule,
  updateScheduleAmount,
  deactivateSchedule,
  getTotalSchedulesCount,
  getDuePaymentsCount,
  initializeScheduler,
  executeDuePayments,
  getPaymentSchedule,
  isCompanyRegistered,
} from "@/utils/payroll";
import { listCompanyEmployees, getEmployeeSalary } from "@/utils/payroll";

export function SchedulerManager() {
  const { account, signAndSubmitTransaction } = useWallet();
  const walletLike: any = { account, signAndSubmitTransaction };

  const [employeeAddress, setEmployeeAddress] = useState("");
  const [paymentType, setPaymentType] = useState<number>(-1); // -1 (placeholder), 0 Salary, 1 Bonus, 2 Overtime
  const [frequency, setFrequency] = useState<number>(604800); // weekly default (in seconds)
  const [amount, setAmount] = useState<string>(""); // APT
  const [startDateIso, setStartDateIso] = useState<string>(() => {
    const now = new Date(Date.now() + 5 * 60 * 1000); // +5min
    const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    return iso; // YYYY-MM-DDTHH:MM (local)
  });

  const [scheduleIdStr, setScheduleIdStr] = useState<string>("");
  const [newAmount, setNewAmount] = useState<string>(""); // APT
  const [viewScheduleIdStr, setViewScheduleIdStr] = useState<string>("");
  const [viewData, setViewData] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<{ total: number; due: number }>({ total: 0, due: 0 });
  const [initLoading, setInitLoading] = useState(false);
  const [execLoading, setExecLoading] = useState(false);
  const [registered, setRegistered] = useState<boolean>(false);
  const [regLoading, setRegLoading] = useState<boolean>(false);
  const [empLoading, setEmpLoading] = useState<boolean>(false);
  const [employees, setEmployees] = useState<{ address: string; label: string }[]>([]);
  const [amountLocked, setAmountLocked] = useState<boolean>(false);
  const [autoFillLoading, setAutoFillLoading] = useState<boolean>(false);

  async function refreshCounts() {
    if (!account?.address) return;
    try {
      const total = await getTotalSchedulesCount(String(account.address));
      const due = await getDuePaymentsCount(String(account.address));
      setTotals({ total: Number(total ?? 0), due: Number(due ?? 0) });
    } catch {
      setTotals({ total: 0, due: 0 });
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        setRegLoading(true);
        const addr = (account?.address as any)?.toString?.() ?? (account?.address ? String(account.address) : "");
        if (!addr) { if (!cancelled) { setRegistered(false); setTotals({ total: 0, due: 0 }); } return; }
        const reg = await isCompanyRegistered(addr);
        if (!cancelled) setRegistered(!!reg);
        await refreshCounts();
        // load employees for dropdown
        setEmpLoading(true);
        try {
          let list = await listCompanyEmployees(addr, true);
          if (!list?.length) list = await listCompanyEmployees(addr, false).catch(() => []);
          const opts = (list || []).map((e: any) => {
            const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
            return { address: e.address, label: name || e.address };
          });
          if (!cancelled) setEmployees(opts);
        } finally {
          if (!cancelled) setEmpLoading(false);
        }
      } finally {
        if (!cancelled) setRegLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address]);

  // Auto-fill amount when Salary + Monthly + employee selected
  useEffect(() => {
    let cancelled = false;
    async function maybeAutofill() {
      try {
        const isSalary = paymentType === 0;
        const isMonthly = frequency === 2592000; // ~30d
        const canAutofill = isSalary && isMonthly && !!employeeAddress;
        setAmountLocked(canAutofill);
        if (!canAutofill) return;
        setAutoFillLoading(true);
        const octas = await getEmployeeSalary(employeeAddress).catch(() => 0);
        const apt = Number(octas || 0) / 1e8;
        if (!cancelled) setAmount(apt > 0 ? String(apt) : "");
      } catch {
        if (!cancelled) setAmount("");
      } finally {
        if (!cancelled) setAutoFillLoading(false);
      }
    }
    maybeAutofill();
    return () => { cancelled = true; };
  }, [employeeAddress, paymentType, frequency]);

  async function onInitializeScheduler() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!registered) return toast({ title: "Register company first", description: "Go to Settings → Company Registration", variant: "destructive" });
    setInitLoading(true);
    try {
      await initializeScheduler({ account, signAndSubmitTransaction } as any);
      toast({ title: "Scheduler initialized" });
      await refreshCounts();
    } catch (e: any) {
      toast({ title: "Failed to initialize", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setInitLoading(false);
    }
  }

  async function onExecuteDue() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!registered) return toast({ title: "Register company first", description: "Go to Settings → Company Registration", variant: "destructive" });
    setExecLoading(true);
    try {
      await executeDuePayments({ account, signAndSubmitTransaction } as any);
      toast({ title: "Executed due payments" });
      await refreshCounts();
    } catch (e: any) {
      toast({ title: "Failed to execute", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setExecLoading(false);
    }
  }

  async function onCreate() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!registered) return toast({ title: "Register company first", description: "Go to Settings → Company Registration", variant: "destructive" });
    if (!employeeAddress) return toast({ title: "Employee required", description: "Select an employee from the list", variant: "destructive" });
    // Ensure auto-filled amount is present before proceeding
    const wantAutofill = paymentType === 0 && frequency === 2592000 && !!employeeAddress;
    if (wantAutofill && (!amount || Number(amount) <= 0)) {
      try {
        setAutoFillLoading(true);
        const octas = await getEmployeeSalary(employeeAddress).catch(() => 0);
        const apt = Number(octas || 0) / 1e8;
        setAmount(apt > 0 ? String(apt) : "");
      } finally {
        setAutoFillLoading(false);
      }
    }
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) return toast({ title: "Amount (APT) must be > 0", variant: "destructive" });
    if (paymentType < 0 || paymentType > 2) return toast({ title: "Select a payment type", variant: "destructive" });
    if (!frequency || frequency <= 0) return toast({ title: "Frequency must be > 0 seconds", variant: "destructive" });
    const startEpoch = Math.floor(new Date(startDateIso).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    if (!startEpoch || startEpoch <= now) return toast({ title: "Start date must be in the future", description: "Pick a future date/time", variant: "destructive" });
    setLoading(true);
    try {
      const octas = Math.round(amountNum * 1e8);
      await createPaymentSchedule(walletLike, employeeAddress, paymentType, frequency, octas, startEpoch);
      toast({ title: "Payment schedule created", description: `${amountNum} APT per run` });
      await refreshCounts();
    } catch (e: any) {
      toast({ title: "Failed to create schedule", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function onUpdateAmount() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!registered) return toast({ title: "Register company first", description: "Go to Settings → Company Registration", variant: "destructive" });
    const scheduleId = Number(scheduleIdStr);
    if (!scheduleId) return toast({ title: "Schedule ID required", variant: "destructive" });
    const newAmtNum = Number(newAmount);
    if (!newAmtNum || newAmtNum <= 0) return toast({ title: "New amount (APT) must be > 0", variant: "destructive" });
    setLoading(true);
    try {
      const octas = Math.round(newAmtNum * 1e8);
      await updateScheduleAmount(walletLike, scheduleId, octas);
      toast({ title: "Schedule amount updated", description: `${newAmtNum} APT` });
    } catch (e: any) {
      toast({ title: "Failed to update amount", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function onDeactivate() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!registered) return toast({ title: "Register company first", description: "Go to Settings → Company Registration", variant: "destructive" });
    const scheduleId = Number(scheduleIdStr);
    if (!scheduleId) return toast({ title: "Schedule ID required", variant: "destructive" });
    setLoading(true);
    try {
      await deactivateSchedule(walletLike, scheduleId);
      toast({ title: "Schedule deactivated" });
      await refreshCounts();
    } catch (e: any) {
      toast({ title: "Failed to deactivate", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {!registered && (
        <div className="p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
          Company not registered. Please register your company in Settings → Company Registration to use scheduler features.
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Create Payment Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Employee</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 border rounded-md h-10 px-3 bg-white text-gray-900"
                  value={employeeAddress}
                  onChange={(e) => setEmployeeAddress(e.target.value)}
                  disabled={!registered || regLoading || empLoading}
                >
                  <option value="">Select employee</option>
                  {employees.map((e) => (
                    <option key={e.address} value={e.address}>{e.label}</option>
                  ))}
                </select>
                <Button variant="outline" onClick={async () => {
                  if (!account?.address) return;
                  setEmpLoading(true);
                  try {
                    let list = await listCompanyEmployees(String(account.address), true);
                    if (!list?.length) list = await listCompanyEmployees(String(account.address), false).catch(() => []);
                    const opts = (list || []).map((e: any) => {
                      const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
                      return { address: e.address, label: name || e.address };
                    });
                    setEmployees(opts);
                  } finally { setEmpLoading(false); }
                }} disabled={!registered || regLoading || empLoading}>{empLoading ? 'Refreshing…' : 'Refresh'}</Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Select the employee to create a schedule for.</p>
            </div>
            <select
              className="w-full border rounded-md h-10 px-3 bg-white text-gray-900"
              value={paymentType}
              onChange={(e) => setPaymentType(Number(e.target.value))}
              disabled={!registered || regLoading}
            >
              <option value={-1}>Select payment type</option>
              <option value={0}>Salary</option>
              <option value={1}>Bonus</option>
              <option value={2}>Overtime</option>
            </select>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Payment Frequency</label>
              <select
                className="w-full border rounded-md h-10 px-3 bg-white text-gray-900"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                disabled={!registered || regLoading}
              >
                <option value={604800}>Weekly</option>
                <option value={1209600}>Bi-weekly</option>
                <option value={2592000}>Monthly (~30d)</option>
              </select>
            </div>
            <div>
              <Input type="number" inputMode="decimal" step="0.00000001" placeholder="Amount (APT, e.g. 2.5)" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={!registered || regLoading || amountLocked} />
              <p className="text-xs text-gray-500 mt-1">
                {amountLocked ? 'Auto-filled from employee monthly salary (APT).' : 'Enter amount in APT. It will be converted to Octas on-chain.'}
              </p>
            </div>
            <div>
              <Input type="datetime-local" value={startDateIso} onChange={(e) => setStartDateIso(e.target.value)} disabled={!registered || regLoading} />
              <p className="text-xs text-gray-500 mt-1">Start date/time in your local timezone.</p>
            </div>
          </div>
          <div className="flex justify-start">
            <Button onClick={onCreate} disabled={loading || !registered || regLoading || (amountLocked && (autoFillLoading || !amount || Number(amount) <= 0))}>
              {autoFillLoading ? 'Fetching salary…' : 'Create Schedule'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Input type="number" placeholder="Schedule ID (numeric)" value={scheduleIdStr} onChange={(e) => setScheduleIdStr(e.target.value)} disabled={!registered || regLoading} />
              <p className="text-xs text-gray-500 mt-1">Enter the schedule ID you want to modify.</p>
            </div>
            <div>
              <Input type="number" inputMode="decimal" step="0.00000001" placeholder="New amount (APT, e.g. 2.5)" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} disabled={!registered || regLoading} />
              <p className="text-xs text-gray-500 mt-1">Amount is in APT. It will be converted to Octas on-chain.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onUpdateAmount} disabled={loading || !registered || regLoading}>Update Amount</Button>
            <Button variant="destructive" onClick={onDeactivate} disabled={loading || !registered || regLoading}>Deactivate</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>View Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Input type="number" placeholder="Schedule ID to view (numeric)" value={viewScheduleIdStr} onChange={(e) => setViewScheduleIdStr(e.target.value)} disabled={!registered || regLoading} />
              <p className="text-xs text-gray-500 mt-1">Enter a schedule ID to fetch its details.</p>
            </div>
            <Button
              onClick={async () => {
                if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
                if (!registered) return toast({ title: "Register company first", description: "Go to Settings → Company Registration", variant: "destructive" });
                const viewScheduleId = Number(viewScheduleIdStr);
                if (!viewScheduleId) return toast({ title: "Enter a schedule ID", variant: "destructive" });
                try {
                  const res = await getPaymentSchedule(String(account.address), Number(viewScheduleId));
                  setViewData(res);
                } catch (e: any) {
                  setViewData(null);
                  toast({ title: "Failed to fetch schedule", description: e?.message ?? String(e), variant: "destructive" });
                }
              }}
              disabled={!registered || regLoading}
            >
              Fetch
            </Button>
            <Button variant="outline" onClick={() => setViewData(null)} disabled={regLoading}>Clear</Button>
          </div>
          {viewData && (
            <div className="space-y-2">
              {/* Best-effort formatted summary */}
              <div className="p-3 rounded bg-gray-50 text-sm">
                <div className="font-medium mb-1">Schedule Summary (best-effort)</div>
                {(() => {
                  try {
                    const d: any = Array.isArray(viewData) ? viewData : (viewData as any);
                    // Try to discover fields heuristically
                    const amountOctas = Number(d.amount ?? d[3] ?? d.payment_amount ?? 0);
                    const amountApt = amountOctas ? (amountOctas/1e8).toFixed(4) : undefined;
                    const freqSec = Number(d.frequency ?? d[2] ?? d.interval_seconds ?? 0);
                    const startSec = Number(d.start_date ?? d[4] ?? d.start ?? 0);
                    const active = (typeof d.active === 'boolean') ? d.active : (typeof d[5] === 'boolean' ? d[5] : undefined);
                    const rows: string[] = [];
                    if (amountApt) rows.push(`Amount per run: ${amountApt} APT`);
                    if (freqSec) rows.push(`Interval: ${freqSec} seconds${freqSec===604800?' (Weekly)':freqSec===1209600?' (Bi-weekly)':freqSec===2592000?' (Monthly ~30d)':''}`);
                    if (startSec) rows.push(`Start: ${new Date(startSec*1000).toLocaleString()}`);
                    if (typeof active === 'boolean') rows.push(`Active: ${active ? 'Yes' : 'No'}`);
                    return rows.length ? (
                      <ul className="list-disc pl-5">
                        {rows.map((r, i) => (<li key={i}>{r}</li>))}
                      </ul>
                    ) : (<div className="text-gray-500">Could not auto-detect fields from schedule payload.</div>);
                  } catch {
                    return (<div className="text-gray-500">Could not parse schedule payload.</div>);
                  }
                })()}
              </div>
              <div className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-60">
                <div className="mb-2 font-medium">Raw schedule data</div>
                <pre>{JSON.stringify(viewData, null, 2)}</pre>
                <p className="text-[10px] text-gray-500 mt-2">Note: Raw data is shown for transparency; UI formatting will be refined as schema stabilizes.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduler Status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Total Schedules</div>
            <div className="font-medium">{totals.total}</div>
          </div>
          <div>
            <div className="text-gray-500">Due Payments</div>
            <div className="font-medium">{totals.due}</div>
          </div>
          <div className="col-span-2 flex gap-3 mt-2">
            <Button variant="outline" onClick={onInitializeScheduler} disabled={initLoading}>Initialize Scheduler</Button>
            <Button onClick={onExecuteDue} disabled={execLoading}>Execute Due Payments</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
