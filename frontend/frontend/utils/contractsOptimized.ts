/**
 * Optimized contract utilities for Base blockchain
 * Gas-optimized contract interaction functions
 */

import {
  type PublicClient,
  type WalletClient,
  type Address,
  encodeFunctionData,
  parseAbi,
  formatEther,
} from 'viem';
import { getOptimizedGasLimit } from './gas';

// Contract addresses (from environment variables)
export const PAYROLL_CONTRACT_ADDRESS = (import.meta.env.VITE_PAYROLL_CONTRACT_ADDRESS || '') as Address;
export const TAX_CONTRACT_ADDRESS = (import.meta.env.VITE_TAX_CONTRACT_ADDRESS || '') as Address;

// Optimized ABIs with proper typing
export const PAYROLL_MANAGER_ABI = parseAbi([
  'function registerCompany(string _companyName) external',
  'function createEmployee(address _employeeAddress, string _firstName, string _lastName, string _email, uint8 _role, string _department, uint256 _monthlySalary, address _managerAddress, string _taxJurisdiction, address _paymentAddress) external',
  'function updateEmployeeSalary(address _employeeAddress, uint256 _newSalary) external',
  'function deactivateEmployee(address _employeeAddress) external',
  'function processPayment(address _employeeAddress, uint256 _amount, string _paymentType) external payable',
  'function processBatchPayments(address[] _employees, uint256[] _amounts, string _paymentType) external payable',
  'function getCompanyInfo(address _company) external view returns (tuple(string name, address companyAddress, uint256 registeredAt, bool isRegistered))',
  'function isCompanyRegistered(address _company) external view returns (bool)',
  'function getCompanyEmployeeCount(address _company) external view returns (uint256)',
]);

export const TAX_COMPLIANCE_ABI = parseAbi([
  'function configureTaxRates(string _jurisdiction, uint256 _federalRate, uint256 _stateRate, uint256 _socialSecurityRate, uint256 _medicareRate, uint256 _unemploymentRate) external',
  'function calculateTax(string _jurisdiction, uint256 _grossAmount) external view returns (tuple(uint256 grossAmount, uint256 federalTax, uint256 stateTax, uint256 socialSecurityTax, uint256 medicareTax, uint256 totalTax, uint256 netAmount))',
  'function getTaxRates(address _company, string _jurisdiction) external view returns (tuple(uint256 federalRate, uint256 stateRate, uint256 socialSecurityRate, uint256 medicareRate, uint256 unemploymentRate))',
]);

export interface GasEstimate {
  gasLimit: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedCost: bigint;
}

