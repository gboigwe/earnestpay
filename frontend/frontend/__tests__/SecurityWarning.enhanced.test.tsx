import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { SecurityWarning, analyzeTransaction } from "@/components/SecurityWarning"
import '@testing-library/jest-dom'

// Mock console.log to keep test output clean
console.log = vi.fn()

describe("Enhanced SecurityWarning", () => {
  const mockTransaction = {
    data: "0x095ea7b30000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    to: "0x1234567890abcdef1234567890abcdef12345678",
    gasPrice: "100000000000" // 100 Gwei
  }

  const mockOnDismiss = vi.fn()
  const mockOnLearnMore = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders warning for unlimited approval", () => {
    render(<SecurityWarning transaction={mockTransaction} />)
    
    expect(screen.getByText("⚠️ Unlimited Token Approval")).toBeInTheDocument()
    expect(screen.getByText(/This transaction will give unlimited approval/)).toBeInTheDocument()
    expect(screen.getByText("Learn more")).toBeInTheDocument()
  })

  it("dismisses warning when close button is clicked", () => {
    render(
      <SecurityWarning 
        transaction={mockTransaction} 
        onDismiss={mockOnDismiss}
      />
    )

    const dismissButton = screen.getByLabelText("Dismiss")
    fireEvent.click(dismissButton)

    expect(mockOnDismiss).toHaveBeenCalledWith("unlimited_approval")
    expect(screen.queryByText("⚠️ Unlimited Token Approval")).not.toBeInTheDocument()
  })

  it("calls onLearnMore when learn more link is clicked", () => {
    render(
      <SecurityWarning 
        transaction={mockTransaction} 
        onLearnMore={mockOnLearnMore}
      />
    )

    const learnMoreLink = screen.getByText("Learn more")
    fireEvent.click(learnMoreLink)

    expect(mockOnLearnMore).toHaveBeenCalled()
  })

  it("shows high gas price warning with dynamic value", () => {
    const gasTransaction = {
      ...mockTransaction,
      data: "0x1234", // Not an unlimited approval
      gasPrice: "50000000000" // 50 Gwei
    }
    
    const { rerender } = render(
      <SecurityWarning 
        transaction={gasTransaction} 
      />
    )

    expect(screen.getByText(/The gas price for this transaction is very high \(50.00 Gwei\)/)).toBeInTheDocument()
    
    // Test with a different gas price
    const updatedTransaction = {
      ...gasTransaction,
      gasPrice: "75000000000" // 75 Gwei
    }
    
    rerender(<SecurityWarning transaction={updatedTransaction} />)
    expect(screen.getByText(/The gas price for this transaction is very high \(75.00 Gwei\)/)).toBeInTheDocument()
  })

  it("supports custom warnings", () => {
    const customWarning = {
      type: "custom_warning",
      title: "⚠️ Custom Warning",
      description: "This is a custom warning message.",
      severity: "medium" as const,
      dismissible: true,
      customAction: {
        label: "Custom Action",
        onClick: vi.fn()
      }
    }

    render(
      <SecurityWarning 
        transaction={mockTransaction}
        customWarnings={[customWarning]}
      />
    )

    expect(screen.getByText("⚠️ Custom Warning")).toBeInTheDocument()
    expect(screen.getByText("This is a custom warning message.")).toBeInTheDocument()
    expect(screen.getByText("Custom Action")).toBeInTheDocument()
  })

  it("analyzeTransaction returns correct warnings", () => {
    const transaction = {
      data: "0x1cff79cd0000000000000000000000000000000000000000000000000000000000000000",
      to: "0x1234",
      gasPrice: "100000000000" // 100 Gwei
    }

    const warnings = analyzeTransaction(transaction)
    
    expect(warnings).toHaveLength(2)
    expect(warnings.some(w => w.type === "dangerous_signature")).toBe(true)
    expect(warnings.some(w => w.type === "high_gas_price")).toBe(true)
  })
})
