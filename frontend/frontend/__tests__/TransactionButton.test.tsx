import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TransactionButton } from "@/components/TransactionButton";
import { useAccount } from 'wagmi';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

// Mock the hooks and components
vi.mock('wagmi', () => ({
  useAccount: vi.fn()
}));

vi.mock('@aptos-labs/wallet-adapter-react', () => ({
  useWallet: vi.fn()
}));

vi.mock('@/hooks/useTransactionCost', () => ({
  useTransactionCost: () => ({
    estimateGas: vi.fn(),
    loading: false
  })
}));

describe("TransactionButton", () => {
  const mockEstimateGas = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  
  const defaultProps = {
    transaction: {
      to: '0x1234',
      value: '1000000000000000000', // 1 ETH
      data: '0x'
    },
    onSuccess: mockOnSuccess,
    onError: mockOnError,
    children: 'Send Transaction'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    (useAccount as jest.Mock).mockReturnValue({ 
      address: '0x1234567890abcdef1234567890abcdef12345678' 
    });
    
    (useWallet as jest.Mock).mockReturnValue({ 
      account: { address: '0x1234567890abcdef1234567890abcdef12345678' } 
    });
    
    mockEstimateGas.mockResolvedValue({
      gasFee: '0.001',
      gasFeeUSD: '3.50',
      gasPrice: '1000000000',
      gasLimit: '21000',
      loading: false,
      error: null
    });
  });

  it("renders button with children", () => {
    render(<TransactionButton {...defaultProps} />);
    expect(screen.getByText('Send Transaction')).toBeInTheDocument();
  });

  it("shows loading state when pending", async () => {
    render(<TransactionButton {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // The button should show loading state
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it("calls onSuccess when transaction succeeds", async () => {
    render(<TransactionButton {...defaultProps} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    // In a real test, we would mock the transaction execution here
    // and verify that onSuccess was called with the expected result
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("calls onError when transaction fails", async () => {
    const error = new Error('Transaction failed');
    mockEstimateGas.mockRejectedValueOnce(error);
    
    render(<TransactionButton {...defaultProps} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  it("is disabled when no transaction is provided", () => {
    render(<TransactionButton {...defaultProps} transaction={undefined} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it("shows gas estimate when showGasEstimate is true", async () => {
    render(<TransactionButton {...defaultProps} showGasEstimate={true} />);
    
    // Wait for gas estimate to be loaded
    await waitFor(() => {
      expect(screen.getByText(/0.001/)).toBeInTheDocument();
    });
  });

  it("hides gas estimate when showGasEstimate is false", () => {
    render(<TransactionButton {...defaultProps} showGasEstimate={false} />);
    
    // The gas estimate should not be in the document
    expect(screen.queryByText(/0.001/)).not.toBeInTheDocument();
  });
});
