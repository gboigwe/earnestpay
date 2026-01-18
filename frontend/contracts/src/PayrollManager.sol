// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PayrollManager
 * @notice Manages employee payroll on Base blockchain
 * @dev Optimized for Base's gas model with batch operations
 */
contract PayrollManager is Ownable, ReentrancyGuard {
    // Employee roles
    enum Role { EMPLOYEE, MANAGER, HR, ACCOUNTANT, ADMIN }

    // Employee profile
    struct Employee {
        address employeeAddress;
        uint256 employeeId;
        string firstName;
        string lastName;
        string email;
        Role role;
        string department;
        uint256 monthlySalary; // in wei
        address managerAddress;
        string taxJurisdiction;
        address paymentAddress;
        bool isActive;
        uint256 createdAt;
    }

    // Company info
    struct Company {
        string name;
        address companyAddress;
        uint256 registeredAt;
        bool isRegistered;
    }

    // Payment record
    struct Payment {
        address employee;
        uint256 amount;
        uint256 timestamp;
        string paymentType; // "salary", "bonus", "reimbursement"
    }

    // State variables
    mapping(address => Company) public companies;
    mapping(address => mapping(address => Employee)) public employees; // company => employee => Employee
    mapping(address => uint256) public employeeCount; // company => count
    mapping(address => Payment[]) public paymentHistory; // employee => payments

    // Events
    event CompanyRegistered(address indexed company, string name, uint256 timestamp);
    event EmployeeCreated(address indexed company, address indexed employee, uint256 employeeId);
    event EmployeeUpdated(address indexed company, address indexed employee);
    event EmployeeDeactivated(address indexed company, address indexed employee);
    event PaymentProcessed(address indexed company, address indexed employee, uint256 amount, string paymentType);
    event BatchPaymentProcessed(address indexed company, uint256 employeeCount, uint256 totalAmount);

    /**
     * @notice Register a company
     * @param _companyName Name of the company
     */
    function registerCompany(string memory _companyName) external {
        require(!companies[msg.sender].isRegistered, "Company already registered");
        require(bytes(_companyName).length > 0, "Company name required");

        companies[msg.sender] = Company({
            name: _companyName,
            companyAddress: msg.sender,
            registeredAt: block.timestamp,
            isRegistered: true
        });

        emit CompanyRegistered(msg.sender, _companyName, block.timestamp);
    }

    /**
     * @notice Create employee profile
     */
    function createEmployee(
        address _employeeAddress,
        string memory _firstName,
        string memory _lastName,
        string memory _email,
        Role _role,
        string memory _department,
        uint256 _monthlySalary,
        address _managerAddress,
        string memory _taxJurisdiction,
        address _paymentAddress
    ) external {
        require(companies[msg.sender].isRegistered, "Company not registered");
        require(_employeeAddress != address(0), "Invalid employee address");
        require(!employees[msg.sender][_employeeAddress].isActive, "Employee already exists");
        require(_monthlySalary > 0, "Salary must be greater than 0");

        uint256 employeeId = employeeCount[msg.sender] + 1;
        employeeCount[msg.sender] = employeeId;

        address paymentAddr = _paymentAddress == address(0) ? _employeeAddress : _paymentAddress;

        employees[msg.sender][_employeeAddress] = Employee({
            employeeAddress: _employeeAddress,
            employeeId: employeeId,
            firstName: _firstName,
            lastName: _lastName,
            email: _email,
            role: _role,
            department: _department,
            monthlySalary: _monthlySalary,
            managerAddress: _managerAddress,
            taxJurisdiction: _taxJurisdiction,
            paymentAddress: paymentAddr,
            isActive: true,
            createdAt: block.timestamp
        });

        emit EmployeeCreated(msg.sender, _employeeAddress, employeeId);
    }

    /**
     * @notice Update employee salary
     */
    function updateEmployeeSalary(address _employeeAddress, uint256 _newSalary) external {
        require(companies[msg.sender].isRegistered, "Company not registered");
        require(employees[msg.sender][_employeeAddress].isActive, "Employee not found");
        require(_newSalary > 0, "Salary must be greater than 0");

        employees[msg.sender][_employeeAddress].monthlySalary = _newSalary;
        emit EmployeeUpdated(msg.sender, _employeeAddress);
    }

    /**
     * @notice Deactivate employee
     */
    function deactivateEmployee(address _employeeAddress) external {
        require(companies[msg.sender].isRegistered, "Company not registered");
        require(employees[msg.sender][_employeeAddress].isActive, "Employee not found");

        employees[msg.sender][_employeeAddress].isActive = false;
        emit EmployeeDeactivated(msg.sender, _employeeAddress);
    }

    /**
     * @notice Process single payment
     */
    function processPayment(
        address _employeeAddress,
        uint256 _amount,
        string memory _paymentType
    ) external payable nonReentrant {
        require(companies[msg.sender].isRegistered, "Company not registered");
        require(employees[msg.sender][_employeeAddress].isActive, "Employee not active");
        require(_amount > 0, "Amount must be greater than 0");
        require(msg.value >= _amount, "Insufficient payment");

        Employee memory employee = employees[msg.sender][_employeeAddress];

        // Send payment to employee
        (bool success, ) = employee.paymentAddress.call{value: _amount}("");
        require(success, "Payment failed");

        // Record payment
        paymentHistory[_employeeAddress].push(Payment({
            employee: _employeeAddress,
            amount: _amount,
            timestamp: block.timestamp,
            paymentType: _paymentType
        }));

        // Refund excess
        if (msg.value > _amount) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - _amount}("");
            require(refundSuccess, "Refund failed");
        }

        emit PaymentProcessed(msg.sender, _employeeAddress, _amount, _paymentType);
    }

    /**
     * @notice Process batch payments (gas optimized for Base)
     */
    function processBatchPayments(
        address[] memory _employees,
        uint256[] memory _amounts,
        string memory _paymentType
    ) external payable nonReentrant {
        require(companies[msg.sender].isRegistered, "Company not registered");
        require(_employees.length == _amounts.length, "Array length mismatch");
        require(_employees.length > 0, "No employees");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }
        require(msg.value >= totalAmount, "Insufficient payment");

        for (uint256 i = 0; i < _employees.length; i++) {
            address employeeAddr = _employees[i];
            uint256 amount = _amounts[i];

            require(employees[msg.sender][employeeAddr].isActive, "Employee not active");

            Employee memory employee = employees[msg.sender][employeeAddr];

            // Send payment
            (bool success, ) = employee.paymentAddress.call{value: amount}("");
            require(success, "Payment failed");

            // Record payment
            paymentHistory[employeeAddr].push(Payment({
                employee: employeeAddr,
                amount: amount,
                timestamp: block.timestamp,
                paymentType: _paymentType
            }));
        }

        // Refund excess
        if (msg.value > totalAmount) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - totalAmount}("");
            require(refundSuccess, "Refund failed");
        }

        emit BatchPaymentProcessed(msg.sender, _employees.length, totalAmount);
    }

    /**
     * @notice Get company info
     */
    function getCompanyInfo(address _company) external view returns (Company memory) {
        return companies[_company];
    }

    /**
     * @notice Get employee info
     */
    function getEmployee(address _company, address _employee) external view returns (Employee memory) {
        return employees[_company][_employee];
    }

    /**
     * @notice Get payment history for employee
     */
    function getPaymentHistory(address _employee) external view returns (Payment[] memory) {
        return paymentHistory[_employee];
    }

    /**
     * @notice Check if company is registered
     */
    function isCompanyRegistered(address _company) external view returns (bool) {
        return companies[_company].isRegistered;
    }

    /**
     * @notice Get employee count for company
     */
    function getCompanyEmployeeCount(address _company) external view returns (uint256) {
        return employeeCount[_company];
    }
}
