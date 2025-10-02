import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { MODULE_ADDRESS } from '../../frontend/constants';

// Contract module address comes from frontend constants/env
const PAYROLL_ADDRESS = MODULE_ADDRESS;

// Initialize Aptos client (use Testnet)
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  salary: number;
  status: string;
  address: string;
}

export interface PaymentData {
  employeeAddress: string;
  amount: number;
  paymentType: string;
}

export interface CompanyData {
  name: string;
  treasuryBalance: number;
  employeeCount: number;
  isRegistered: boolean;
}

export class PayrollService {
  
  // Register a new company
  async registerCompany(account: any, companyName: string): Promise<any> {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${PAYROLL_ADDRESS}::payroll_manager::register_company`,
          functionArguments: [companyName]
        }
      });

      const senderAuthenticator = await aptos.transaction.sign({
        signer: account,
        transaction
      });

      const response = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    } catch (error) {
      console.error('Error registering company:', error);
      throw error;
    }
  }

  // Fund treasury
  async fundTreasury(account: any, amount: number): Promise<any> {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${PAYROLL_ADDRESS}::payroll_manager::fund_treasury`,
          functionArguments: [amount]
        }
      });

      const senderAuthenticator = await aptos.transaction.sign({
        signer: account,
        transaction
      });

      const response = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    } catch (error) {
      console.error('Error funding treasury:', error);
      throw error;
    }
  }

  // ================================
  // Employee Registry - Entry funcs
  // ================================

  // Initialize employee registry (idempotent)
  async initializeEmployeeRegistry(account: any): Promise<any> {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${PAYROLL_ADDRESS}::employee_registry::initialize_registry`,
          functionArguments: []
        }
      });

      const senderAuthenticator = await aptos.transaction.sign({
        signer: account,
        transaction
      });

      const response = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    } catch (error) {
      console.error('Error initializing employee registry:', error);
      throw error;
    }
  }

  // Add employee
  async addEmployee(account: any, employeeAddress: string): Promise<any> {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${PAYROLL_ADDRESS}::payroll_manager::add_employee`,
          functionArguments: [employeeAddress]
        }
      });

      const senderAuthenticator = await aptos.transaction.sign({
        signer: account,
        transaction
      });

      const response = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  }

  // Update employee salary
  async updateEmployeeSalary(account: any, employeeAddress: string, newSalary: number): Promise<any> {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${PAYROLL_ADDRESS}::employee_registry::update_employee_salary`,
          functionArguments: [employeeAddress, newSalary]
        }
      });

      const senderAuthenticator = await aptos.transaction.sign({
        signer: account,
        transaction
      });

      const response = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    } catch (error) {
      console.error('Error updating employee salary:', error);
      throw error;
    }
  }

  // Deactivate employee
  async deactivateEmployee(account: any, employeeAddress: string): Promise<any> {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${PAYROLL_ADDRESS}::employee_registry::deactivate_employee`,
          functionArguments: [employeeAddress]
        }
      });

      const senderAuthenticator = await aptos.transaction.sign({
        signer: account,
        transaction
      });

      const response = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    } catch (error) {
      console.error('Error deactivating employee:', error);
      throw error;
    }
  }

  // Process payment
  async processPayment(account: any, employeeAddress: string, amount: number): Promise<any> {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${PAYROLL_ADDRESS}::payroll_manager::process_payment`,
          functionArguments: [employeeAddress, amount]
        }
      });

      const senderAuthenticator = await aptos.transaction.sign({
        signer: account,
        transaction
      });

      const response = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Create employee profile
  async createEmployeeProfile(
    account: any,
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
  ): Promise<any> {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${PAYROLL_ADDRESS}::employee_registry::create_employee_profile`,
          functionArguments: [
            employeeAddress,
            employeeId,
            firstName,
            lastName,
            email,
            role,
            department,
            salary,
            managerAddress,
            taxJurisdiction,
            paymentAddress
          ]
        }
      });

      const senderAuthenticator = await aptos.transaction.sign({
        signer: account,
        transaction
      });

      const response = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    } catch (error) {
      console.error('Error creating employee profile:', error);
      throw error;
    }
  }

  // ================================
  // Employee Registry - View funcs
  // ================================

  // Get company info
  async getCompanyInfo(companyAddress: string): Promise<any> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::payroll_manager::get_company_info`,
          functionArguments: [companyAddress]
        }
      });
      return response;
    } catch (error) {
      console.error('Error getting company info:', error);
      return null;
    }
  }

  // Get treasury balance
  async getTreasuryBalance(companyAddress: string): Promise<number> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::payroll_manager::get_treasury_balance`,
          functionArguments: [companyAddress]
        }
      });
      return response[0] as number;
    } catch (error) {
      console.error('Error getting treasury balance:', error);
      return 0;
    }
  }

  // Check if address is employee
  async isEmployee(companyAddress: string, employeeAddress: string): Promise<boolean> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::payroll_manager::is_employee`,
          functionArguments: [companyAddress, employeeAddress]
        }
      });
      return response[0] as boolean;
    } catch (error) {
      console.error('Error checking employee status:', error);
      return false;
    }
  }

  // Get employee profile
  async getEmployeeProfile(companyAddress: string, employeeAddress: string): Promise<any> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::employee_registry::get_employee_profile`,
          functionArguments: [companyAddress, employeeAddress]
        }
      });
      return response;
    } catch (error) {
      console.error('Error getting employee profile:', error);
      return null;
    }
  }

  // Get employee salary
  async getEmployeeSalary(employeeAddress: string): Promise<number> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::employee_registry::get_employee_salary`,
          functionArguments: [employeeAddress]
        }
      });
      return response[0] as number;
    } catch (error) {
      console.error('Error getting employee salary:', error);
      return 0;
    }
  }

  // Get employee role
  async getEmployeeRole(employeeAddress: string): Promise<number> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::employee_registry::get_employee_role`,
          functionArguments: [employeeAddress]
        }
      });
      return response[0] as number;
    } catch (error) {
      console.error('Error getting employee role:', error);
      return 0;
    }
  }

  // Is employee active
  async isEmployeeActive(employeeAddress: string): Promise<boolean> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::employee_registry::is_employee_active`,
          functionArguments: [employeeAddress]
        }
      });
      return response[0] as boolean;
    } catch (error) {
      console.error('Error checking if employee is active:', error);
      return false;
    }
  }

  // Get company employee count
  async getCompanyEmployeeCount(companyAddress: string): Promise<number> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::employee_registry::get_company_employee_count`,
          functionArguments: [companyAddress]
        }
      });
      return response[0] as number;
    } catch (error) {
      console.error('Error getting company employee count:', error);
      return 0;
    }
  }

  // Is manager or above
  async isManagerOrAbove(employeeAddress: string): Promise<boolean> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::employee_registry::is_manager_or_above`,
          functionArguments: [employeeAddress]
        }
      });
      return response[0] as boolean;
    } catch (error) {
      console.error('Error checking if manager or above:', error);
      return false;
    }
  }

  // Can manage payroll
  async canManagePayroll(employeeAddress: string): Promise<boolean> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::employee_registry::can_manage_payroll`,
          functionArguments: [employeeAddress]
        }
      });
      return response[0] as boolean;
    } catch (error) {
      console.error('Error checking payroll management permission:', error);
      return false;
    }
  }

  // Calculate taxes preview
  async previewTaxCalculation(
    employeeAddress: string,
    grossAmount: number,
    jurisdictionCode: string
  ): Promise<any> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::tax_calculator::preview_tax_calculation`,
          functionArguments: [employeeAddress, grossAmount, jurisdictionCode]
        }
      });
      return response;
    } catch (error) {
      console.error('Error previewing tax calculation:', error);
      return null;
    }
  }

  // ================================
  // Payment Scheduler - Entry funcs
  // ================================

  // Initialize payment scheduler (idempotent)
  async initializeScheduler(account: any): Promise<any> {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${PAYROLL_ADDRESS}::payment_scheduler::initialize_scheduler`,
          functionArguments: []
        }
      });

      const senderAuthenticator = await aptos.transaction.sign({
        signer: account,
        transaction
      });

      const response = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    } catch (error) {
      console.error('Error initializing scheduler:', error);
      throw error;
    }
  }

  // Create payment schedule
  async createPaymentSchedule(
    account: any,
    employeeAddress: string,
    paymentType: number,
    frequency: number,
    amount: number,
    startDate: number
  ): Promise<any> {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${PAYROLL_ADDRESS}::payment_scheduler::create_payment_schedule`,
          functionArguments: [employeeAddress, paymentType, frequency, amount, startDate]
        }
      });

      const senderAuthenticator = await aptos.transaction.sign({
        signer: account,
        transaction
      });

      const response = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    } catch (error) {
      console.error('Error creating payment schedule:', error);
      throw error;
    }
  }

  // Update schedule amount
  async updateScheduleAmount(account: any, scheduleId: number, newAmount: number): Promise<any> {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${PAYROLL_ADDRESS}::payment_scheduler::update_schedule_amount`,
          functionArguments: [scheduleId, newAmount]
        }
      });

      const senderAuthenticator = await aptos.transaction.sign({
        signer: account,
        transaction
      });

      const response = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    } catch (error) {
      console.error('Error updating schedule amount:', error);
      throw error;
    }
  }

  // Deactivate schedule
  async deactivateSchedule(account: any, scheduleId: number): Promise<any> {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${PAYROLL_ADDRESS}::payment_scheduler::deactivate_schedule`,
          functionArguments: [scheduleId]
        }
      });

      const senderAuthenticator = await aptos.transaction.sign({
        signer: account,
        transaction
      });

      const response = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    } catch (error) {
      console.error('Error deactivating schedule:', error);
      throw error;
    }
  }

  // Execute due payments
  async executeDuePayments(account: any): Promise<any> {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${PAYROLL_ADDRESS}::payment_scheduler::execute_due_payments`,
          functionArguments: []
        }
      });

      const senderAuthenticator = await aptos.transaction.sign({
        signer: account,
        transaction
      });

      const response = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    } catch (error) {
      console.error('Error executing due payments:', error);
      throw error;
    }
  }

  // ================================
  // Payment Scheduler - View funcs
  // ================================

  // Get payment schedule details
  async getPaymentSchedule(companyAddress: string, scheduleId: number): Promise<any> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::payment_scheduler::get_payment_schedule`,
          functionArguments: [companyAddress, scheduleId]
        }
      });
      return response;
    } catch (error) {
      console.error('Error getting payment schedule:', error);
      return null;
    }
  }

  // Get active schedules count for an employee
  async getEmployeeSchedulesCount(companyAddress: string, employeeAddress: string): Promise<number> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::payment_scheduler::get_employee_schedules_count`,
          functionArguments: [companyAddress, employeeAddress]
        }
      });
      return response[0] as number;
    } catch (error) {
      console.error('Error getting employee schedules count:', error);
      return 0;
    }
  }

  // Get due payments count for the company
  async getDuePaymentsCount(companyAddress: string): Promise<number> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::payment_scheduler::get_due_payments_count`,
          functionArguments: [companyAddress]
        }
      });
      return response[0] as number;
    } catch (error) {
      console.error('Error getting due payments count:', error);
      return 0;
    }
  }

  // Get total schedules count for the company
  async getTotalSchedulesCount(companyAddress: string): Promise<number> {
    try {
      const response = await aptos.view({
        payload: {
          function: `${PAYROLL_ADDRESS}::payment_scheduler::get_total_schedules_count`,
          functionArguments: [companyAddress]
        }
      });
      return response[0] as number;
    } catch (error) {
      console.error('Error getting total schedules count:', error);
      return 0;
    }
  }
}

export const payrollService = new PayrollService();