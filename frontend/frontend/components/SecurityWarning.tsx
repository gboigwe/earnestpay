import React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertIconComponent } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export type Transaction = {
  data?: string
  to?: string
  value?: string
  from?: string
  gasPrice?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  gas?: string
  nonce?: string
  chainId?: number
}

export type SecurityWarning = {
  type: "unlimited_approval" | "dangerous_signature" | "unverified_contract" | "suspicious_contract" | "high_gas_price"
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
}

export const analyzeTransaction = (transaction: Transaction): SecurityWarning[] => {
  const warnings: SecurityWarning[] = []

  // Check for unlimited approval (approve(uint256.max))
  if (transaction.data && transaction.data.includes("095ea7b3") && transaction.data.endsWith("f".repeat(64))) {
    warnings.push({
      type: "unlimited_approval",
      title: "⚠️ Unlimited Token Approval",
      description: "This transaction will give unlimited approval to the contract to spend your tokens. This is a security risk if you don't fully trust the contract.",
      severity: "high"
    })
  }

  // Check for dangerous signatures
  if (transaction.data && transaction.data.startsWith("0x1cff79cd")) {
    warnings.push({
      type: "dangerous_signature",
      title: "⚠️ Potentially Dangerous Transaction",
      description: "This transaction appears to be a proxy call that could execute arbitrary code. Make sure you trust the contract you're interacting with.",
      severity: "critical"
    })
  }

  // Check for unverified contracts
  if (transaction.to && !isVerifiedContract(transaction.to)) {
    warnings.push({
      type: "unverified_contract",
      title: "⚠️ Unverified Contract",
      description: "This transaction interacts with an unverified contract. Be cautious as the contract code has not been audited.",
      severity: "medium"
    })
  }

  // Check for high gas price (example threshold: 50 Gwei)
  const gasPrice = transaction.gasPrice ? parseInt(transaction.gasPrice) / 1e9 : 0
  if (gasPrice > 50) {
    warnings.push({
      type: "high_gas_price",
      title: "⚠️ High Gas Price",
      description: `The gas price for this transaction is very high (${gasPrice.toFixed(2)} Gwei). Consider waiting for lower network congestion.`,
      severity: "low"
    })
  }

  return warnings
}

// Helper function to check if a contract is verified
const isVerifiedContract = (address: string): boolean => {
  // In a real implementation, this would query a blockchain explorer API
  return false
}

interface SecurityWarningProps {
  transaction: Transaction
  className?: string
}

export const SecurityWarning: React.FC<SecurityWarningProps> = ({ transaction, className }) => {
  const warnings = analyzeTransaction(transaction)

  if (warnings.length === 0) {
    return null
  }

  const getVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      case "low":
        return "info"
      default:
        return "default"
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {warnings.map((warning) => (
        <Alert key={warning.type} variant={getVariant(warning.severity) as any}>
          <AlertIconComponent variant={warning.severity === "critical" || warning.severity === "high" ? "destructive" : warning.severity as any} />
          <AlertTitle>{warning.title}</AlertTitle>
          <AlertDescription>{warning.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

export default SecurityWarning
