import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import { ConfirmationDialog } from "./ui/confirmation-dialog";
import { EmptyState } from "./ui/empty-state";
import { Users } from "lucide-react";
import { listCompanyEmployees, getEmployeeSalary, processPayment, getTreasuryBalance, getPaymentScheduleCreatedEvents, getPaymentScheduleUpdatedEvents, getPaymentScheduleDeactivatedEvents, getPaymentProcessedEvents, getEmployeeRole } from "@/utils/payroll";
import { listEmployees as listCachedEmployees } from "@/lib/employeeCache";
import { useCompanyRegistration } from "@/hooks/useCompanyRegistration";

export function ProcessPayroll() {
  const { account, signAndSubmitTransaction } = useWallet();
  const walletLike: any = { account, signAndSubmitTransaction };
  const companyAddress = (account?.address as any)?.toString?.() ?? (account?.address ? String(account.address) : "");
  const { registered, loading: regLoading, refresh } = useCompanyRegistration(companyAddress);

  const [employees, setEmployees] = useState<{ address: string; label: string }[]>([]);
  const [employee, setEmployee] = useState("");
  const [amountAPT, setAmountAPT] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<{ addr: string; ok: boolean; msg: string }[]>([]);
  const [salaries, setSalaries] = useState<Record<string, number>>({}); // octas
  const [treasuryOctas, setTreasuryOctas] = useState<number>(0);
  const [useScheduled, setUseScheduled] = useState<boolean>(false);
  const [empLoading, setEmpLoading] = useState<boolean>(false);
  const [salLoading, setSalLoading] = useState<boolean>(false);
  const [empRefreshTick, setEmpRefreshTick] = useState<number>(0);
  const [salRefreshTick, setSalRefreshTick] = useState<number>(0);
  const [events, setEvents] = useState<{ addr: string; amountOctas: number; tsMicros?: string; label?: string; version?: string }[]>([]);
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<number | null>(null);
  const canBatch = (userRole === 2 || userRole === 4); // HR=2, Admin=4
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    amount: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    amount: '',
    onConfirm: () => {}
  });

  function shortAddress(addr: string) {
    const a = (addr || "").toString();
    if (!a.startsWith("0x") || a.length < 14) return a;
    return `${a.slice(0, 6)}...${a.slice(-4)}`;
  }

  function toggleOne(addr: string, val?: boolean) {
    setSelected((prev) => ({ ...prev, [addr]: typeof val === 'boolean' ? val : !prev[addr] }));
  }

  function toggleAll(val: boolean) {
    const m: Record<string, boolean> = {};
    for (const e of employees) m[e.address] = val;
    setSelected(m);
  }

  async function onProcessSelected() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!registered) return toast({ title: "Register company first", description: "Go to Settings → Company Registration", variant: "destructive" });
    if (!canBatch) return toast({ title: "Insufficient role", description: "Only HR or Admin can run batch", variant: "destructive" });
    const chosen = employees.filter((e) => selected[e.address]).map((e) => e.address);
    if (chosen.length === 0) return toast({ title: "Select at least one employee", variant: "destructive" });
    await processBatch(chosen);
  }

  async function onProcessAll() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!registered) return toast({ title: "Register company first", description: "Go to Settings → Company Registration", variant: "destructive" });
    if (!canBatch) return toast({ title: "Insufficient role", description: "Only HR or Admin can run batch", variant: "destructive" });
    const all = employees.map((e) => e.address);
    if (all.length === 0) return toast({ title: "No employees to process", variant: "destructive" });
    await processBatch(all);
  }

  async function processBatch(addresses: string[]) {
    setBatchProcessing(true);
    setResults([]);
    try {
      for (const addr of addresses) {
        try {
          let octas = 0;
          if (useScheduled) {
            // Use precomputed totals if available
            octas = Number(salaries[addr] || 0);
          } else {
            const sal = await getEmployeeSalary(addr);
            octas = Number(sal ?? 0);
          }
          if (!octas || octas <= 0) {
            setResults((r) => [...r, { addr, ok: false, msg: 'No salary set' }]);
            continue;
          }
          await processPayment(walletLike, addr, octas);
          const apt = (octas / 1e8).toFixed(2);
          setResults((r) => [...r, { addr, ok: true, msg: `${apt} APT sent` }]);
        } catch (e: any) {
          setResults((r) => [...r, { addr, ok: false, msg: e?.message ?? String(e) }]);
        }
      }
      toast({ title: 'Batch payroll complete', description: `${addresses.length} employee(s) processed` });
    } finally {
      setBatchProcessing(false);
    }
  }

  function retryFailedOnly() {
    const failed = results.filter(r => !r.ok).map(r => r.addr);
    if (failed.length === 0) return toast({ title: 'No failures to retry' });
    if (!canBatch) return toast({ title: "Insufficient role", description: "Only HR or Admin can run batch", variant: "destructive" });
    processBatch(failed);
  }

  function downloadCsv() {
    const lines: string[] = [];
    lines.push(['employee_address','employee_label','status','message','amount_apt','mode'].join(','));
    for (const r of results) {
      const label = employees.find(e => e.address === r.addr)?.label || '';
      const status = r.ok ? 'success' : 'failed';
      const amtApt = ((salaries[r.addr]||0)/1e8).toFixed(8);
      const mode = useScheduled ? 'scheduled' : 'salary';
      const row = [r.addr, label.replace(/,/g,' '), status, (r.msg || '').replace(/,/g,' '), amtApt, mode].join(',');
      lines.push(row);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_batch_results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setEmpLoading(true);
        await refresh(companyAddress);
        if (!companyAddress) { if (!cancelled) setEmployees([]); return; }
        let list = await listCompanyEmployees(companyAddress, true);
        if (!list?.length) {
          // Retry including inactive/unprofiled
          list = await listCompanyEmployees(companyAddress, false).catch(() => []);
        }
        // Fallback: merge cached employees if still empty
        if (!list?.length) {
          try {
            const cached = listCachedEmployees(companyAddress);
            list = (cached || []).map((c: any) => ({ address: c.address, firstName: c.firstName, lastName: c.lastName }));
          } catch {}
        }
        const opts = (list || []).map((e) => {
          const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
          const label = name || shortAddress(e.address);
          return { address: e.address, label };
        });
        if (!cancelled) {
          setEmployees(opts);
          // Initialize selection map (default unselected)
          const m: Record<string, boolean> = {};
          for (const o of opts) m[o.address] = false;
          setSelected(m);
        }
      } catch {
        if (!cancelled) setEmployees([]);
      } finally {
        if (!cancelled) setEmpLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [companyAddress, empRefreshTick]);

  // Load user role for batch permission
  useEffect(() => {
    let cancelled = false;
    async function loadRole() {
      try {
        if (!account?.address) { if (!cancelled) setUserRole(null); return; }
        const role = await getEmployeeRole(String(account.address)).catch(() => null);
        if (!cancelled) setUserRole(role as any);
      } catch {
        if (!cancelled) setUserRole(null);
      }
    }
    loadRole();
  }, [account?.address]);

  useEffect(() => {
    let cancelled = false;
    async function presetAmount() {
      if (!companyAddress || !employee) return;
      try {
        const sal = await getEmployeeSalary(employee);
        const apt = Number(sal ?? 0) / 1e8;
        if (!cancelled && apt > 0) setAmountAPT(String(apt));
      } catch {
        // ignore
      }
    }
    presetAmount();
    return () => { cancelled = true; };
  }, [companyAddress, employee]);

  // Fetch and cache all salaries for preview and totals
  useEffect(() => {
    let cancelled = false;
    async function loadSalaries() {
      if (!registered || employees.length === 0) { if (!cancelled) setSalaries({}); return; }
      setSalLoading(true);
      if (useScheduled) {
        // Best-effort: reconstruct scheduled amounts from scheduler events
        try {
          const created = await getPaymentScheduleCreatedEvents(companyAddress, 200).catch(() => []);
          const updated = await getPaymentScheduleUpdatedEvents(companyAddress, 200).catch(() => []);
          const deactivated = await getPaymentScheduleDeactivatedEvents(companyAddress, 200).catch(() => []);
          // Build schedule states
          const bySchedule: Record<string, { employee: string; amount: number; active: boolean }> = {};
          for (const { event } of (created as any[])) {
            const d = (event?.data) || {};
            const sid = String(d.schedule_id ?? d.id ?? d.schedule ?? "");
            const emp = String(d.employee ?? d.employee_address ?? "");
            const amt = Number(d.amount ?? 0);
            if (sid) bySchedule[sid] = { employee: emp, amount: amt, active: true };
          }
          for (const { event } of (updated as any[])) {
            const d = (event?.data) || {};
            const sid = String(d.schedule_id ?? d.id ?? d.schedule ?? "");
            const newAmt = Number(d.new_amount ?? d.amount ?? 0);
            if (sid && bySchedule[sid]) bySchedule[sid].amount = newAmt;
          }
          for (const { event } of (deactivated as any[])) {
            const d = (event?.data) || {};
            const sid = String(d.schedule_id ?? d.id ?? d.schedule ?? "");
            if (sid && bySchedule[sid]) bySchedule[sid].active = false;
          }
          // Sum active schedules per employee
          const totals: Record<string, number> = {};
          Object.values(bySchedule).forEach((s) => {
            if (!s.active || !s.employee) return;
            totals[s.employee] = (totals[s.employee] || 0) + (Number(s.amount) || 0);
          });
          // Ensure all employees present
          for (const e of employees) if (!(e.address in totals)) totals[e.address] = 0;
          if (!cancelled) setSalaries(totals);
        } catch {
          // Fallback to static salary if scheduler reconstruction fails
          const map: Record<string, number> = {};
          for (const e of employees) {
            try { const sal = await getEmployeeSalary(e.address); map[e.address] = Number(sal ?? 0); } catch { map[e.address] = 0; }
          }
          if (!cancelled) setSalaries(map);
        }
      } else {
        const map: Record<string, number> = {};
        const cachedEmployees = listCachedEmployees(companyAddress);
        for (const e of employees) {
          try {
            const sal = await getEmployeeSalary(e.address);
            const salOctas = Number(sal ?? 0);
            // If blockchain salary is 0, try to use cached salary as fallback
            if (salOctas === 0) {
              const cached = cachedEmployees.find((c) => c.address.toLowerCase() === e.address.toLowerCase());
              if (cached?.monthlySalary) {
                // Cached salary is in APT, convert to octas
                map[e.address] = Math.round(cached.monthlySalary * 1e8);
              } else {
                map[e.address] = 0;
              }
            } else {
              map[e.address] = salOctas;
            }
          } catch {
            // Try cached fallback on error too
            const cached = cachedEmployees.find((c) => c.address.toLowerCase() === e.address.toLowerCase());
            if (cached?.monthlySalary) {
              map[e.address] = Math.round(cached.monthlySalary * 1e8);
            } else {
              map[e.address] = 0;
            }
          }
        }
        if (!cancelled) setSalaries(map);
      }
      if (!cancelled) setSalLoading(false);
    }
    loadSalaries();
    return () => { cancelled = true; };
  }, [registered, employees, useScheduled, companyAddress, salRefreshTick]);

  // Load recent PaymentProcessed events for auditing
  useEffect(() => {
    let cancelled = false;
    async function loadEvents() {
      if (!registered || !companyAddress) { if (!cancelled) setEvents([]); return; }
      setEventsLoading(true);
      try {
        const pairs = await getPaymentProcessedEvents(companyAddress, 50);
        // pairs are { event, tx }, choose last 10 sorted by tx.version or timestamp descending
        const items = (pairs as any[]).map(({ event, tx }) => {
          const d = (event?.data) || {};
          const addr = String(d.employee ?? d.employee_address ?? '');
          const amountOctas = Number(d.amount ?? 0);
          const tsMicros = tx?.timestamp; // string microseconds
          const version = tx?.version;
          return { addr, amountOctas, tsMicros, version };
        }).filter(x => x.addr);
        items.sort((a,b) => Number(b.version||0) - Number(a.version||0));
        const top = items.slice(0, 10);
        // attach labels for UI
        const withLabels = top.map(it => ({ ...it, label: employees.find(e => e.address === it.addr)?.label }));
        if (!cancelled) setEvents(withLabels);
      } catch {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    }
    loadEvents();
    return () => { cancelled = true; };
  }, [registered, companyAddress, employees]);

  // Fetch treasury balance for preview
  useEffect(() => {
    let cancelled = false;
    async function loadTreasury() {
      try {
        if (!registered || !companyAddress) { if (!cancelled) setTreasuryOctas(0); return; }
        const bal = await getTreasuryBalance(companyAddress);
        if (!cancelled) setTreasuryOctas(Number(bal ?? 0));
      } catch {
        if (!cancelled) setTreasuryOctas(0);
      }
    }
    loadTreasury();
    return () => { cancelled = true; };
  }, [registered, companyAddress]);

  const totalSelectedOctas = Object.entries(selected).reduce((sum, [addr, on]) => sum + (on ? (salaries[addr] || 0) : 0), 0);
  const totalAllOctas = employees.reduce((sum, e) => sum + (salaries[e.address] || 0), 0);
  const totalSelectedAPT = (totalSelectedOctas / 1e8) || 0;
  const totalAllAPT = (totalAllOctas / 1e8) || 0;
  const treasuryAPT = (treasuryOctas / 1e8) || 0;
  const summary = {
    success: results.filter(r => r.ok).length,
    failed: results.filter(r => !r.ok).length,
  };

  const disabled = useMemo(() => !registered || regLoading || loading, [registered, regLoading, loading]);

  async function onProcess() {
    if (!account) return toast({ title: "Connect wallet", variant: "destructive" });
    if (!registered) return toast({ title: "Register company first", description: "Go to Settings → Company Registration", variant: "destructive" });
    if (!employee) return toast({ title: "Select an employee", variant: "destructive" });
    const apt = Number(amountAPT);
    if (!apt || apt <= 0) return toast({ title: "Enter a positive amount (APT)", variant: "destructive" });

    const employeeLabel = employees.find(e => e.address === employee)?.label || shortAddress(employee);

    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      title: 'Confirm Payment',
      description: `You are about to send a payment to ${employeeLabel}. This action cannot be undone.`,
      amount: `${apt} APT`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        const octas = Math.round(apt * 1e8);
        setLoading(true);
        try {
          await processPayment(walletLike, employee, octas);
          toast({ title: "✅ Payment Successful", description: `${apt} APT sent to ${employeeLabel}` });
          setAmountAPT("");
          setEmployee("");
        } catch (e: any) {
          console.error('Process payroll error:', e);

          let errorTitle = "Failed to Process Payroll";
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
            setLoading(false);
            return;
          } else if (e?.message) {
            errorMessage = e.message;
          }

          toast({ title: errorTitle, description: errorMessage, variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Process Payroll</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!registered && (
            <div className="p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
              Company not registered. Please register your company in Settings → Company Registration before processing payroll.
            </div>
          )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
            <select
              className="w-full border rounded-md h-10 px-3 bg-white text-gray-900"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              disabled={!registered || regLoading}
            >
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e.address} value={e.address}>{e.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (APT) *
              <span className="block text-xs font-normal text-gray-500 mt-0.5">Defaults to employee salary if available</span>
            </label>
            <Input type="number" step="0.00000001" placeholder="e.g. 2.5" value={amountAPT} onChange={(ev) => setAmountAPT(ev.target.value)} disabled={!registered || regLoading} />
          </div>
          <div>
            <Button onClick={onProcess} disabled={disabled} className="w-full h-10">Process</Button>
          </div>
        </div>

        {/* Batch controls */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm font-medium text-gray-700">Batch Process {useScheduled ? 'Scheduled Amounts' : 'Salaries'}</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setEmpRefreshTick(x => x+1)} disabled={!registered || regLoading || batchProcessing}>{empLoading ? 'Refreshing…' : 'Refresh Employees'}</Button>
              <Button variant="outline" size="sm" onClick={() => setSalRefreshTick(x => x+1)} disabled={!registered || regLoading || batchProcessing}>{salLoading ? 'Refreshing…' : 'Refresh Amounts'}</Button>
              <Button variant="outline" size="sm" onClick={() => toggleAll(true)} disabled={!registered || regLoading || batchProcessing}>Select All</Button>
              <Button variant="outline" size="sm" onClick={() => toggleAll(false)} disabled={!registered || regLoading || batchProcessing}>Clear All</Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <input id="toggleScheduled" type="checkbox" className="h-4 w-4" checked={useScheduled} onChange={(e) => setUseScheduled(e.target.checked)} disabled={!registered || regLoading || batchProcessing} />
            <label htmlFor="toggleScheduled">Process by scheduled amount (instead of salary)</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-2 rounded bg-gray-50">
              <div className="text-gray-500">Treasury Balance</div>
              <div className="font-medium">{treasuryAPT.toFixed(4)} APT</div>
            </div>
            <div className="p-2 rounded bg-gray-50">
              <div className="text-gray-500">Total Selected Salaries</div>
              <div className="font-medium">{totalSelectedAPT.toFixed(4)} APT</div>
            </div>
            <div className="p-2 rounded bg-gray-50">
              <div className="text-gray-500">Total All Salaries</div>
              <div className="font-medium">{totalAllAPT.toFixed(4)} APT</div>
            </div>
          </div>
          {registered && totalSelectedOctas > 0 && treasuryOctas < totalSelectedOctas && (
            <div className="text-xs text-red-600">Warning: Treasury balance may be insufficient to process all selected salaries.</div>
          )}
          <div className="max-h-56 overflow-auto border rounded-md divide-y">
            {employees.slice((page-1)*pageSize, page*pageSize).map((e) => {
              const amtOctas = salaries[e.address] || 0;
              const amtApt = (amtOctas / 1e8) || 0;
              return (
                <label key={e.address} className="flex items-center gap-3 p-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" className="h-4 w-4" checked={!!selected[e.address]} onChange={() => toggleOne(e.address)} disabled={!registered || regLoading || batchProcessing} />
                  <span className="flex-1">
                    <div className="font-medium">{e.label}</div>
                    <div className="text-xs text-gray-400">{shortAddress(e.address)}</div>
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-medium whitespace-nowrap" title="Computed amount">
                    {amtApt.toFixed(4)} APT
                  </span>
                </label>
              );
            })}
            {employees.length === 0 && registered && (
              <EmptyState
                icon={Users}
                title="No Employees Yet"
                description="Add employees to your company registry to process payroll payments"
                actionLabel="Add Employee"
                onAction={() => {}}
              />
            )}
          </div>
          {/* Pagination controls */}
          {employees.length > pageSize && (
            <div className="flex items-center justify-between text-sm py-2">
              <div>Page {page} of {Math.ceil(employees.length / pageSize)}</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Prev</Button>
                <Button variant="outline" onClick={() => setPage(p => Math.min(Math.ceil(employees.length / pageSize), p+1))} disabled={page >= Math.ceil(employees.length / pageSize)}>Next</Button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button onClick={onProcessSelected} disabled={!registered || regLoading || batchProcessing || !canBatch}>Process Selected</Button>
            <Button onClick={onProcessAll} disabled={!registered || regLoading || batchProcessing || !canBatch}>Process All</Button>
            <Button
              variant="outline"
              onClick={() => {
                // Determine due set based on current mode
                const dueAddrs = employees
                  .filter(e => (salaries[e.address] || 0) > 0)
                  .map(e => e.address);
                if (dueAddrs.length === 0) {
                  toast({ title: 'No due amounts found', description: useScheduled ? 'No scheduled totals > 0' : 'No salaries > 0', variant: 'destructive' });
                  return;
                }
                if (!canBatch) {
                  toast({ title: "Insufficient role", description: "Only HR or Admin can run batch", variant: "destructive" });
                  return;
                }
                processBatch(dueAddrs);
              }}
              disabled={!registered || regLoading || batchProcessing || !canBatch}
            >
              Process Due {useScheduled ? 'Schedules' : 'Salaries'}
            </Button>
          </div>
          {!canBatch && (
            <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
              Batch actions are restricted. Only users with HR or Admin role can run batch payroll.
            </div>
          )}
          {batchProcessing && <div className="text-xs text-gray-500">Processing batch...</div>}
          {!batchProcessing && results.length > 0 && (
            <div className="flex items-center justify-between text-sm mt-2">
              <div>
                <span className="font-medium">Summary:</span> {summary.success} success / {summary.failed} failed
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={retryFailedOnly} disabled={summary.failed === 0}>Retry Failed Only</Button>
                <Button variant="outline" onClick={downloadCsv}>Download CSV</Button>
              </div>
            </div>
          )}
          {results.length > 0 && (
            <div className="mt-2 border rounded-md divide-y">
              {results.map((r, idx) => (
                <div key={`${r.addr}-${idx}`} className="p-2 text-sm flex items-center justify-between">
                  <span className={r.ok ? 'text-green-600' : 'text-red-600'}>{r.ok ? 'Success' : 'Failed'}</span>
                  <span className="truncate flex-1 mx-2">{shortAddress(r.addr)} — {r.msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Recent Payments</div>
            <Button variant="outline" onClick={() => {
              // trigger events reload via small change in dependency using employees
              setEmpRefreshTick(x=>x); // no-op, but we reload explicitly
              (async () => {
                // quick inline refresh
                try {
                  setEventsLoading(true);
                  const pairs = await getPaymentProcessedEvents(companyAddress, 50);
                  const items = (pairs as any[]).map(({ event, tx }) => {
                    const d = (event?.data) || {};
                    const addr = String(d.employee ?? d.employee_address ?? '');
                    const amountOctas = Number(d.amount ?? 0);
                    const tsMicros = tx?.timestamp;
                    const version = tx?.version;
                    return { addr, amountOctas, tsMicros, version };
                  }).filter(x => x.addr);
                  items.sort((a,b) => Number(b.version||0) - Number(a.version||0));
                  const top = items.slice(0, 10).map(it => ({ ...it, label: employees.find(e => e.address === it.addr)?.label }));
                  setEvents(top);
                } finally {
                  setEventsLoading(false);
                }
              })();
            }} disabled={eventsLoading || !registered}>
              {eventsLoading ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>
          <div className="border rounded-md divide-y">
            {events.length === 0 && <div className="p-2 text-sm text-gray-500">No recent payments.</div>}
            {events.map((ev, i) => {
              const apt = (Number(ev.amountOctas||0)/1e8)||0;
              const ts = ev.tsMicros ? new Date(Number(ev.tsMicros)/1000).toLocaleString() : '';
              return (
                <div key={i} className="p-2 text-sm flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{ev.label || shortAddress(ev.addr)}</div>
                    <div className="text-xs text-gray-500">{shortAddress(ev.addr)}</div>
                  </div>
                  <div className="text-xs text-gray-600 mr-3">{ts}</div>
                  <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800 whitespace-nowrap">{apt.toFixed(4)} APT</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Confirmation Dialog */}
    <ConfirmationDialog
      open={confirmDialog.open}
      onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
      title={confirmDialog.title}
      description={confirmDialog.description}
      amount={confirmDialog.amount}
      onConfirm={confirmDialog.onConfirm}
      confirmLabel="Send Payment"
      variant="default"
      loading={loading}
    />
    </>
  );
}
