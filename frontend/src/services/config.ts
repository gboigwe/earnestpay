// Centralized configuration for deployed Aptos modules
// Reads from both CRA-style and Vite-style environment variables

export const MODULE_ADDRESS: string =
  (process.env.REACT_APP_MODULE_ADDR || process.env.VITE_MODULE_ADDR || '').trim() ||
  '0xcc6e28e46af6c8bcc60a46ef75c500a618a56f29ff8023d9083bd12990a8c8e4';

export const APTOS_NETWORK: string = (process.env.REACT_APP_APTOS_NETWORK || process.env.VITE_APTOS_NETWORK || 'devnet').toLowerCase();

// Fully qualified module IDs
export const MODULES: {
  payrollManager: `${string}::${string}`;
  employeeRegistry: `${string}::${string}`;
  paymentScheduler: `${string}::${string}`;
  taxCalculator: `${string}::${string}`;
} = {
  payrollManager: `${MODULE_ADDRESS}::payroll_manager`,
  employeeRegistry: `${MODULE_ADDRESS}::employee_registry`,
  paymentScheduler: `${MODULE_ADDRESS}::payment_scheduler`,
  taxCalculator: `${MODULE_ADDRESS}::tax_calculator`,
};

// Helper to build function identifiers
export const fn = (
  moduleId: `${string}::${string}`,
  name: string
): `${string}::${string}::${string}` => `${moduleId}::${name}` as `${string}::${string}::${string}`;