export interface TransactionOptions {
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

/**
 * Estimate gas for a contract write operation
 */
export async function estimateContractGas(
  publicClient: PublicClient,
  address: Address,
  abi: typeof PAYROLL_MANAGER_ABI | typeof TAX_COMPLIANCE_ABI,
  functionName: string,
  args: any[],
  account: Address,
  value?: bigint
): Promise<bigint> {
  try {
    const gas = await publicClient.estimateContractGas({
      address,
      abi,
      functionName,
      args,
      account,
      value,
    });

    // Add 10% buffer for safety
    return getOptimizedGasLimit(gas);
  } catch (error) {
    console.error('Gas estimation failed:', error);
    // Return a reasonable default for Base (operations are usually cheap)
    return BigInt(200000);
  }
}

/**
 * Register company with gas optimization
 */
export async function registerCompanyOptimized(
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Address,
  companyName: string,
  options?: TransactionOptions
): Promise<{ hash: Address; gasUsed: bigint }> {
  const args = [companyName];

  // Estimate gas if not provided
  const gasLimit = options?.gasLimit || await estimateContractGas(
    publicClient,
    PAYROLL_CONTRACT_ADDRESS,
    PAYROLL_MANAGER_ABI,
    'registerCompany',
    args,
    account
  );

  // Execute transaction
  const hash = await walletClient.writeContract({
    address: PAYROLL_CONTRACT_ADDRESS,
    abi: PAYROLL_MANAGER_ABI,
    functionName: 'registerCompany',
    args,
    account,
    gas: gasLimit,
    maxFeePerGas: options?.maxFeePerGas,
    maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
  });

  // Wait for receipt to get actual gas used
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return {
    hash,
    gasUsed: receipt.gasUsed,
  };
}

/**
 * Create employee with gas optimization
 */
export async function createEmployeeOptimized(
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Address,
  employeeData: {
    employeeAddress: Address;
    firstName: string;
    lastName: string;
    email: string;
    role: number;
    department: string;
    monthlySalary: bigint;
    managerAddress: Address;
    taxJurisdiction: string;
    paymentAddress: Address;
  },
  options?: TransactionOptions
): Promise<{ hash: Address; gasUsed: bigint }> {
  const args = [
    employeeData.employeeAddress,
    employeeData.firstName,
    employeeData.lastName,
    employeeData.email,
    employeeData.role,
    employeeData.department,
    employeeData.monthlySalary,
    employeeData.managerAddress,
    employeeData.taxJurisdiction,
    employeeData.paymentAddress,
  ];

  const gasLimit = options?.gasLimit || await estimateContractGas(
    publicClient,
    PAYROLL_CONTRACT_ADDRESS,
    PAYROLL_MANAGER_ABI,
    'createEmployee',
    args,
    account
  );

  const hash = await walletClient.writeContract({
    address: PAYROLL_CONTRACT_ADDRESS,
    abi: PAYROLL_MANAGER_ABI,
    functionName: 'createEmployee',
    args,
    account,
    gas: gasLimit,
    maxFeePerGas: options?.maxFeePerGas,
    maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return {
    hash,
    gasUsed: receipt.gasUsed,
  };
}

/**
 * Process batch payments with gas optimization
 * This is the most gas-efficient way to pay multiple employees
 */
export async function processBatchPaymentsOptimized(
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Address,
  employees: Address[],
  amounts: bigint[],
  paymentType: string,
  options?: TransactionOptions
): Promise<{ hash: Address; gasUsed: bigint; gasPerEmployee: bigint }> {
  if (employees.length !== amounts.length) {
    throw new Error('Employees and amounts arrays must have the same length');
  }

  const args = [employees, amounts, paymentType];
  const totalAmount = amounts.reduce((acc, amount) => acc + amount, BigInt(0));

  const gasLimit = options?.gasLimit || await estimateContractGas(
    publicClient,
    PAYROLL_CONTRACT_ADDRESS,
    PAYROLL_MANAGER_ABI,
    'processBatchPayments',
    args,
    account,
    totalAmount
  );

  const hash = await walletClient.writeContract({
    address: PAYROLL_CONTRACT_ADDRESS,
    abi: PAYROLL_MANAGER_ABI,
    functionName: 'processBatchPayments',
    args,
    account,
    value: totalAmount,
    gas: gasLimit,
    maxFeePerGas: options?.maxFeePerGas,
    maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return {
    hash,
    gasUsed: receipt.gasUsed,
    gasPerEmployee: receipt.gasUsed / BigInt(employees.length),
  };
}

/**
 * Update employee salary with gas optimization
 */
export async function updateEmployeeSalaryOptimized(
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Address,
  employeeAddress: Address,
  newSalary: bigint,
  options?: TransactionOptions
): Promise<{ hash: Address; gasUsed: bigint }> {
  const args = [employeeAddress, newSalary];

  const gasLimit = options?.gasLimit || await estimateContractGas(
    publicClient,
    PAYROLL_CONTRACT_ADDRESS,
    PAYROLL_MANAGER_ABI,
    'updateEmployeeSalary',
    args,
    account
  );

  const hash = await walletClient.writeContract({
    address: PAYROLL_CONTRACT_ADDRESS,
    abi: PAYROLL_MANAGER_ABI,
    functionName: 'updateEmployeeSalary',
    args,
    account,
    gas: gasLimit,
    maxFeePerGas: options?.maxFeePerGas,
    maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return {
    hash,
    gasUsed: receipt.gasUsed,
  };
}

/**
 * Check if company is registered (read-only, no gas cost)
 */
export async function isCompanyRegistered(
  publicClient: PublicClient,
  companyAddress: Address
): Promise<boolean> {
  try {
    const result = await publicClient.readContract({
      address: PAYROLL_CONTRACT_ADDRESS,
      abi: PAYROLL_MANAGER_ABI,
      functionName: 'isCompanyRegistered',
      args: [companyAddress],
    });
    return result as boolean;
  } catch (error) {
    console.error('Error checking company registration:', error);
    return false;
  }
}

/**
 * Calculate tax (read-only, no gas cost)
 */
export async function calculateTax(
  publicClient: PublicClient,
  companyAddress: Address,
  jurisdiction: string,
  grossAmount: bigint
): Promise<{
  grossAmount: bigint;
  federalTax: bigint;
  stateTax: bigint;
  socialSecurityTax: bigint;
  medicareTax: bigint;
  totalTax: bigint;
  netAmount: bigint;
} | null> {
  try {
    const result = await publicClient.readContract({
      address: TAX_CONTRACT_ADDRESS,
      abi: TAX_COMPLIANCE_ABI,
      functionName: 'calculateTax',
      args: [jurisdiction, grossAmount],
    });
    return result as any;
  } catch (error) {
    console.error('Error calculating tax:', error);
    return null;
  }
}
