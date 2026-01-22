// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/PayrollManager.sol";
import "../src/TaxCompliance.sol";

/**
 * @title Gas Estimation Script
 * @notice Estimates gas costs for deployment and common operations
 * @dev Run with: forge script contracts/script/GasEstimation.s.sol:GasEstimation --rpc-url base_sepolia
 */
contract GasEstimation is Script {
    uint256 constant GWEI_TO_WEI = 1e9;
    uint256 constant WEI_TO_ETH = 1e18;

    function run() external {
        console.log("\n=== Gas Estimation for Base Deployment ===\n");

        // Get current gas price
        uint256 gasPrice = getGasPrice();
        console.log("Current Gas Price:", gasPrice / GWEI_TO_WEI, "gwei");

        // Estimate deployment costs
        estimateDeploymentCosts(gasPrice);

        // Estimate operation costs
        estimateOperationCosts(gasPrice);

        // Provide recommendations
        provideRecommendations(gasPrice);
    }

    /**
     * @dev Estimates gas costs for contract deployment
     */
    function estimateDeploymentCosts(uint256 gasPrice) internal {
        console.log("\n--- Deployment Gas Estimates ---");

        // TaxCompliance deployment
        uint256 taxComplianceGas = 500000; // Approximate
        uint256 taxComplianceCost = taxComplianceGas * gasPrice;
        console.log("TaxCompliance:");
        console.log("  Gas:", taxComplianceGas);
        console.log("  Cost:", taxComplianceCost / WEI_TO_ETH, "ETH");
        console.log("  USD (@ $3000/ETH):", (taxComplianceCost * 3000) / WEI_TO_ETH);

        // TaxCompliance initialization
        uint256 initGas = 150000; // Approximate
        uint256 initCost = initGas * gasPrice;
        console.log("\nTaxCompliance Initialization:");
        console.log("  Gas:", initGas);
        console.log("  Cost:", initCost / WEI_TO_ETH, "ETH");

        // PayrollManager deployment
        uint256 payrollGas = 1500000; // Approximate
        uint256 payrollCost = payrollGas * gasPrice;
        console.log("\nPayrollManager:");
        console.log("  Gas:", payrollGas);
        console.log("  Cost:", payrollCost / WEI_TO_ETH, "ETH");
        console.log("  USD (@ $3000/ETH):", (payrollCost * 3000) / WEI_TO_ETH);

        // Total deployment cost
        uint256 totalGas = taxComplianceGas + initGas + payrollGas;
        uint256 totalCost = totalGas * gasPrice;
        console.log("\n--- Total Deployment Cost ---");
        console.log("Total Gas:", totalGas);
        console.log("Total Cost:", totalCost / WEI_TO_ETH, "ETH");
        console.log("USD (@ $3000/ETH):", (totalCost * 3000) / WEI_TO_ETH);

        // Add buffer for safety
        uint256 recommendedBalance = (totalCost * 150) / 100; // 50% buffer
        console.log("\nRecommended deployer balance:", recommendedBalance / WEI_TO_ETH, "ETH");
    }

    /**
     * @dev Estimates gas costs for common operations
     */
    function estimateOperationCosts(uint256 gasPrice) internal {
        console.log("\n--- Operation Gas Estimates ---");

        // Employee operations
        console.log("\nEmployee Operations:");
        estimateOperation("Add Employee", 200000, gasPrice);
        estimateOperation("Update Employee", 100000, gasPrice);
        estimateOperation("Remove Employee", 80000, gasPrice);

        // Payment operations
        console.log("\nPayment Operations:");
        estimateOperation("Process Single Payment", 150000, gasPrice);
        estimateOperation("Batch Payment (10 employees)", 1000000, gasPrice);
        estimateOperation("Claim Salary", 120000, gasPrice);

        // Tax operations
        console.log("\nTax Operations:");
        estimateOperation("Calculate Tax", 80000, gasPrice);
        estimateOperation("Update Tax Rate", 60000, gasPrice);
        estimateOperation("Generate Tax Report", 100000, gasPrice);
    }

    /**
     * @dev Helper to estimate a single operation
     */
    function estimateOperation(
        string memory name,
        uint256 estimatedGas,
        uint256 gasPrice
    ) internal view {
        uint256 cost = estimatedGas * gasPrice;
        uint256 costUSD = (cost * 3000) / WEI_TO_ETH;

        console.log("%s:", name);
        console.log("  Gas: %d", estimatedGas);
        console.log("  Cost: %d ETH", cost / WEI_TO_ETH);
        console.log("  USD: $%d (@ $3000/ETH)", costUSD);
    }

    /**
     * @dev Provides gas optimization recommendations
     */
    function provideRecommendations(uint256 gasPrice) internal view {
        console.log("\n--- Gas Optimization Recommendations ---");

        // Base-specific optimizations
        console.log("\nBase Network Optimizations:");
        console.log("1. Base has very low gas costs compared to Ethereum");
        console.log("2. Typical transaction costs: $0.01 - $0.10");
        console.log("3. Use batch operations when processing multiple employees");
        console.log("4. Consider using events for off-chain data storage");

        // Gas price recommendations
        console.log("\nGas Price Recommendations:");
        if (gasPrice < 0.001 gwei) {
            console.log("Current gas price is very low - good time to deploy");
        } else if (gasPrice < 0.01 gwei) {
            console.log("Current gas price is reasonable");
        } else {
            console.log("Current gas price is high - consider waiting");
        }

        // General best practices
        console.log("\nBest Practices:");
        console.log("1. Test all operations on Base Sepolia first");
        console.log("2. Use calldata instead of memory where possible");
        console.log("3. Pack struct variables to save storage slots");
        console.log("4. Use unchecked blocks for safe arithmetic");
        console.log("5. Minimize storage writes");
    }

    /**
     * @dev Gets current gas price from RPC
     */
    function getGasPrice() internal view returns (uint256) {
        // On Base, gas prices are typically very low
        // This is a mock value for estimation
        uint256 baseGasPrice = 0.001 gwei; // Typical Base gas price

        // In production, this would query the actual gas price
        return baseGasPrice;
    }
}
