import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from './ui/use-toast';
import { aptosClient } from '@/utils/aptosClient';
import { MODULE_ADDRESS } from '@/constants';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  Settings,
  Download,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';

// Tax jurisdiction configurations
const TAX_JURISDICTIONS = [
  { code: 'US_FED', name: 'US Federal', flag: '🇺🇸' },
  { code: 'US_CA', name: 'California, USA', flag: '🇺🇸' },
  { code: 'US_NY', name: 'New York, USA', flag: '🇺🇸' },
  { code: 'US_TX', name: 'Texas, USA', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'EU_DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'EU_FR', name: 'France', flag: '🇫🇷' },
];

interface TaxCalculationResult {
  grossAmount: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  unemployment: number;
  totalTaxes: number;
  netAmount: number;
}

export function TaxCompliance() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [activeSection, setActiveSection] = useState<'calculator' | 'rates' | 'ytd' | 'compliance'>('calculator');

  // Tax Calculator State
  const [grossAmount, setGrossAmount] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('US_FED');
  const [calculationResult, setCalculationResult] = useState<TaxCalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Tax Rates Management State
  const [editingJurisdiction, setEditingJurisdiction] = useState('');
  const [taxRates, setTaxRates] = useState({
    federalRate: '',
    stateRate: '',
    socialSecurityRate: '',
    medicareRate: '',
    unemploymentRate: ''
  });
  const [updatingRates, setUpdatingRates] = useState(false);

  // YTD Summary State
  const [employeeAddress, setEmployeeAddress] = useState('');
  const [ytdSummary, setYtdSummary] = useState<{ gross: number; taxes: number } | null>(null);
  const [loadingYTD, setLoadingYTD] = useState(false);

  // Compliance Status
  const [supportedJurisdictions, setSupportedJurisdictions] = useState<string[]>([]);
  const [taxConfigInitialized, setTaxConfigInitialized] = useState(false);
  const [checkingCompliance, setCheckingCompliance] = useState(false);

  // Check tax configuration on mount
  useEffect(() => {
    checkTaxConfiguration();
  }, [account]);

  const checkTaxConfiguration = async () => {
    if (!account?.address) return;
    setCheckingCompliance(true);
    try {
      const jurisdictions = await aptosClient().view({
        payload: {
          function: `${MODULE_ADDRESS}::tax_calculator::get_supported_jurisdictions`,
          functionArguments: [account.address.toString()],
        },
      });

      if (Array.isArray(jurisdictions[0])) {
        setSupportedJurisdictions(jurisdictions[0] as string[]);
        setTaxConfigInitialized(jurisdictions[0].length > 0);
      }
    } catch (error) {
      console.error('Tax config check failed:', error);
      setTaxConfigInitialized(false);
    } finally {
      setCheckingCompliance(false);
    }
  };

  const initializeTaxConfig = async () => {
    if (!account) {
      toast({ title: 'Connect wallet', variant: 'destructive' });
      return;
    }

    setCheckingCompliance(true);
    try {
      const response = await signAndSubmitTransaction({
        sender: account.address.toString(),
        data: {
          function: `${MODULE_ADDRESS}::tax_calculator::initialize_tax_config`,
          functionArguments: [],
        },
      });

      await aptosClient().waitForTransaction({ transactionHash: response.hash });
      toast({ title: '✅ Tax Configuration Initialized', description: 'Default US tax rates have been configured.' });
      await checkTaxConfiguration();
    } catch (error: any) {
      console.error('Initialize tax config error:', error);

      // Handle different types of errors with user-friendly messages
      let errorTitle = 'Initialization Failed';
      let errorMessage = 'Failed to initialize tax configuration';

      // Check for simulation errors (these happen BEFORE wallet popup)
      if (error?.message?.includes('MAX_GAS_UNITS_BELOW_MIN_TRANSACTION_GAS_UNITS')) {
        errorTitle = '💰 Insufficient Gas Funds';
        errorMessage = 'You need APT tokens in your wallet to pay for transaction gas fees. Please fund your wallet from the Aptos faucet first.';
      } else if (error?.message?.includes('INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE')) {
        errorTitle = '💰 Insufficient Balance';
        errorMessage = 'You don\'t have enough APT to pay for gas fees. Please add funds to your wallet from the faucet.';
      } else if (error?.message?.includes('User rejected') || error?.code === 4001) {
        // Silent - user cancelled on purpose
        return;
      } else if (error?.message?.includes('already exists') || error?.message?.includes('RESOURCE_ALREADY_EXISTS')) {
        errorTitle = 'Already Initialized';
        errorMessage = 'Tax configuration has already been initialized for your company.';
        setTaxConfigInitialized(true);
      } else if (error?.message?.includes('Simulation failed')) {
        errorTitle = 'Transaction Simulation Failed';
        errorMessage = 'The transaction cannot be executed. Please check that you have sufficient APT balance for gas fees.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setCheckingCompliance(false);
    }
  };

  const calculateTaxes = async () => {
    if (!grossAmount || Number(grossAmount) <= 0) {
      toast({ title: 'Enter valid amount', variant: 'destructive' });
      return;
    }

    const employeeAddr = account?.address || '0x1';
    const amountOctas = Math.round(Number(grossAmount) * 1e8);

    setCalculating(true);
    try {
      const result = await aptosClient().view({
        payload: {
          function: `${MODULE_ADDRESS}::tax_calculator::preview_tax_calculation`,
          functionArguments: [
            employeeAddr,
            amountOctas,
            Array.from(new TextEncoder().encode(selectedJurisdiction))
          ],
        },
      });

      if (Array.isArray(result) && result.length === 8) {
        setCalculationResult({
          grossAmount: Number(result[0]) / 1e8,
          federalTax: Number(result[1]) / 1e8,
          stateTax: Number(result[2]) / 1e8,
          socialSecurity: Number(result[3]) / 1e8,
          medicare: Number(result[4]) / 1e8,
          unemployment: Number(result[5]) / 1e8,
          totalTaxes: Number(result[6]) / 1e8,
          netAmount: Number(result[7]) / 1e8,
        });
        toast({ title: '✅ Tax Calculated', description: 'See breakdown below' });
      }
    } catch (error: any) {
      console.error('Tax calculation error:', error);
      toast({
        title: 'Calculation Failed',
        description: error?.message || 'Failed to calculate taxes',
        variant: 'destructive'
      });
    } finally {
      setCalculating(false);
    }
  };

  const updateTaxRate = async () => {
    if (!account || !editingJurisdiction) {
      toast({ title: 'Select jurisdiction', variant: 'destructive' });
      return;
    }

    const { federalRate, stateRate, socialSecurityRate, medicareRate, unemploymentRate } = taxRates;
    if (!federalRate || !socialSecurityRate || !medicareRate) {
      toast({ title: 'Enter all required rates', variant: 'destructive' });
      return;
    }

    setUpdatingRates(true);
    try {
      const response = await signAndSubmitTransaction({
        sender: account.address.toString(),
        data: {
          function: `${MODULE_ADDRESS}::tax_calculator::update_tax_rate`,
          functionArguments: [
            Array.from(new TextEncoder().encode(editingJurisdiction)),
            Math.round(Number(federalRate) * 100), // Convert to basis points
            Math.round(Number(stateRate || 0) * 100),
            Math.round(Number(socialSecurityRate) * 100),
            Math.round(Number(medicareRate) * 100),
            Math.round(Number(unemploymentRate || 0) * 100),
          ],
        },
      });

      await aptosClient().waitForTransaction({ transactionHash: response.hash });
      toast({
        title: '✅ Tax Rate Updated',
        description: `${editingJurisdiction} rates have been updated successfully.`
      });
      setEditingJurisdiction('');
      setTaxRates({ federalRate: '', stateRate: '', socialSecurityRate: '', medicareRate: '', unemploymentRate: '' });
      await checkTaxConfiguration();
    } catch (error: any) {
      console.error('Update tax rate error:', error);

      let errorTitle = 'Update Failed';
      let errorMessage = 'Failed to update tax rates';

      // Check for simulation errors (these happen BEFORE wallet popup)
      if (error?.message?.includes('MAX_GAS_UNITS_BELOW_MIN_TRANSACTION_GAS_UNITS')) {
        errorTitle = '💰 Insufficient Gas Funds';
        errorMessage = 'You need APT tokens in your wallet to pay for transaction gas fees. Please fund your wallet from the Aptos faucet first.';
      } else if (error?.message?.includes('INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE')) {
        errorTitle = '💰 Insufficient Balance';
        errorMessage = 'You don\'t have enough APT to pay for gas fees. Please add funds to your wallet from the faucet.';
      } else if (error?.message?.includes('User rejected') || error?.code === 4001) {
        // Silent - user cancelled on purpose
        setUpdatingRates(false);
        return;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setUpdatingRates(false);
    }
  };

  const loadYTDSummary = async () => {
    if (!employeeAddress) {
      toast({ title: 'Enter employee address', variant: 'destructive' });
      return;
    }

    setLoadingYTD(true);
    try {
      const result = await aptosClient().view({
        payload: {
          function: `${MODULE_ADDRESS}::tax_calculator::get_employee_ytd_summary`,
          functionArguments: [employeeAddress],
        },
      });

      if (Array.isArray(result) && result.length === 2) {
        setYtdSummary({
          gross: Number(result[0]) / 1e8,
          taxes: Number(result[1]) / 1e8,
        });
      }
    } catch (error: any) {
      console.error('YTD summary error:', error);
      toast({
        title: 'Failed to Load',
        description: error?.message || 'No tax records found for this employee',
        variant: 'destructive'
      });
      setYtdSummary(null);
    } finally {
      setLoadingYTD(false);
    }
  };

  const renderTaxCalculator = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-500" />
          Tax Calculator
        </CardTitle>
        <p className="text-sm text-gray-500">Preview tax calculations for employee payments</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Gross Amount (APT)</label>
            <Input
              type="number"
              placeholder="e.g., 1000"
              value={grossAmount}
              onChange={(e) => setGrossAmount(e.target.value)}
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tax Jurisdiction</label>
            <select
              className="w-full border rounded-md h-10 px-3 bg-white dark:bg-gray-800"
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
            >
              {TAX_JURISDICTIONS.map((j) => (
                <option key={j.code} value={j.code}>
                  {j.flag} {j.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={calculateTaxes} disabled={calculating} className="w-full">
          {calculating ? 'Calculating...' : 'Calculate Taxes'}
        </Button>

        {calculationResult && (
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Tax Breakdown
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gross Amount</span>
                <span className="font-semibold">₳{calculationResult.grossAmount.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-300 dark:border-gray-700 my-2"></div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Federal Tax</span>
                <span className="text-red-600">-₳{calculationResult.federalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">State Tax</span>
                <span className="text-red-600">-₳{calculationResult.stateTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Social Security</span>
                <span className="text-red-600">-₳{calculationResult.socialSecurity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Medicare</span>
                <span className="text-red-600">-₳{calculationResult.medicare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Unemployment</span>
                <span className="text-red-600">-₳{calculationResult.unemployment.toFixed(2)}</span>
              </div>

              <div className="border-t-2 border-gray-400 dark:border-gray-600 my-3"></div>

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Taxes</span>
                <span className="text-red-600">₳{calculationResult.totalTaxes.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-lg font-bold bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <span>Net Pay</span>
                <span className="text-green-600 dark:text-green-400">₳{calculationResult.netAmount.toFixed(2)}</span>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>Effective Tax Rate: {((calculationResult.totalTaxes / calculationResult.grossAmount) * 100).toFixed(2)}%</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTaxRatesManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-500" />
          Tax Rates Management
        </CardTitle>
        <p className="text-sm text-gray-500">Configure tax rates for different jurisdictions</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Jurisdiction</label>
          <select
            className="w-full border rounded-md h-10 px-3 bg-white dark:bg-gray-800"
            value={editingJurisdiction}
            onChange={(e) => setEditingJurisdiction(e.target.value)}
          >
            <option value="">-- Select Jurisdiction --</option>
            {TAX_JURISDICTIONS.map((j) => (
              <option key={j.code} value={j.code}>
                {j.flag} {j.name}
              </option>
            ))}
          </select>
        </div>

        {editingJurisdiction && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Federal Tax Rate (%)</label>
              <Input
                type="number"
                placeholder="e.g., 22"
                value={taxRates.federalRate}
                onChange={(e) => setTaxRates({ ...taxRates, federalRate: e.target.value })}
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State Tax Rate (%)</label>
              <Input
                type="number"
                placeholder="e.g., 5"
                value={taxRates.stateRate}
                onChange={(e) => setTaxRates({ ...taxRates, stateRate: e.target.value })}
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Social Security Rate (%)</label>
              <Input
                type="number"
                placeholder="e.g., 6.2"
                value={taxRates.socialSecurityRate}
                onChange={(e) => setTaxRates({ ...taxRates, socialSecurityRate: e.target.value })}
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Medicare Rate (%)</label>
              <Input
                type="number"
                placeholder="e.g., 1.45"
                value={taxRates.medicareRate}
                onChange={(e) => setTaxRates({ ...taxRates, medicareRate: e.target.value })}
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unemployment Rate (%)</label>
              <Input
                type="number"
                placeholder="e.g., 0.6"
                value={taxRates.unemploymentRate}
                onChange={(e) => setTaxRates({ ...taxRates, unemploymentRate: e.target.value })}
                step="0.01"
              />
            </div>
          </div>
        )}

        <Button onClick={updateTaxRate} disabled={!editingJurisdiction || updatingRates} className="w-full">
          {updatingRates ? 'Updating...' : 'Update Tax Rates'}
        </Button>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            Tax Rate Format
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter rates as percentages (e.g., 22 for 22%). The system will convert them to basis points automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderYTDSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-500" />
          Year-to-Date Tax Summary
        </CardTitle>
        <p className="text-sm text-gray-500">View employee tax summaries for the year</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Employee Address</label>
          <Input
            placeholder="0x..."
            value={employeeAddress}
            onChange={(e) => setEmployeeAddress(e.target.value)}
          />
        </div>

        <Button onClick={loadYTDSummary} disabled={loadingYTD} className="w-full">
          {loadingYTD ? 'Loading...' : 'Load YTD Summary'}
        </Button>

        {ytdSummary && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">YTD Gross Income</span>
              </div>
              <p className="text-3xl font-bold text-green-600">₳{ytdSummary.gross.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-red-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">YTD Total Taxes</span>
              </div>
              <p className="text-3xl font-bold text-red-600">₳{ytdSummary.taxes.toFixed(2)}</p>
            </div>

            <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Tax Rate</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {ytdSummary.gross > 0 ? ((ytdSummary.taxes / ytdSummary.gross) * 100).toFixed(2) : '0.00'}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderComplianceStatus = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-500" />
          Compliance Status
        </CardTitle>
        <p className="text-sm text-gray-500">Tax configuration and compliance overview</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!taxConfigInitialized ? (
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Tax Configuration Not Initialized</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Initialize your tax configuration to start using tax calculation features.
            </p>
            <Button onClick={initializeTaxConfig} disabled={checkingCompliance}>
              {checkingCompliance ? 'Initializing...' : 'Initialize Tax Configuration'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Tax Configuration Active</span>
            </div>

            <div>
              <h4 className="font-medium mb-3">Supported Jurisdictions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {supportedJurisdictions.map((code) => {
                  const jurisdiction = TAX_JURISDICTIONS.find((j) => j.code === code);
                  return (
                    <div
                      key={code}
                      className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{jurisdiction?.flag} {jurisdiction?.name || code}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Compliance Ready
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your payroll system is configured for tax compliance. You can now process payments with automatic tax calculations.
              </p>
            </div>

            <Button onClick={checkTaxConfiguration} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Refresh Configuration
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeSection === 'calculator' ? 'default' : 'outline'}
          onClick={() => setActiveSection('calculator')}
          className="flex items-center gap-2"
        >
          <Calculator className="h-4 w-4" />
          Tax Calculator
        </Button>
        <Button
          variant={activeSection === 'rates' ? 'default' : 'outline'}
          onClick={() => setActiveSection('rates')}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Manage Rates
        </Button>
        <Button
          variant={activeSection === 'ytd' ? 'default' : 'outline'}
          onClick={() => setActiveSection('ytd')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          YTD Summary
        </Button>
        <Button
          variant={activeSection === 'compliance' ? 'default' : 'outline'}
          onClick={() => setActiveSection('compliance')}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Compliance
        </Button>
      </div>

      {/* Active Section Content */}
      {activeSection === 'calculator' && renderTaxCalculator()}
      {activeSection === 'rates' && renderTaxRatesManagement()}
      {activeSection === 'ytd' && renderYTDSummary()}
      {activeSection === 'compliance' && renderComplianceStatus()}
    </div>
  );
}
