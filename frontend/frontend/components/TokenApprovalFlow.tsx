/**
 * Token Approval Flow Component
 * Handles token approval UI and flow
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useTokenApproval } from '@/hooks/useTokenApproval';
import { BASE_TOKENS } from '@/config/tokens.config';

interface TokenApprovalFlowProps {
  tokenSymbol: string;
  spenderAddress: string;
  amount: string;
  onApprovalComplete?: () => void;
}

export const TokenApprovalFlow = ({
  tokenSymbol,
  spenderAddress,
  amount,
  onApprovalComplete,
}: TokenApprovalFlowProps) => {
  const [isApproved, setIsApproved] = useState(false);
  const { isApproving, approve, approveMax } = useTokenApproval();

  const token = BASE_TOKENS.find(t => t.symbol === tokenSymbol);

  if (!token) return null;

  const handleApprove = async () => {
    const amountBigInt = BigInt(parseFloat(amount) * 10 ** token.decimals);
    const hash = await approve(token.address, spenderAddress, amountBigInt);
    
    if (hash) {
      setIsApproved(true);
      onApprovalComplete?.();
    }
  };

  const handleApproveMax = async () => {
    const hash = await approveMax(token.address, spenderAddress);
    
    if (hash) {
      setIsApproved(true);
      onApprovalComplete?.();
    }
  };

  if (isApproved) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
      >
        <CheckCircle className="text-green-400" size={20} />
        <span className="text-green-400 font-medium">Token Approved</span>
      </motion.div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h4 className="text-white font-semibold mb-3">Approve {token.symbol}</h4>
      <p className="text-gray-400 text-sm mb-4">
        Allow the contract to spend your {token.symbol} tokens
      </p>

      <div className="flex gap-3">
        <motion.button
          onClick={handleApprove}
          disabled={isApproving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
        >
          {isApproving ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span className="text-white text-sm">Approving...</span>
            </>
          ) : (
            <span className="text-white text-sm">Approve {amount}</span>
          )}
        </motion.button>

        <motion.button
          onClick={handleApproveMax}
          disabled={isApproving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 rounded-lg transition-colors"
        >
          <span className="text-white text-sm">Max</span>
        </motion.button>
      </div>
    </div>
  );
};
