#!/bin/bash

# Verify deployed contracts on BaseScan
# Usage: ./contracts/scripts/verify-contracts.sh [network]

set -e

NETWORK=${1:-base_sepolia}

echo "======================================"
echo "Verifying Contracts on BaseScan"
echo "Network: $NETWORK"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found"
    exit 1
fi

# Load environment variables
source .env

# Check API key
if [ -z "$BASESCAN_API_KEY" ]; then
    echo "Error: BASESCAN_API_KEY not set in .env"
    echo "Get your API key from: https://basescan.org/myapikey"
    exit 1
fi

# Get contract addresses
echo "Enter contract addresses to verify:"
echo ""

read -p "PayrollManager address: " PAYROLL_ADDRESS
read -p "TaxCompliance address: " TAX_ADDRESS

if [ -z "$PAYROLL_ADDRESS" ] || [ -z "$TAX_ADDRESS" ]; then
    echo "Error: Both contract addresses are required"
    exit 1
fi

echo ""
echo "Verifying TaxCompliance..."
forge verify-contract $TAX_ADDRESS \
    contracts/src/TaxCompliance.sol:TaxCompliance \
    --chain $NETWORK \
    --etherscan-api-key $BASESCAN_API_KEY \
    --watch \
    --constructor-args $(cast abi-encode "constructor()") || echo "Verification may have failed or contract already verified"

echo ""
echo "Verifying PayrollManager..."
forge verify-contract $PAYROLL_ADDRESS \
    contracts/src/PayrollManager.sol:PayrollManager \
    --chain $NETWORK \
    --etherscan-api-key $BASESCAN_API_KEY \
    --watch \
    --constructor-args $(cast abi-encode "constructor()") || echo "Verification may have failed or contract already verified"

echo ""
echo "======================================"
echo "Verification Complete!"
echo "======================================"
echo ""

# Provide block explorer links
if [ "$NETWORK" == "base" ]; then
    EXPLORER_URL="https://basescan.org"
else
    EXPLORER_URL="https://sepolia.basescan.org"
fi

echo "Check verification status:"
echo "TaxCompliance: $EXPLORER_URL/address/$TAX_ADDRESS#code"
echo "PayrollManager: $EXPLORER_URL/address/$PAYROLL_ADDRESS#code"
echo ""
