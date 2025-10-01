import React, { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getCompanyInfo, getTotalSchedulesCount, getDuePaymentsCount } from "@/utils/payroll";

export function CompanyStatus() {
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any | null>(null);
  const [totalSchedules, setTotalSchedules] = useState<number | null>(null);
  const [dueSchedules, setDueSchedules] = useState<number | null>(null);
  const address = account?.address ?? "";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!address) {
        setCompany(null);
        setTotalSchedules(null);
        setDueSchedules(null);
        return;
      }
      setLoading(true);
      try {
        const info = await getCompanyInfo(address);
        // get_company_info returns (name, owner, treasury_balance, employee_count, is_active)
        const [name, owner, treasury, employeeCount, isActive] = info ?? [];
        const total = await getTotalSchedulesCount(address);
        const due = await getDuePaymentsCount(address);
        if (!cancelled) {
          setCompany({ name, owner, treasury, employeeCount, isActive });
          setTotalSchedules(typeof total === 'number' ? total : 0);
          setDueSchedules(typeof due === 'number' ? due : 0);
        }
      } catch {
        if (!cancelled) {
          setCompany(null);
          setTotalSchedules(null);
          setDueSchedules(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    // refresh when account changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {!address && <p className="text-sm text-gray-500">Connect wallet to view status.</p>}
        {address && loading && <p className="text-sm text-gray-500">Loading on-chain data...</p>}
        {address && !loading && !company && (
          <p className="text-sm text-yellow-600">No company found for this address.</p>
        )}
        {address && !loading && company && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Name</div>
              <div className="font-medium break-all">{typeof company.name === 'string' ? company.name : '(bytes)'}</div>
            </div>
            <div>
              <div className="text-gray-500">Owner</div>
              <div className="font-medium break-all">{company.owner}</div>
            </div>
            <div>
              <div className="text-gray-500">Treasury Balance</div>
              <div className="font-medium">{company.treasury}</div>
            </div>
            <div>
              <div className="text-gray-500">Employees</div>
              <div className="font-medium">{company.employeeCount}</div>
            </div>
            <div>
              <div className="text-gray-500">Total Schedules</div>
              <div className="font-medium">{totalSchedules ?? '-'}</div>
            </div>
            <div>
              <div className="text-gray-500">Due Payments</div>
              <div className="font-medium">{dueSchedules ?? '-'}</div>
            </div>
            <div>
              <div className="text-gray-500">Active</div>
              <div className="font-medium">{company.isActive ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
