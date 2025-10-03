// Simple client-side cache for employee display fields
// This complements on-chain events which do not include email/salary/name.
// NOTE: Cache is now company-specific to avoid conflicts between multiple companies

export type EmployeeDisplay = {
  address: string; // normalized 0x+64
  firstName?: string;
  lastName?: string;
  department?: string;
  email?: string;
  monthlySalary?: number; // kept as monthly per UX
  roleCode?: number; // 0..4
  companyAddress?: string; // Company that owns this employee
};

const LS_KEY_PREFIX = "aptospayroll_employee_cache_v2_";

function getCompanyCacheKey(companyAddress?: string): string {
  if (!companyAddress) return `${LS_KEY_PREFIX}global`;
  return `${LS_KEY_PREFIX}${companyAddress.toLowerCase()}`;
}

function readAll(companyAddress?: string): Record<string, EmployeeDisplay> {
  try {
    const key = getCompanyCacheKey(companyAddress);
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, EmployeeDisplay>, companyAddress?: string) {
  try {
    const key = getCompanyCacheKey(companyAddress);
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function upsertEmployee(rec: EmployeeDisplay) {
  const all = readAll(rec.companyAddress);
  const key = (rec.address || "").toLowerCase();
  if (!key) return;
  all[key] = { ...(all[key] || {}), ...rec };
  writeAll(all, rec.companyAddress);
}

export function getEmployee(address: string, companyAddress?: string): EmployeeDisplay | undefined {
  const all = readAll(companyAddress);
  return all[(address || "").toLowerCase()];
}

export function listEmployees(companyAddress?: string): EmployeeDisplay[] {
  const all = readAll(companyAddress);
  return Object.values(all);
}
