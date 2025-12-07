/**
 * Token Approval Service
 * Handles ERC20 token approvals for Base network
 */

import { parseUnits, formatUnits } from 'viem';

const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export class TokenApprovalService {
  async checkAllowance(
    tokenAddress: string,
    owner: string,
    spender: string,
    rpcUrl: string
  ): Promise<bigint> {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: tokenAddress,
            data: this.encodeAllowance(owner, spender),
          },
          'latest',
        ],
        id: 1,
      }),
    });

    const data = await response.json();
    return BigInt(data.result || '0');
  }

  async approve(
    tokenAddress: string,
    spender: string,
    amount: bigint,
    walletClient: any
  ): Promise<string> {
    const hash = await walletClient.writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, amount],
    });

    return hash;
  }

  async approveMax(
    tokenAddress: string,
    spender: string,
    walletClient: any
  ): Promise<string> {
    const maxAmount = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    return this.approve(tokenAddress, spender, maxAmount, walletClient);
  }

  private encodeAllowance(owner: string, spender: string): string {
    const functionSelector = '0xdd62ed3e';
    const ownerPadded = owner.slice(2).padStart(64, '0');
    const spenderPadded = spender.slice(2).padStart(64, '0');
    return `${functionSelector}${ownerPadded}${spenderPadded}`;
  }

  needsApproval(allowance: bigint, requiredAmount: bigint): boolean {
    return allowance < requiredAmount;
  }

  formatAllowance(allowance: bigint, decimals: number): string {
    return formatUnits(allowance, decimals);
  }

  parseAmount(amount: string, decimals: number): bigint {
    return parseUnits(amount, decimals);
  }
}

export const tokenApprovalService = new TokenApprovalService();
