// Simple client-side cache for employee display fields
// This complements on-chain events which do not include email/salary/name.

export type EmployeeDisplay = {
  address: string; // normalized 0x+64
  firstName?: string;
  lastName?: string;
  department?: string;
  email?: string;
  monthlySalary?: number; // kept as monthly per UX
  roleCode?: number; // 0..4
};

const LS_KEY = "aptospayroll_employee_cache_v1";

function readAll(): Record<string, EmployeeDisplay> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, EmployeeDisplay>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function upsertEmployee(rec: EmployeeDisplay) {
  const all = readAll();
  const key = (rec.address || "").toLowerCase();
  if (!key) return;
  all[key] = { ...(all[key] || {}), ...rec };
  writeAll(all);
}

export function getEmployee(address: string): EmployeeDisplay | undefined {
  const all = readAll();
  return all[(address || "").toLowerCase()];
}

export function listEmployees(): EmployeeDisplay[] {
  const all = readAll();
  return Object.values(all);
}
