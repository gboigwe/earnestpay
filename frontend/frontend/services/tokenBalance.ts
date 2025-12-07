/**
 * Token Balance Service
 * Fetches and manages token balances on Base
 */

import { formatUnits } from 'viem';
import { Token } from '../config/tokens.config';

export class TokenBalanceService {
  async getBalance(
    tokenAddress: string,
    userAddress: string,
    rpcUrl: string,
    decimals: number
  ): Promise<{ raw: bigint; formatted: string }> {
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      return this.getNativeBalance(userAddress, rpcUrl, decimals);
    }

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: tokenAddress,
            data: this.encodeBalanceOf(userAddress),
          },
          'latest',
        ],
        id: 1,
      }),
    });

    const data = await response.json();
    const raw = BigInt(data.result || '0');
    const formatted = formatUnits(raw, decimals);

    return { raw, formatted };
  }

  async getNativeBalance(
    userAddress: string,
    rpcUrl: string,
    decimals: number = 18
  ): Promise<{ raw: bigint; formatted: string }> {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [userAddress, 'latest'],
        id: 1,
      }),
    });

    const data = await response.json();
    const raw = BigInt(data.result || '0');
    const formatted = formatUnits(raw, decimals);

    return { raw, formatted };
  }

  async getMultipleBalances(
    tokens: Token[],
    userAddress: string,
    rpcUrl: string
  ): Promise<Map<string, { raw: bigint; formatted: string }>> {
    const balances = new Map();

    await Promise.all(
      tokens.map(async (token) => {
        try {
          const balance = await this.getBalance(
            token.address,
            userAddress,
            rpcUrl,
            token.decimals
          );
          balances.set(token.symbol, balance);
        } catch (error) {
          console.error(`Failed to fetch balance for ${token.symbol}:`, error);
          balances.set(token.symbol, { raw: BigInt(0), formatted: '0' });
        }
      })
    );

    return balances;
  }

  private encodeBalanceOf(address: string): string {
    const functionSelector = '0x70a08231';
    const addressPadded = address.slice(2).padStart(64, '0');
    return `${functionSelector}${addressPadded}`;
  }

  formatBalance(balance: string, maxDecimals: number = 6): string {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.000001) return '< 0.000001';
    return num.toFixed(maxDecimals).replace(/\.?0+$/, '');
  }
}

export const tokenBalanceService = new TokenBalanceService();
