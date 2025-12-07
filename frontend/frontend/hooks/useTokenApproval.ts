/**
 * Token Approval Hook
 * React hook for managing token approvals
 */

import { useState, useCallback } from 'react';
import { useWalletClient } from 'wagmi';
import { tokenApprovalService } from '../services/tokenApproval';
import { toast } from '@/components/ui/use-toast';

export const useTokenApproval = () => {
  const [isApproving, setIsApproving] = useState(false);
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const { data: walletClient } = useWalletClient();

  const checkAllowance = useCallback(
    async (tokenAddress: string, owner: string, spender: string, rpcUrl: string) => {
      try {
        const result = await tokenApprovalService.checkAllowance(
          tokenAddress,
          owner,
          spender,
          rpcUrl
        );
        setAllowance(result);
        return result;
      } catch (error) {
        console.error('Failed to check allowance:', error);
        return BigInt(0);
      }
    },
    []
  );

  const approve = useCallback(
    async (tokenAddress: string, spender: string, amount: bigint) => {
      if (!walletClient) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet first',
          variant: 'destructive',
        });
        return null;
      }

      setIsApproving(true);
      try {
        const hash = await tokenApprovalService.approve(
          tokenAddress,
          spender,
          amount,
          walletClient
        );

        toast({
          title: 'Approval Submitted',
          description: 'Token approval transaction submitted',
        });

        return hash;
      } catch (error: any) {
        toast({
          title: 'Approval Failed',
          description: error.message || 'Failed to approve token',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsApproving(false);
      }
    },
    [walletClient]
  );

  const approveMax = useCallback(
    async (tokenAddress: string, spender: string) => {
      if (!walletClient) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet first',
          variant: 'destructive',
        });
        return null;
      }

      setIsApproving(true);
      try {
        const hash = await tokenApprovalService.approveMax(
          tokenAddress,
          spender,
          walletClient
        );

        toast({
          title: 'Max Approval Submitted',
          description: 'Maximum token approval granted',
        });

        return hash;
      } catch (error: any) {
        toast({
          title: 'Approval Failed',
          description: error.message || 'Failed to approve token',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsApproving(false);
      }
    },
    [walletClient]
  );

  return {
    isApproving,
    allowance,
    checkAllowance,
    approve,
    approveMax,
  };
};
