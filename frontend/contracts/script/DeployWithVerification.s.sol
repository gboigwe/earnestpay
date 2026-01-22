// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/PayrollManager.sol";
import "../src/TaxCompliance.sol";

/**
 * @title Deploy Script with Verification for Base
 * @notice Deploys and verifies PayrollManager and TaxCompliance contracts
 * @dev Includes gas estimation and deployment verification
 *
 * Usage:
 * Base Sepolia (testnet):
 *   forge script contracts/script/DeployWithVerification.s.sol:DeployWithVerification --rpc-url base_sepolia --broadcast --verify
 *
 * Base Mainnet:
 *   forge script contracts/script/DeployWithVerification.s.sol:DeployWithVerification --rpc-url base --broadcast --verify
 */
contract DeployWithVerification is Script {
    // Deployment addresses (saved after deployment)
    address public taxComplianceAddress;
    address public payrollManagerAddress;

    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("\n=== Starting Deployment ===");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Block Number:", block.number);

        // Check deployer balance
        uint256 balance = deployer.balance;
        console.log("Deployer Balance:", balance / 1e18, "ETH");

        if (balance < 0.01 ether) {
            console.log("WARNING: Low balance. Recommend at least 0.01 ETH for deployment");
        }

        // Estimate gas before deployment
        uint256 gasPrice = tx.gasprice;
        console.log("Current Gas Price:", gasPrice / 1e9, "gwei");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy TaxCompliance contract
        console.log("\n--- Deploying TaxCompliance ---");
        TaxCompliance taxCompliance = new TaxCompliance();
        taxComplianceAddress = address(taxCompliance);
        console.log("TaxCompliance deployed at:", taxComplianceAddress);

        // Initialize default tax rates
        console.log("Initializing default tax rates...");
        taxCompliance.initializeDefaultRates();
        console.log("Default tax rates initialized");

        // Deploy PayrollManager contract
        console.log("\n--- Deploying PayrollManager ---");
        PayrollManager payrollManager = new PayrollManager();
        payrollManagerAddress = address(payrollManager);
        console.log("PayrollManager deployed at:", payrollManagerAddress);

        vm.stopBroadcast();

        // Verify deployment
        console.log("\n=== Deployment Verification ===");
        verifyDeployment(taxCompliance, payrollManager);

        // Output configuration
        console.log("\n=== Deployment Complete ===");
        outputConfiguration();
    }

    /**
     * @dev Verifies that contracts were deployed correctly
     */
    function verifyDeployment(
        TaxCompliance taxCompliance,
        PayrollManager payrollManager
    ) internal view {
        // Verify TaxCompliance
        require(
            address(taxCompliance).code.length > 0,
            "TaxCompliance not deployed"
        );
        console.log("TaxCompliance verified: Contract code exists");

        // Verify PayrollManager
        require(
            address(payrollManager).code.length > 0,
            "PayrollManager not deployed"
        );
        console.log("PayrollManager verified: Contract code exists");

        console.log("All contracts verified successfully");
    }

    /**
     * @dev Outputs deployment configuration for frontend
     */
    function outputConfiguration() internal view {
        string memory networkName = getNetworkName();

        console.log("Network:", networkName);
        console.log("Chain ID:", block.chainid);
        console.log("\nContract Addresses:");
        console.log("PayrollManager:", payrollManagerAddress);
        console.log("TaxCompliance:", taxComplianceAddress);

        console.log("\n=== Environment Variables ===");
        console.log("Add these to your .env file:");
        console.log("VITE_PAYROLL_CONTRACT_ADDRESS=%s", payrollManagerAddress);
        console.log("VITE_TAX_CONTRACT_ADDRESS=%s", taxComplianceAddress);

        console.log("\n=== Verification Commands ===");
        console.log("Verify TaxCompliance:");
        console.log(
            "forge verify-contract %s contracts/src/TaxCompliance.sol:TaxCompliance --chain %s --watch",
            taxComplianceAddress,
            networkName
        );

        console.log("\nVerify PayrollManager:");
        console.log(
            "forge verify-contract %s contracts/src/PayrollManager.sol:PayrollManager --chain %s --watch",
            payrollManagerAddress,
            networkName
        );

        console.log("\n=== BaseScan URLs ===");
        string memory explorerUrl = getExplorerUrl();
        console.log("TaxCompliance:", string.concat(explorerUrl, "/address/", toAsciiString(taxComplianceAddress)));
        console.log("PayrollManager:", string.concat(explorerUrl, "/address/", toAsciiString(payrollManagerAddress)));
    }

    /**
     * @dev Gets network name based on chain ID
     */
    function getNetworkName() internal view returns (string memory) {
        if (block.chainid == 8453) {
            return "base";
        } else if (block.chainid == 84532) {
            return "base-sepolia";
        } else {
            return "unknown";
        }
    }

    /**
     * @dev Gets block explorer URL based on chain ID
     */
    function getExplorerUrl() internal view returns (string memory) {
        if (block.chainid == 8453) {
            return "https://basescan.org";
        } else if (block.chainid == 84532) {
            return "https://sepolia.basescan.org";
        } else {
            return "https://etherscan.io";
        }
    }

    /**
     * @dev Converts address to ASCII string (for URLs)
     */
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(abi.encodePacked("0x", s));
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
