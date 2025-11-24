import { useContractRead, useContractWrite, useAccount } from 'wagmi';
import { PAYROLL_CONTRACT_ABI } from './abis';
import { PAYROLL_CONTRACTS } from '../config/contracts';
import { Address } from 'viem';

export const useEVMPayroll = (chainId: number) => {
  const { address } = useAccount();
  
  // Get contract address based on chainId
  const getContractAddress = (): Address => {
    const chainConfig = Object.entries(PAYROLL_CONTRACTS).find(
      ([_, config]) => config.chainId === chainId
    )?.[1];
    
    if (!chainConfig) {
      throw new Error(`No contract address found for chainId: ${chainId}`);
    }
    
    return chainConfig.address as Address;
  };

  // Read company data
  const { data: company, isLoading: isLoadingCompany } = useContractRead({
    address: getContractAddress(),
    abi: PAYROLL_CONTRACT_ABI,
    functionName: 'getCompany',
    args: [address],
    enabled: !!address,
  });
  
  // Add employee
  const { write: addEmployee, isLoading: isAddingEmployee } = useContractWrite({
    address: getContractAddress(),
    abi: PAYROLL_CONTRACT_ABI,
    functionName: 'addEmployee',
  });
  
  // Process payment
  const { write: processPayment, isLoading: isProcessingPayment } = useContractWrite({
    address: getContractAddress(),
    abi: PAYROLL_CONTRACT_ABI,
    functionName: 'processPayment',
  });
  
  // Batch process payments
  const { write: batchProcessPayments, isLoading: isBatchProcessing } = useContractWrite({
    address: getContractAddress(),
    abi: PAYROLL_CONTRACT_ABI,
    functionName: 'batchProcessPayments',
  });
  
  // Withdraw from treasury
  const { write: withdrawFromTreasury, isLoading: isWithdrawing } = useContractWrite({
    address: getContractAddress(),
    abi: PAYROLL_CONTRACT_ABI,
    functionName: 'withdrawFromTreasury',
  });

  return {
    // Company
    company,
    isLoadingCompany,
    
    // Employee management
    addEmployee: (employee: any) => addEmployee({ args: [employee] }),
    isAddingEmployee,
    
    // Payment processing
    processPayment: (employeeId: string, amount: bigint) => 
      processPayment({ args: [employeeId, amount] }),
    isProcessingPayment,
    
    batchProcessPayments: (employeeIds: string[], amounts: bigint[]) => 
      batchProcessPayments({ args: [employeeIds, amounts] }),
    isBatchProcessing,
    
    // Treasury
    withdrawFromTreasury: (amount: bigint) => 
      withdrawFromTreasury({ args: [amount] }),
    isWithdrawing,
  };
};

export default useEVMPayroll;
