import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { EmptyState } from "./ui/empty-state";
import {
  Calendar,
  Download,
  FileText,
  Clock,
  CheckCircle,
  User,
  ExternalLink
} from "lucide-react";
import { aptosClient } from "@/utils/aptosClient";
import { getPaymentProcessedEvents, getPaymentScheduleCreatedEvents } from "@/utils/payroll";
import { MODULE_ADDRESS, getExplorerTxnUrl } from "@/constants";

interface PaymentRecord {
  amount: number;
  timestamp: string;
  txHash: string;
  version: string;
  companyAddress: string;
}

interface TaxSummary {
  grossAmount: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  unemployment: number;
  totalTaxes: number;
  netAmount: number;
}

interface UpcomingSchedule {
  scheduleId: number;
  amount: number;
  frequency: string;
  nextPaymentDate: string;
  companyAddress: string;
}

export function EmployeePortal() {
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null);
  const [upcomingSchedules, setUpcomingSchedules] = useState<UpcomingSchedule[]>([]);
  const [activeSection, setActiveSection] = useState<'history' | 'upcoming' | 'tax' | 'info'>('history');

  const employeeAddress = account?.address?.toString() || '';

  useEffect(() => {
    if (!employeeAddress) return;
    loadEmployeeData();
  }, [employeeAddress]);

  async function loadEmployeeData() {
    setLoading(true);
    try {
      // Load payment history
      await loadPaymentHistory();

      // Load tax summary
      await loadTaxSummary();

      // Load upcoming schedules
      await loadUpcomingSchedules();

      // Load employee info
      await loadEmployeeInfo();
    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPaymentHistory() {
    try {
      // Get payment events for this employee
      // We need to check all companies that might have paid this employee
      // For now, we'll use the employee's own address as the company filter
      const pairs = await getPaymentProcessedEvents(employeeAddress, 100);

      const employeePayments: PaymentRecord[] = (pairs as any[])
        .map(({ event, tx }) => {
          const eventData = event?.data || {};
          const employeeAddr = String(eventData.employee_address || eventData.employee || '');

          // Only include payments where this wallet is the employee
          if (employeeAddr.toLowerCase() !== employeeAddress.toLowerCase()) {
            return null;
          }

          const amount = Number(eventData.amount || 0) / 1e8; // Convert from octas
          const tsMicros = tx?.timestamp; // microseconds as string
          const timestamp = tsMicros
            ? new Date(Number(tsMicros) / 1000).toLocaleString()
            : new Date().toLocaleString();
          const version = String(tx?.version || '');
          const txHash = String(version); // Use version as hash for now
          const companyAddress = String(eventData.company || 'Unknown');

          return {
            amount,
            timestamp,
            txHash,
            version,
            companyAddress
          };
        })
        .filter((p): p is PaymentRecord => p !== null);

      // Sort by version (most recent first)
      employeePayments.sort((a, b) => Number(b.version) - Number(a.version));

      setPayments(employeePayments);
    } catch (error) {
      console.error('Error loading payment history:', error);
      setPayments([]);
    }
  }

  async function loadTaxSummary() {
    try {
      const result = await aptosClient().view({
        payload: {
          function: `${MODULE_ADDRESS}::tax_calculator::get_employee_ytd_summary`,
          functionArguments: [employeeAddress],
        },
      });

      if (Array.isArray(result) && result.length >= 2) {
        const gross = Number(result[0]) / 1e8;
        const taxes = Number(result[1]) / 1e8;

        setTaxSummary({
          grossAmount: gross,
          federalTax: 0,
          stateTax: 0,
          socialSecurity: 0,
          medicare: 0,
          unemployment: 0,
          totalTaxes: taxes,
          netAmount: gross - taxes
        });
      }
    } catch (error) {
      console.error('Error loading tax summary:', error);
    }
  }

  async function loadEmployeeInfo() {
    try {
      // Employee info loading - can be enhanced later
    } catch (error) {
      console.error('Error loading employee info:', error);
    }
  }

  async function loadUpcomingSchedules() {
    try {
      // Get payment history to find company addresses that have paid this employee
      const paymentPairs = await getPaymentProcessedEvents(employeeAddress, 100);
      const companyAddresses = new Set<string>();

      (paymentPairs as any[]).forEach(({ event }) => {
        const eventData = event?.data || {};
        const company = String(eventData.company || '');
        if (company) companyAddresses.add(company);
      });

      // If no companies found, employee hasn't been paid yet, so no schedules to show
      if (companyAddresses.size === 0) {
        setUpcomingSchedules([]);
        return;
      }

      // Fetch schedule events from each company that has paid this employee
      const allSchedules: UpcomingSchedule[] = [];
      for (const companyAddr of companyAddresses) {
        try {
          const pairs = await getPaymentScheduleCreatedEvents(companyAddr, 100);

          const companySchedules: UpcomingSchedule[] = (pairs as any[])
            .map(({ event }) => {
              const eventData = event?.data || {};
              const employeeAddr = String(eventData.employee_address || eventData.employee || '');

              // Only include schedules for this employee
              if (employeeAddr.toLowerCase() !== employeeAddress.toLowerCase()) {
                return null;
              }

              const scheduleId = Number(eventData.schedule_id || 0);
              const amount = Number(eventData.amount || 0) / 1e8;
              const frequencySeconds = Number(eventData.frequency || 0);
              const nextRun = Number(eventData.next_run_time || 0);

              // Convert frequency to readable format
              let frequency = 'Unknown';
              if (frequencySeconds === 604800) frequency = 'Weekly';
              else if (frequencySeconds === 1209600) frequency = 'Bi-weekly';
              else if (frequencySeconds === 2592000) frequency = 'Monthly';
              else frequency = `Every ${Math.floor(frequencySeconds / 86400)} days`;

              // Convert next run time to date
              const nextPaymentDate = nextRun
                ? new Date(nextRun * 1000).toLocaleString()
                : 'Not scheduled';

              return {
                scheduleId,
                amount,
                frequency,
                nextPaymentDate,
                companyAddress: companyAddr
              };
            })
            .filter((s): s is UpcomingSchedule => s !== null);

          allSchedules.push(...companySchedules);
        } catch (error) {
          console.error(`Error loading schedules from company ${companyAddr}:`, error);
        }
      }

      setUpcomingSchedules(allSchedules);
    } catch (error) {
      console.error('Error loading upcoming schedules:', error);
      setUpcomingSchedules([]);
    }
  }

  function downloadTaxDocument() {
    if (!taxSummary) return;

    const csvContent = [
      ['Tax Document - Year to Date Summary'],
      ['Employee Address', employeeAddress],
      ['Generated Date', new Date().toLocaleDateString()],
      [''],
      ['Description', 'Amount (APT)'],
      ['Gross Earnings', taxSummary.grossAmount.toFixed(8)],
      ['Federal Tax', taxSummary.federalTax.toFixed(8)],
      ['State Tax', taxSummary.stateTax.toFixed(8)],
      ['Social Security', taxSummary.socialSecurity.toFixed(8)],
      ['Medicare', taxSummary.medicare.toFixed(8)],
      ['Unemployment', taxSummary.unemployment.toFixed(8)],
      ['Total Taxes', taxSummary.totalTaxes.toFixed(8)],
      ['Net Amount', taxSummary.netAmount.toFixed(8)]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-summary-${employeeAddress.slice(0, 8)}-${new Date().getFullYear()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadPayHistory() {
    if (payments.length === 0) return;

    const csvContent = [
      ['Payment History'],
      ['Employee Address', employeeAddress],
      ['Generated Date', new Date().toLocaleDateString()],
      [''],
      ['Date', 'Amount (APT)', 'Company', 'Transaction Version'],
      ...payments.map(p => [p.timestamp, p.amount.toFixed(8), p.companyAddress, p.version])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${employeeAddress.slice(0, 8)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (!account) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={User}
            title="Connect Your Wallet"
            description="Connect your wallet to access your employee portal and view payment history, upcoming payments, and tax documents."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Portal</h2>
          <p className="text-sm text-gray-500 mt-1">View your payment history and tax documents</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('history')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeSection === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pay History
          </div>
        </button>
        <button
          onClick={() => setActiveSection('upcoming')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeSection === 'upcoming'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Upcoming Payments
          </div>
        </button>
        <button
          onClick={() => setActiveSection('tax')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeSection === 'tax'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Tax Documents
          </div>
        </button>
        <button
          onClick={() => setActiveSection('info')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeSection === 'info'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            My Information
          </div>
        </button>
      </div>

      {/* Pay History Section */}
      {activeSection === 'history' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Payment History
              </CardTitle>
              {payments.length > 0 && (
                <Button variant="outline" size="sm" onClick={downloadPayHistory}>
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            ) : payments.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No Payment History"
                description="You haven't received any payments yet. Your payment history will appear here once you receive your first payment."
              />
            ) : (
              <div className="space-y-3">
                {payments.map((payment, idx) => {
                  const txnHash = payment.version ? `0x${Number(payment.version).toString(16)}` : '';
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover-lift">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-gray-900">Payment Received</span>
                        </div>
                        <p className="text-sm text-gray-500">{payment.timestamp}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-400">Tx: {payment.version}</p>
                          {payment.version && (
                            <a
                              href={getExplorerTxnUrl(txnHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              title="View on Explorer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span className="text-xs">View</span>
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">+{payment.amount.toFixed(4)} APT</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Payments Section */}
      {activeSection === 'upcoming' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Scheduled Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            ) : upcomingSchedules.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Scheduled Payments"
                description="You don't have any upcoming scheduled payments. Your employer may not have set up recurring payments for your account yet."
              />
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.map((schedule) => (
                  <div key={schedule.scheduleId} className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover-lift">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">{schedule.frequency} Payment</span>
                      </div>
                      <span className="text-sm px-3 py-1 bg-blue-600 text-white rounded-full font-medium">
                        {schedule.amount.toFixed(4)} APT
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Next Payment: {schedule.nextPaymentDate}
                      </p>
                      <p className="text-xs text-gray-500">Schedule ID: #{schedule.scheduleId}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <p className="font-semibold mb-1">ℹ️ Scheduled Payment Info</p>
                  <p>These payments are automatically processed by your employer according to the schedule shown. Contact your HR department for any changes.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tax Documents Section */}
      {activeSection === 'tax' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Tax Documents & Summaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : taxSummary ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 mb-1">Year-to-Date Earnings</p>
                    <p className="text-2xl font-bold text-green-700">{taxSummary.grossAmount.toFixed(4)} APT</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 mb-1">Year-to-Date Taxes</p>
                    <p className="text-2xl font-bold text-red-700">{taxSummary.totalTaxes.toFixed(4)} APT</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 mb-1">Net Amount Received</p>
                    <p className="text-2xl font-bold text-blue-700">{taxSummary.netAmount.toFixed(4)} APT</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-600 mb-1">Tax Rate</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {taxSummary.grossAmount > 0
                        ? ((taxSummary.totalTaxes / taxSummary.grossAmount) * 100).toFixed(2)
                        : '0.00'}%
                    </p>
                  </div>
                </div>

                <Button onClick={downloadTaxDocument} className="w-full gradient-primary text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Download Tax Summary (CSV)
                </Button>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <p className="font-semibold mb-1">📋 Tax Document Note</p>
                  <p>This is a simplified tax summary. Please consult with a tax professional for official tax filing documents.</p>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No Tax Data Available"
                description="Tax summaries will be available once you start receiving payments with tax withholdings."
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Employee Information Section */}
      {activeSection === 'info' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Wallet Address</p>
                <p className="font-mono text-sm text-gray-900 break-all">{employeeAddress}</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <p className="font-semibold mb-1">ℹ️ Profile Information</p>
                <p>Your employer manages your detailed profile information. Contact your HR department to update personal details, tax withholding preferences, or payment information.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
