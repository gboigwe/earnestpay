// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TaxCompliance
 * @notice Manages tax rates and calculations for payroll on Base
 * @dev Optimized for Base blockchain with efficient storage patterns
 */
contract TaxCompliance is Ownable {
    // Tax rates are stored as basis points (1% = 100 basis points)
    struct TaxRates {
        uint256 federalRate;
        uint256 stateRate;
        uint256 socialSecurityRate;
        uint256 medicareRate;
        uint256 unemploymentRate;
        bool isConfigured;
    }

    // Tax calculation result
    struct TaxBreakdown {
        uint256 grossAmount;
        uint256 federalTax;
        uint256 stateTax;
        uint256 socialSecurityTax;
        uint256 medicareTax;
        uint256 unemploymentTax;
        uint256 totalTax;
        uint256 netAmount;
    }

    // YTD (Year-to-Date) tracking
    struct YTDSummary {
        uint256 grossPaid;
        uint256 totalTaxWithheld;
        uint256 federalTaxWithheld;
        uint256 stateTaxWithheld;
        uint256 socialSecurityWithheld;
        uint256 medicareWithheld;
        uint256 lastUpdated;
    }

    // State variables
    mapping(address => mapping(string => TaxRates)) public companyTaxRates; // company => jurisdiction => rates
    mapping(address => string[]) public supportedJurisdictions; // company => jurisdictions
    mapping(address => mapping(address => YTDSummary)) public ytdSummaries; // company => employee => YTD

    // Constants for basis points (10000 = 100%)
    uint256 constant BASIS_POINTS = 10000;

    // Events
    event TaxRatesConfigured(address indexed company, string jurisdiction, uint256 timestamp);
    event TaxCalculated(address indexed company, address indexed employee, uint256 grossAmount, uint256 totalTax);
    event YTDUpdated(address indexed company, address indexed employee, uint256 grossPaid, uint256 totalTax);

    /**
     * @notice Configure tax rates for a jurisdiction
     * @dev Rates are in basis points (e.g., 2200 = 22%)
     */
    function configureTaxRates(
        string memory _jurisdiction,
        uint256 _federalRate,
        uint256 _stateRate,
        uint256 _socialSecurityRate,
        uint256 _medicareRate,
        uint256 _unemploymentRate
    ) external {
        require(_federalRate <= BASIS_POINTS, "Federal rate exceeds 100%");
        require(_stateRate <= BASIS_POINTS, "State rate exceeds 100%");
        require(_socialSecurityRate <= BASIS_POINTS, "SS rate exceeds 100%");
        require(_medicareRate <= BASIS_POINTS, "Medicare rate exceeds 100%");
        require(_unemploymentRate <= BASIS_POINTS, "Unemployment rate exceeds 100%");

        // Add jurisdiction if not already supported
        if (!companyTaxRates[msg.sender][_jurisdiction].isConfigured) {
            supportedJurisdictions[msg.sender].push(_jurisdiction);
        }

        companyTaxRates[msg.sender][_jurisdiction] = TaxRates({
            federalRate: _federalRate,
            stateRate: _stateRate,
            socialSecurityRate: _socialSecurityRate,
            medicareRate: _medicareRate,
            unemploymentRate: _unemploymentRate,
            isConfigured: true
        });

        emit TaxRatesConfigured(msg.sender, _jurisdiction, block.timestamp);
    }

    /**
     * @notice Calculate tax breakdown for a payment
     * @param _jurisdiction Tax jurisdiction code
     * @param _grossAmount Gross payment amount in wei
     * @return TaxBreakdown with all tax calculations
     */
    function calculateTax(
        string memory _jurisdiction,
        uint256 _grossAmount
    ) public view returns (TaxBreakdown memory) {
        require(_grossAmount > 0, "Amount must be greater than 0");

        TaxRates memory rates = companyTaxRates[msg.sender][_jurisdiction];
        require(rates.isConfigured, "Tax rates not configured for jurisdiction");

        uint256 federalTax = (_grossAmount * rates.federalRate) / BASIS_POINTS;
        uint256 stateTax = (_grossAmount * rates.stateRate) / BASIS_POINTS;
        uint256 socialSecurityTax = (_grossAmount * rates.socialSecurityRate) / BASIS_POINTS;
        uint256 medicareTax = (_grossAmount * rates.medicareRate) / BASIS_POINTS;
        uint256 unemploymentTax = (_grossAmount * rates.unemploymentRate) / BASIS_POINTS;

        uint256 totalTax = federalTax + stateTax + socialSecurityTax + medicareTax + unemploymentTax;
        uint256 netAmount = _grossAmount - totalTax;

        return TaxBreakdown({
            grossAmount: _grossAmount,
            federalTax: federalTax,
            stateTax: stateTax,
            socialSecurityTax: socialSecurityTax,
            medicareTax: medicareTax,
            unemploymentTax: unemploymentTax,
            totalTax: totalTax,
            netAmount: netAmount
        });
    }

    /**
     * @notice Update YTD summary for an employee
     * @dev Should be called by PayrollManager after processing payment
     */
    function updateYTD(
        address _employee,
        uint256 _grossAmount,
        string memory _jurisdiction
    ) external {
        TaxBreakdown memory breakdown = calculateTax(_jurisdiction, _grossAmount);

        YTDSummary storage ytd = ytdSummaries[msg.sender][_employee];
        ytd.grossPaid += breakdown.grossAmount;
        ytd.totalTaxWithheld += breakdown.totalTax;
        ytd.federalTaxWithheld += breakdown.federalTax;
        ytd.stateTaxWithheld += breakdown.stateTax;
        ytd.socialSecurityWithheld += breakdown.socialSecurityTax;
        ytd.medicareWithheld += breakdown.medicareTax;
        ytd.lastUpdated = block.timestamp;

        emit YTDUpdated(msg.sender, _employee, ytd.grossPaid, ytd.totalTaxWithheld);
    }

    /**
     * @notice Get YTD summary for an employee
     */
    function getYTDSummary(
        address _company,
        address _employee
    ) external view returns (YTDSummary memory) {
        return ytdSummaries[_company][_employee];
    }

    /**
     * @notice Get supported jurisdictions for a company
     */
    function getSupportedJurisdictions(address _company) external view returns (string[] memory) {
        return supportedJurisdictions[_company];
    }

    /**
     * @notice Get tax rates for a jurisdiction
     */
    function getTaxRates(
        address _company,
        string memory _jurisdiction
    ) external view returns (TaxRates memory) {
        return companyTaxRates[_company][_jurisdiction];
    }

    /**
     * @notice Initialize default US tax rates
     */
    function initializeDefaultRates() external {
        // US Federal (22%)
        configureTaxRates("US_FED", 2200, 0, 620, 145, 60);

        // California (7%)
        configureTaxRates("US_CA", 2200, 700, 620, 145, 60);

        // New York (6.85%)
        configureTaxRates("US_NY", 2200, 685, 620, 145, 60);
    }
}
