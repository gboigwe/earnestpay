import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Contract addresses - Updated with deployed contract
const PAYROLL_ADDRESS = '0xcc6e28e46af6c8bcc60a46ef75c500a618a56f29ff8023d9083bd12990a8c8e4';

// Initialize Aptos client
const config = new AptosConfig({ network: Network.DEVNET });
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
}

export const payrollService = new PayrollService();