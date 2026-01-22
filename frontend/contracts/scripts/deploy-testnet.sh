#!/bin/bash

# Deploy to Base Sepolia (Testnet)
# Usage: ./contracts/scripts/deploy-testnet.sh

set -e

echo "======================================"
echo "Deploying to Base Sepolia (Testnet)"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found"
    echo "Please create .env with PRIVATE_KEY and BASESCAN_API_KEY"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY not set in .env"
    exit 1
fi

if [ -z "$BASESCAN_API_KEY" ]; then
    echo "Warning: BASESCAN_API_KEY not set. Verification will be skipped."
fi

# Get deployer address
DEPLOYER=$(cast wallet address $PRIVATE_KEY 2>/dev/null || echo "Unknown")
echo "Deployer Address: $DEPLOYER"

# Check balance
BALANCE=$(cast balance $DEPLOYER --rpc-url https://sepolia.base.org 2>/dev/null || echo "0")
BALANCE_ETH=$(echo "scale=4; $BALANCE / 1000000000000000000" | bc)
echo "Deployer Balance: $BALANCE_ETH ETH"

if (( $(echo "$BALANCE_ETH < 0.01" | bc -l) )); then
    echo ""
    echo "WARNING: Low balance detected!"
    echo "You need at least 0.01 ETH to deploy"
    echo "Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Running gas estimation..."
forge script contracts/script/GasEstimation.s.sol:GasEstimation \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY

echo ""
read -p "Proceed with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

echo ""
echo "Deploying contracts..."

if [ -n "$BASESCAN_API_KEY" ]; then
    # Deploy with verification
    forge script contracts/script/DeployWithVerification.s.sol:DeployWithVerification \
        --rpc-url base_sepolia \
        --private-key $PRIVATE_KEY \
        --broadcast \
        --verify \
        --etherscan-api-key $BASESCAN_API_KEY \
        -vvv
else
    # Deploy without verification
    forge script contracts/script/DeployWithVerification.s.sol:DeployWithVerification \
        --rpc-url base_sepolia \
        --private-key $PRIVATE_KEY \
        --broadcast \
        -vvv
fi

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Update .env with the deployed contract addresses"
echo "2. Verify contracts on BaseScan if not done automatically"
echo "3. Test the contracts on testnet"
echo "4. Run 'npm run test:integration' to verify integration"
echo ""
