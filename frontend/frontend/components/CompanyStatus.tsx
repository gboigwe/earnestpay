import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { getCompanyEmployeeCount, getTotalSchedulesCount, getDuePaymentsCount, getTreasuryBalance, getCompanyName } from "@/utils/payroll";
import { StatCard } from "./ui/enhanced-card";
import { DollarSign, Users, Calendar, Clock, Building2, ExternalLink } from "lucide-react";
import { getExplorerAccountUrl } from "@/constants";

export function CompanyStatus() {
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [totalSchedules, setTotalSchedules] = useState<number | null>(null);
  const [dueSchedules, setDueSchedules] = useState<number | null>(null);
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [treasury, setTreasury] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState<string>("Loading...");
  const address = (account?.address as any)?.toString?.() ?? (account?.address ? String(account.address) : "");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!address) {
        setTotalSchedules(null);
        setDueSchedules(null);
        setEmployeeCount(null);
        setCompanyName("Connect Wallet");
        return;
      }
      setLoading(true);
      try {
        const [empCount, total, due, bal, name] = await Promise.all([
          getCompanyEmployeeCount(address as string),
          getTotalSchedulesCount(address as string),
          getDuePaymentsCount(address as string),
          getTreasuryBalance(address as string),
          getCompanyName(address as string)
        ]);
        if (!cancelled) {
          setEmployeeCount(Number(empCount ?? 0));
          setTotalSchedules(Number(total ?? 0));
          setDueSchedules(Number(due ?? 0));
          setTreasury(Number(bal ?? 0));
          setCompanyName(name || "Not Registered");
        }
      } catch {
        if (!cancelled) {
          setEmployeeCount(null);
          setTotalSchedules(null);
          setDueSchedules(null);
          setTreasury(null);
          setCompanyName("Not Registered");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    // refresh when account changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  function formatAmount(n: any): string {
    const v = Number(n) / 1e8; // Convert from octas to APT
    if (!isFinite(v)) return '0 APT';
    return `${v.toFixed(4)} APT`;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                {companyName}
              </CardTitle>
              {address && companyName !== "Not Registered" && companyName !== "Connect Wallet" && (
                <a
                  href={getExplorerAccountUrl(address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  title="View Company on Explorer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            {address && companyName !== "Not Registered" && companyName !== "Connect Wallet" && (
              <p className="text-xs text-gray-500 mt-1">Your Company Dashboard</p>
            )}
          </div>
          {address && companyName === "Not Registered" && (
            <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
              Register your company to get started
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!address && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-2">Connect your wallet to view company status</p>
            <p className="text-xs text-gray-400">Your wallet address will be your company identifier</p>
          </div>
        )}

        {address && loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        )}

        {address && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Treasury Balance"
              value={formatAmount(treasury ?? 0)}
              subtitle="On-chain company treasury"
              icon={<DollarSign className="h-6 w-6" />}
              gradient="from-cyan-500 to-blue-600"
            />
            <StatCard
              title="Employees"
              value={`${employeeCount ?? '-'}`}
              subtitle="Registered in employee registry"
              icon={<Users className="h-6 w-6" />}
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard
              title="Total Schedules"
              value={`${totalSchedules ?? '-'}`}
              subtitle="Active payment schedules"
              icon={<Calendar className="h-6 w-6" />}
              gradient="from-purple-500 to-indigo-600"
            />
            <StatCard
              title="Due Payments"
              value={`${dueSchedules ?? '-'}`}
              subtitle="Payments ready to execute"
              icon={<Clock className="h-6 w-6" />}
              gradient="from-amber-500 to-orange-600"
            />
          </div>
        )}
        {address && (
          <div className="mt-4 text-xs text-gray-400 break-all">Company: {address}</div>
        )}
      </CardContent>
    </Card>
  );
}
