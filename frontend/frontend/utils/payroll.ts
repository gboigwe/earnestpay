import { MODULE_ADDRESS } from "@/constants";
import { aptosClient } from "./aptosClient";

// Minimal wallet shape expected from @aptos-labs/wallet-adapter-react
type WalletLike = {
  account?: { address: string } | null;
  signAndSubmitTransaction: (tx: any) => Promise<{ hash: string }>;
};

// Helper to ensure numeric arguments are numbers
const n = (v: any) => Number(v);

// -------- Entry functions via wallet signer --------
export async function registerCompany(wallet: WalletLike, companyName: string) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const tx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::payroll_manager::register_company`,
      functionArguments: [Array.from(new TextEncoder().encode(companyName))],
    },
  });
  const result = await aptosClient().waitForTransaction({ transactionHash: tx.hash });
  if ((result as any)?.success === false) {
    throw new Error((result as any)?.vm_status || 'Transaction failed');
  }
  return tx;
}

export async function fundTreasury(wallet: WalletLike, amount: number) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const tx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::payroll_manager::fund_treasury`,
      functionArguments: [n(amount)],
    },
  });
  const result = await aptosClient().waitForTransaction({ transactionHash: tx.hash });
  return result as any;
}

// Combined helper: actually transfer APT from wallet to company address, then update module counter
export async function fundTreasuryWithWalletTransfer(wallet: WalletLike, amountApt: number) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const companyAddress = String(account.address);
  // Convert APT -> Octas (1 APT = 1e8 Octas)
  const octas = Math.round(Number(amountApt) * 1e8);
  if (!isFinite(octas) || octas <= 0) throw new Error("Invalid APT amount");
  // 1) Transfer APT from wallet to company account using core transfer
  const transferTx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `0x1::aptos_account::transfer`,
      functionArguments: [companyAddress, n(octas)],
    },
  });
  await aptosClient().waitForTransaction({ transactionHash: transferTx.hash });
  // 2) Call module entry to update internal counter
  const updateRes = await fundTreasury(wallet, octas);
  return { transferHash: transferTx.hash, update: updateRes } as any;
}

export async function addEmployee(wallet: WalletLike, employeeAddress: string) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const tx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::payroll_manager::add_employee`,
      functionArguments: [employeeAddress],
    },
  });
  await aptosClient().waitForTransaction({ transactionHash: tx.hash });
  return tx;
}

export async function processPayment(wallet: WalletLike, employeeAddress: string, amount: number) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const tx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::payroll_manager::process_payment`,
      functionArguments: [employeeAddress, n(amount)],
    },
  });
  await aptosClient().waitForTransaction({ transactionHash: tx.hash });
  return tx;
}

export async function initializeEmployeeRegistry(wallet: WalletLike) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const tx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::employee_registry::initialize_registry`,
      functionArguments: [],
    },
  });
  await aptosClient().waitForTransaction({ transactionHash: tx.hash });
  return tx;
}

export async function createEmployeeProfile(
  wallet: WalletLike,
  employeeAddress: string,
  employeeId: number,
  firstName: string,
  lastName: string,
  email: string,
  role: number,
  department: string,
  salary: number,
  managerAddress: string,
  taxJurisdiction: string,
  paymentAddress: string
) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const enc = new TextEncoder();
  const tx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::employee_registry::create_employee_profile`,
      functionArguments: [
        employeeAddress,
        n(employeeId),
        Array.from(enc.encode(firstName)),
        Array.from(enc.encode(lastName)),
        Array.from(enc.encode(email)),
        n(role),
        Array.from(enc.encode(department)),
        n(salary),
        managerAddress,
        Array.from(enc.encode(taxJurisdiction)),
        paymentAddress,
      ],
    },
  });
  const result = await aptosClient().waitForTransaction({ transactionHash: tx.hash });
  if ((result as any)?.success === false) {
    throw new Error((result as any)?.vm_status || 'Transaction failed');
  }
  return tx;
}

export async function updateEmployeeSalary(wallet: WalletLike, employeeAddress: string, newSalary: number) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const tx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::employee_registry::update_employee_salary`,
      functionArguments: [employeeAddress, n(newSalary)],
    },
  });
  await aptosClient().waitForTransaction({ transactionHash: tx.hash });
  return tx;
}

export async function deactivateEmployee(wallet: WalletLike, employeeAddress: string) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const tx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::employee_registry::deactivate_employee`,
      functionArguments: [employeeAddress],
    },
  });
  await aptosClient().waitForTransaction({ transactionHash: tx.hash });
  return tx;
}

