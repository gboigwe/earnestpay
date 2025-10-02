// Type definitions for surfClient with useABI support
import { Aptos } from '@aptos-labs/ts-sdk';

declare module '@aptos-labs/ts-sdk' {
  interface Aptos {
    useABI(abi: any): any;
  }
}
