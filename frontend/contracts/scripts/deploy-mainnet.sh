#!/bin/bash

# Deploy to Base Mainnet (Production)
# Usage: ./contracts/scripts/deploy-mainnet.sh

set -e

echo "======================================"
echo "Deploying to Base Mainnet (PRODUCTION)"
echo "======================================"
echo ""
echo "WARNING: This will deploy to MAINNET with REAL ETH!"
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
    echo "Error: BASESCAN_API_KEY required for mainnet deployment"
    exit 1
fi

# Get deployer address
DEPLOYER=$(cast wallet address $PRIVATE_KEY 2>/dev/null || echo "Unknown")
echo "Deployer Address: $DEPLOYER"

# Check balance
BALANCE=$(cast balance $DEPLOYER --rpc-url https://mainnet.base.org 2>/dev/null || echo "0")
BALANCE_ETH=$(echo "scale=4; $BALANCE / 1000000000000000000" | bc)
echo "Deployer Balance: $BALANCE_ETH ETH"

if (( $(echo "$BALANCE_ETH < 0.05" | bc -l) )); then
    echo ""
    echo "ERROR: Insufficient balance for mainnet deployment!"
    echo "You need at least 0.05 ETH to safely deploy to mainnet"
    exit 1
fi

echo ""
echo "Running gas estimation..."
forge script contracts/script/GasEstimation.s.sol:GasEstimation \
    --rpc-url base \
    --private-key $PRIVATE_KEY

echo ""
echo "======================================"
echo "MAINNET DEPLOYMENT CHECKLIST"
echo "======================================"
echo ""
echo "Before proceeding, confirm:"
echo "  [ ] Contracts tested thoroughly on Base Sepolia"
echo "  [ ] Code audited (if required)"
echo "  [ ] All tests passing (run 'forge test')"
echo "  [ ] Gas costs reviewed and acceptable"
echo "  [ ] Deployer has sufficient ETH balance"
echo "  [ ] BaseScan API key configured for verification"
echo "  [ ] Team notified of deployment"
echo ""

read -p "Have you completed all checklist items? (yes/NO): " -r
echo
if [[ ! $REPLY == "yes" ]]; then
    echo "Deployment cancelled. Complete checklist first."
    exit 1
fi

echo ""
echo "Type 'DEPLOY TO MAINNET' to confirm:"
read -r CONFIRM

if [[ ! $CONFIRM == "DEPLOY TO MAINNET" ]]; then
    echo "Deployment cancelled"
    exit 1
fi

echo ""
echo "Deploying contracts to Base Mainnet..."
echo "This will cost real ETH. Last chance to cancel (Ctrl+C)"
sleep 5

# Deploy with verification (using production profile for maximum optimization)
FOUNDRY_PROFILE=production forge script contracts/script/DeployWithVerification.s.sol:DeployWithVerification \
    --rpc-url base \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $BASESCAN_API_KEY \
    -vvv

echo ""
echo "======================================"
echo "Mainnet Deployment Complete!"
echo "======================================"
echo ""
echo "IMPORTANT: Post-Deployment Steps"
echo ""
echo "1. Save deployment addresses to secure location"
echo "2. Update production .env with contract addresses"
echo "3. Verify contracts on BaseScan"
echo "4. Test all functions on mainnet with small amounts"
echo "5. Update frontend configuration"
echo "6. Monitor first transactions closely"
echo "7. Document deployment in project wiki/docs"
echo "8. Announce deployment to team"
echo ""
echo "Deployment broadcast saved to: contracts/broadcast/"
echo ""
