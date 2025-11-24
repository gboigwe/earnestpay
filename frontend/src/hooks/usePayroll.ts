import { useCallback, useMemo } from 'react';
import { useChainId } from 'wagmi';
import { useAptosPayroll } from '../adapters/AptosPayrollAdapter';
import { useEVMPayroll } from '../adapters/EVMPayrollAdapter';
import { getContractConfig } from '../config/contracts';

// Types
type PayrollAdapter = {
  // Company
  company: any;
  isLoadingCompany: boolean;
  
  // Employee management
  addEmployee: (employee: any) => Promise<{ hash: string }>;
  isAddingEmployee: boolean;
  
  // Payment processing
  processPayment: (employeeId: string, amount: bigint) => Promise<{ hash: string }>;
  isProcessingPayment: boolean;
  
  batchProcessPayments: (employeeIds: string[], amounts: bigint[]) => Promise<{ hash: string }>;
  isBatchProcessing: boolean;
  
  // Treasury
  withdrawFromTreasury: (amount: bigint) => Promise<{ hash: string }>;
  isWithdrawing: boolean;
};

export const usePayroll = (): PayrollAdapter => {
  const chainId = useChainId();
  
  // Get the appropriate adapter based on the current chain
  const isAptos = useMemo(() => {
    const config = getContractConfig(chainId);
    return config?.name.toLowerCase().includes('aptos');
  }, [chainId]);
  
  const aptosPayroll = useAptosPayroll();
  const evmPayroll = useEVMPayroll(chainId);
  
  // Return the appropriate adapter based on the chain
  const getAdapter = useCallback((): PayrollAdapter => {
    if (isAptos) {
      return {
        company: aptosPayroll.company,
        isLoadingCompany: aptosPayroll.isLoadingCompany,
        addEmployee: aptosPayroll.addEmployee,
        isAddingEmployee: aptosPayroll.isAddingEmployee,
        processPayment: aptosPayroll.processPayment,
        isProcessingPayment: aptosPayroll.isProcessingPayment,
        batchProcessPayments: aptosPayroll.batchProcessPayments,
        isBatchProcessing: aptosPayroll.isBatchProcessing,
        withdrawFromTreasury: aptosPayroll.withdrawFromTreasury,
        isWithdrawing: aptosPayroll.isWithdrawing,
      };
    }
    
    // Default to EVM adapter
    return {
      company: evmPayroll.company,
      isLoadingCompany: evmPayroll.isLoadingCompany,
      addEmployee: evmPayroll.addEmployee,
      isAddingEmployee: evmPayroll.isAddingEmployee,
      processPayment: evmPayroll.processPayment,
      isProcessingPayment: evmPayroll.isProcessingPayment,
      batchProcessPayments: evmPayroll.batchProcessPayments,
      isBatchProcessing: evmPayroll.isBatchProcessing,
      withdrawFromTreasury: evmPayroll.withdrawFromTreasury,
      isWithdrawing: evmPayroll.isWithdrawing,
    };
  }, [isAptos, aptosPayroll, evmPayroll]);
  
  return getAdapter();
};

export default usePayroll;