export async function initializeScheduler(wallet: WalletLike) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const tx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::payment_scheduler::initialize_scheduler`,
      functionArguments: [],
    },
  });
  await aptosClient().waitForTransaction({ transactionHash: tx.hash });
  return tx;
}

export async function createPaymentSchedule(
  wallet: WalletLike,
  employeeAddress: string,
  paymentType: number,
  frequency: number,
  amount: number,
  startDate: number
) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const tx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::payment_scheduler::create_payment_schedule`,
      functionArguments: [employeeAddress, n(paymentType), n(frequency), n(amount), n(startDate)],
    },
  });
  await aptosClient().waitForTransaction({ transactionHash: tx.hash });
  return tx;
}

export async function updateScheduleAmount(wallet: WalletLike, scheduleId: number, newAmount: number) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const tx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::payment_scheduler::update_schedule_amount`,
      functionArguments: [n(scheduleId), n(newAmount)],
    },
  });
  await aptosClient().waitForTransaction({ transactionHash: tx.hash });
  return tx;
}

export async function deactivateSchedule(wallet: WalletLike, scheduleId: number) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const tx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::payment_scheduler::deactivate_schedule`,
      functionArguments: [n(scheduleId)],
    },
  });
  await aptosClient().waitForTransaction({ transactionHash: tx.hash });
  return tx;
}

