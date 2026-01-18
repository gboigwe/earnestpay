// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/PayrollManager.sol";
import "../src/TaxCompliance.sol";

/**
 * @title Deploy Script for Base
 * @notice Deploys PayrollManager and TaxCompliance contracts to Base
 * @dev Run with: forge script contracts/script/Deploy.s.sol:DeployScript --rpc-url base_sepolia --broadcast
 */
contract DeployScript is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy TaxCompliance contract
        TaxCompliance taxCompliance = new TaxCompliance();
        console.log("TaxCompliance deployed at:", address(taxCompliance));

        // Initialize default tax rates
        taxCompliance.initializeDefaultRates();
        console.log("Default tax rates initialized");

        // Deploy PayrollManager contract
        PayrollManager payrollManager = new PayrollManager();
        console.log("PayrollManager deployed at:", address(payrollManager));

        vm.stopBroadcast();

        // Log deployment addresses for frontend integration
        console.log("\n=== Deployment Complete ===");
        console.log("Network: Base");
        console.log("PayrollManager:", address(payrollManager));
        console.log("TaxCompliance:", address(taxCompliance));
        console.log("\nAdd these to your .env file:");
        console.log("VITE_PAYROLL_CONTRACT_ADDRESS=%s", address(payrollManager));
        console.log("VITE_TAX_CONTRACT_ADDRESS=%s", address(taxCompliance));
    }
}
