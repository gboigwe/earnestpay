import React, { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertIconComponent } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

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

type WarningDescription = string | ((transaction: Transaction) => string)

export type SecurityWarning = {
  type: "unlimited_approval" | "dangerous_signature" | "unverified_contract" | "suspicious_contract" | "high_gas_price" | string
  title: string
  description: WarningDescription
  severity: "low" | "medium" | "high" | "critical"
  learnMoreUrl?: string
  dismissible?: boolean
  customAction?: {
    label: string
    onClick: () => void
  }
}

// Default security warnings configuration
export const DEFAULT_SECURITY_WARNINGS: SecurityWarning[] = [
  {
    type: "unlimited_approval",
    title: "⚠️ Unlimited Token Approval",
    description: "This transaction will give unlimited approval to the contract to spend your tokens. This is a security risk if you don't fully trust the contract.",
    severity: "high",
    learnMoreUrl: "https://docs.ethers.org/v5/api/contract/contract/#Contract--write",
    dismissible: true
  },
  {
    type: "dangerous_signature",
    title: "⚠️ Potentially Dangerous Transaction",
    description: "This transaction appears to be a proxy call that could execute arbitrary code. Make sure you trust the contract you're interacting with.",
    severity: "critical",
    learnMoreUrl: "https://consensys.github.io/smart-contract-best-practices/attacks/delegatecall/"
  },
  {
    type: "unverified_contract",
    title: "⚠️ Unverified Contract",
    description: "This transaction interacts with an unverified contract. Be cautious as the contract code has not been audited.",
    severity: "medium",
    dismissible: true
  },
  {
    type: "high_gas_price",
    title: "⚠️ High Gas Price",
    description: (transaction: Transaction) => {
      const gasPrice = transaction.gasPrice ? (parseInt(transaction.gasPrice) / 1e9).toFixed(2) : 'unknown';
      return `The gas price for this transaction is very high (${gasPrice} Gwei). Consider waiting for lower network congestion.`;
    },
    severity: "low",
    dismissible: true
  }
]

export const analyzeTransaction = (transaction: Transaction, customWarnings: SecurityWarning[] = []): SecurityWarning[] => {
  const warnings: SecurityWarning[] = []
  const allWarnings = [...DEFAULT_SECURITY_WARNINGS, ...customWarnings]

  // Check for unlimited approval (approve(uint256.max))
  if (transaction.data && transaction.data.includes("095ea7b3") && transaction.data.endsWith("f".repeat(64))) {
    const warning = allWarnings.find(w => w.type === "unlimited_approval")
    if (warning) warnings.push(warning)
  }

  // Check for dangerous signatures
  if (transaction.data && transaction.data.startsWith("0x1cff79cd")) {
    const warning = allWarnings.find(w => w.type === "dangerous_signature")
    if (warning) warnings.push(warning)
  }

  // Check for unverified contracts
  if (transaction.to && !isVerifiedContract(transaction.to)) {
    const warning = allWarnings.find(w => w.type === "unverified_contract")
    if (warning) warnings.push(warning)
  }

  // Check for high gas price (example threshold: 50 Gwei)
  const gasPrice = transaction.gasPrice ? parseInt(transaction.gasPrice) / 1e9 : 0
  if (gasPrice > 50) {
    const warning = allWarnings.find(w => w.type === "high_gas_price")
    if (warning) {
      const description = typeof warning.description === 'function' 
        ? warning.description(transaction)
        : warning.description
      
      warnings.push({
        ...warning,
        description
      })
    }
  }

  return warnings
}

// Helper function to check if a contract is verified
const isVerifiedContract = (address: string): boolean => {
  // In a real implementation, this would query a blockchain explorer API
  // For now, we'll consider all contracts as unverified for demonstration
  console.log('Checking if contract is verified:', address)
  return false
}

interface SecurityWarningProps {
  transaction: Transaction
  className?: string
  customWarnings?: SecurityWarning[]
  onDismiss?: (warningType: string) => void
  onLearnMore?: (url: string) => void
}

export const SecurityWarning: React.FC<SecurityWarningProps> = ({
  transaction,
  className,
  customWarnings = [],
  onDismiss,
  onLearnMore
}) => {
  const [dismissedWarnings, setDismissedWarnings] = useState<string[]>([])
  const warnings = analyzeTransaction(transaction, customWarnings)
    .filter(warning => !dismissedWarnings.includes(warning.type))

  const handleDismiss = (warningType: string) => {
    setDismissedWarnings(prev => [...prev, warningType])
    onDismiss?.(warningType)
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

  if (warnings.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-3", className)}>
      {warnings.map((warning) => {
        const variant = getVariant(warning.severity)
        const isDismissible = warning.dismissible !== false
        
        return (
          <Alert 
            key={warning.type} 
            variant={variant as any}
            className="relative pr-10"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertIconComponent variant={variant as any} />
              </div>
              <div className="ml-3 flex-1">
                <AlertTitle className="font-medium">{warning.title}</AlertTitle>
                <AlertDescription className="mt-1">
                  {typeof warning.description === 'function' 
                    ? warning.description(transaction)
                    : warning.description}
                </AlertDescription>
                
                <div className="mt-2 space-x-3">
                  {warning.learnMoreUrl && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-sm"
                      onClick={() => onLearnMore?.(warning.learnMoreUrl!)}
                    >
                      Learn more
                    </Button>
                  )}
                  
                  {warning.customAction && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-sm"
                      onClick={warning.customAction.onClick}
                    >
                      {warning.customAction.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {isDismissible && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0"
                onClick={() => handleDismiss(warning.type)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            )}
          </Alert>
        )
      })}
    </div>
  )
}

export default SecurityWarning