export async function executeDuePayments(wallet: WalletLike) {
  const { account, signAndSubmitTransaction } = wallet;
  if (!account) throw new Error("Wallet not connected");
  const tx = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::payment_scheduler::execute_due_payments`,
      functionArguments: [],
    },
  });
  await aptosClient().waitForTransaction({ transactionHash: tx.hash });
}

// ---------------------------
// Event helpers (via tx scan)
// ---------------------------

type AptosEvent = { type: string; data: any; sequence_number?: string };
type AptosUserTransaction = { hash: string; sender: string; events?: AptosEvent[] };

async function getRecentAccountTransactions(address: string, limit: number = 50) {
  // ts-sdk getAccountTransactions returns user transactions
  // We cap to a reasonable number and filter events locally
  return (await aptosClient().getAccountTransactions({ accountAddress: address, options: { limit } })) as AptosUserTransaction[];
}

function fqEvent(module: string, event: string) {
  return `${MODULE_ADDRESS}::${module}::${event}`;
}

function filterEventsByTypes(txs: AptosUserTransaction[], types: string[]) {
  const out: { event: AptosEvent; tx: AptosUserTransaction }[] = [];
  const suffixes = types.map((t) => {
    const parts = (t || '').split('::');
    if (parts.length >= 3) {
      const mod = parts[parts.length - 2];
      const name = parts[parts.length - 1];
      return `::${mod}::${name}`;
    }
    return t;
  });
  for (const tx of txs) {
    for (const ev of tx.events ?? []) {
      const et = ev.type || '';
      let match = false;
      for (let i = 0; i < types.length; i++) {
        const full = types[i];
        const suf = suffixes[i];
        if (et === full || (suf && et.endsWith(suf))) { match = true; break; }
      }
      if (match) out.push({ event: ev, tx });
    }
  }
  return out;
}

// payroll_manager events
export async function getCompanyRegisteredEvents(companyAddress: string, txLimit = 50) {
  const txs = await getRecentAccountTransactions(companyAddress, txLimit);
  return filterEventsByTypes(txs, [fqEvent('payroll_manager', 'CompanyRegistered')]);
}

export async function getTreasuryFundedEvents(companyAddress: string, txLimit = 50) {
  const txs = await getRecentAccountTransactions(companyAddress, txLimit);
  return filterEventsByTypes(txs, [fqEvent('payroll_manager', 'TreasuryFunded')]);
}

export async function getEmployeeAddedEvents(companyAddress: string, txLimit = 50) {
  const txs = await getRecentAccountTransactions(companyAddress, txLimit);
  return filterEventsByTypes(txs, [fqEvent('payroll_manager', 'EmployeeAdded')]);
}

export async function getPaymentProcessedEvents(companyAddress: string, txLimit = 50) {
  const txs = await getRecentAccountTransactions(companyAddress, txLimit);
  return filterEventsByTypes(txs, [fqEvent('payroll_manager', 'PaymentProcessed')]);
}

// employee_registry events
export async function getEmployeeProfileCreatedEvents(companyAddress: string, txLimit = 50) {
  const txs = await getRecentAccountTransactions(companyAddress, txLimit);
  return filterEventsByTypes(txs, [fqEvent('employee_registry', 'EmployeeProfileCreated')]);
}

export async function getEmployeeProfileUpdatedEvents(companyAddress: string, txLimit = 50) {
  const txs = await getRecentAccountTransactions(companyAddress, txLimit);
  return filterEventsByTypes(txs, [fqEvent('employee_registry', 'EmployeeProfileUpdated')]);
}

export async function getEmployeeDeactivatedEvents(companyAddress: string, txLimit = 50) {
  const txs = await getRecentAccountTransactions(companyAddress, txLimit);
  return filterEventsByTypes(txs, [fqEvent('employee_registry', 'EmployeeDeactivated')]);
}

// payment_scheduler events
export async function getPaymentScheduleCreatedEvents(companyAddress: string, txLimit = 50) {
  const txs = await getRecentAccountTransactions(companyAddress, txLimit);
  return filterEventsByTypes(txs, [fqEvent('payment_scheduler', 'PaymentScheduleCreated')]);
}

export async function getPaymentScheduleUpdatedEvents(companyAddress: string, txLimit = 50) {
  const txs = await getRecentAccountTransactions(companyAddress, txLimit);
  return filterEventsByTypes(txs, [fqEvent('payment_scheduler', 'PaymentScheduleUpdated')]);
}

export async function getPaymentScheduleDeactivatedEvents(companyAddress: string, txLimit = 50) {
  const txs = await getRecentAccountTransactions(companyAddress, txLimit);
  return filterEventsByTypes(txs, [fqEvent('payment_scheduler', 'PaymentScheduleDeactivated')]);
}

export async function getScheduledPaymentExecutedEvents(companyAddress: string, txLimit = 50) {
  const txs = await getRecentAccountTransactions(companyAddress, txLimit);
  return filterEventsByTypes(txs, [fqEvent('payment_scheduler', 'ScheduledPaymentExecuted')]);
}

// -------- View functions via aptosClient --------
export async function getEmployeeProfile(companyAddress: string, employeeAddress: string) {
  return aptosClient().view({
    payload: {
      function: `${MODULE_ADDRESS}::employee_registry::get_employee_profile`,
      functionArguments: [companyAddress, employeeAddress],
    },
  });
}

export type OnChainEmployee = {
  address: string;
  // Optional display fields if retrievable
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  active?: boolean;
};

export async function listCompanyEmployees(companyAddress: string, onlyActive: boolean = true): Promise<OnChainEmployee[]> {
  // Collect from EmployeeProfileCreated and EmployeeAdded events; merge and de-duplicate
  const evsProfile = await getEmployeeProfileCreatedEvents(companyAddress, 200).catch(() => [] as any[]);
  const evsAdded = await getEmployeeAddedEvents(companyAddress, 200).catch(() => [] as any[]);
  const rows = ([] as string[])
    .concat(
      (evsProfile || []).map(({ event }) => {
        const d = (event as any)?.data || {};
        const addr = d.employee || d.employee_address || d.addr || '';
        return String(addr || '');
      }),
      (evsAdded || []).map(({ event }) => {
        const d = (event as any)?.data || {};
        const addr = d.employee || d.employee_address || d.addr || '';
        return String(addr || '');
      })
    )
    .filter(Boolean)
    .reverse();
  const seen = new Set<string>();
  const uniqueAddrs: string[] = [];
  for (const a of rows) {
    const key = a.toLowerCase();
    if (!seen.has(key)) { seen.add(key); uniqueAddrs.push(a); }
  }
  // Optionally filter by active flag
  const out: OnChainEmployee[] = [];
  for (const addr of uniqueAddrs) {
    let active: boolean | undefined = undefined;
    try { active = await isEmployeeActive(addr); } catch {}
    if (onlyActive && active === false) continue;
    // Attempt to read profile details (may fail on current deployment)
    let firstName: string | undefined;
    let lastName: string | undefined;
    let email: string | undefined;
    let department: string | undefined;
    try {
      const profile = await getEmployeeProfile(companyAddress, addr);
      // Depending on Move function return shape, profile may be tuple array; keep defensive
      const p = Array.isArray(profile) ? profile : [];
      // If the function returns bytes for strings, they may already be utf8 strings in SDK; leave as is
      firstName = String(p[2] ?? '').trim() || undefined;
      lastName = String(p[3] ?? '').trim() || undefined;
      email = String(p[4] ?? '').trim() || undefined;
      department = String(p[6] ?? '').trim() || undefined;
    } catch {}
    out.push({ address: addr, firstName, lastName, email, department, active });
  }
  return out;
}

export async function getCompanyInfo(companyAddress: string) {
  return aptosClient().view({
    payload: {
      function: `${MODULE_ADDRESS}::payroll_manager::get_company_info`,
      functionArguments: [companyAddress],
    },
  });
}

export async function isCompanyRegistered(companyAddress: string): Promise<boolean> {
  try {
    const res = await getCompanyInfo(companyAddress);
    // get_company_info returns tuple; existence indicates registered
    return Array.isArray(res);
  } catch {
    return false;
  }
}

export async function getTreasuryBalance(companyAddress: string) {
  try {
    const res = await aptosClient().view({
      payload: {
        function: `${MODULE_ADDRESS}::payroll_manager::get_treasury_balance`,
        functionArguments: [companyAddress],
      },
    });
    return (res?.[0] as number) ?? 0;
  } catch {
    return 0;
  }
}

export async function getEmployeeSalary(employeeAddress: string) {
  const res = await aptosClient().view({
    payload: {
      function: `${MODULE_ADDRESS}::employee_registry::get_employee_salary`,
      functionArguments: [employeeAddress],
    },
  });
  return res?.[0] as number;
}

export async function getEmployeeRole(employeeAddress: string) {
  const res = await aptosClient().view({
    payload: {
      function: `${MODULE_ADDRESS}::employee_registry::get_employee_role`,
      functionArguments: [employeeAddress],
    },
  });
  return res?.[0] as number;
}

export async function isEmployeeActive(employeeAddress: string) {
  const res = await aptosClient().view({
    payload: {
      function: `${MODULE_ADDRESS}::employee_registry::is_employee_active`,
      functionArguments: [employeeAddress],
    },
  });
  return res?.[0] as boolean;
}

export async function getCompanyEmployeeCount(companyAddress: string) {
  const res = await aptosClient().view({
    payload: {
      function: `${MODULE_ADDRESS}::employee_registry::get_company_employee_count`,
      functionArguments: [companyAddress],
    },
  });
  return res?.[0] as number;
}

export async function isManagerOrAbove(employeeAddress: string) {
  const res = await aptosClient().view({
    payload: {
      function: `${MODULE_ADDRESS}::employee_registry::is_manager_or_above`,
      functionArguments: [employeeAddress],
    },
  });
  return res?.[0] as boolean;
}

export async function canManagePayroll(employeeAddress: string) {
  const res = await aptosClient().view({
    payload: {
      function: `${MODULE_ADDRESS}::employee_registry::can_manage_payroll`,
      functionArguments: [employeeAddress],
    },
  });
  return res?.[0] as boolean;
}

export async function getPaymentSchedule(companyAddress: string, scheduleId: number) {
  return aptosClient().view({
    payload: {
      function: `${MODULE_ADDRESS}::payment_scheduler::get_payment_schedule`,
      functionArguments: [companyAddress, n(scheduleId)],
    },
  });
}

export async function getEmployeeSchedulesCount(companyAddress: string, employeeAddress: string) {
  const res = await aptosClient().view({
    payload: {
      function: `${MODULE_ADDRESS}::payment_scheduler::get_employee_schedules_count`,
      functionArguments: [companyAddress, employeeAddress],
    },
  });
  return res?.[0] as number;
}

export async function getDuePaymentsCount(companyAddress: string) {
  const res = await aptosClient().view({
    payload: {
      function: `${MODULE_ADDRESS}::payment_scheduler::get_due_payments_count`,
      functionArguments: [companyAddress],
    },
  });
  return res?.[0] as number;
}

export async function getTotalSchedulesCount(companyAddress: string) {
  const res = await aptosClient().view({
    payload: {
      function: `${MODULE_ADDRESS}::payment_scheduler::get_total_schedules_count`,
      functionArguments: [companyAddress],
    },
  });
  return res?.[0] as number;
}

// ---------------------------
// Tax calculator views
// ---------------------------

export async function getSupportedJurisdictions(companyAddress: string) {
  try {
    const res = await aptosClient().view({
      payload: {
        function: `${MODULE_ADDRESS}::tax_calculator::get_supported_jurisdictions`,
        functionArguments: [companyAddress],
      },
    });
    // Expecting vector<String> -> string[]
    return (res as any[] | undefined) ?? [];
  } catch {
    return [] as string[];
  }
}
