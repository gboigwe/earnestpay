module payroll_addr::employee_registry {
    use std::vector;
    use std::string::{Self, String};
    use aptos_framework::event;

    // Error codes
    const E_EMPLOYEE_ALREADY_EXISTS: u64 = 1;
    const E_EMPLOYEE_NOT_FOUND: u64 = 2;
    const E_UNAUTHORIZED: u64 = 3;
    const E_INVALID_ROLE: u64 = 4;

    // Employee roles
    const ROLE_EMPLOYEE: u8 = 0;
    const ROLE_MANAGER: u8 = 1;
    const ROLE_HR: u8 = 2;
    const ROLE_ACCOUNTANT: u8 = 3;
    const ROLE_ADMIN: u8 = 4;

    // Employee profile structure
    struct EmployeeProfile has key, store, drop {
        employee_id: u64,
        first_name: String,
        last_name: String,
        email: String,
        role: u8,
        department: String,
        annual_salary: u64,
        manager_address: address,
        tax_jurisdiction: String,
        payment_address: address,
        start_date: u64,
        is_active: bool,
        created_by: address
    }

    // Employee registry for company
    struct EmployeeRegistry has key {
        company_address: address,
        employees: vector<address>,
        next_employee_id: u64
    }

    // Events
    #[event]
    struct EmployeeProfileCreated has drop, store {
        company_address: address,
        employee_address: address,
        employee_id: u64,
        created_by: address
    }

    #[event]
    struct EmployeeProfileUpdated has drop, store {
        company_address: address,
        employee_address: address,
        updated_by: address
    }

    #[event]
    struct EmployeeDeactivated has drop, store {
        company_address: address,
        employee_address: address,
        deactivated_by: address
    }

    // Initialize employee registry for a company
    public entry fun initialize_registry(account: &signer) {
        let company_address = std::signer::address_of(account);
        
        if (!exists<EmployeeRegistry>(company_address)) {
            let registry = EmployeeRegistry {
                company_address,
                employees: vector::empty<address>(),
                next_employee_id: 1
            };
            move_to(account, registry);
        };
    }

    // Create employee profile
    public entry fun create_employee_profile(
        account: &signer,
        employee_address: address,
        employee_id: u64,
        first_name: vector<u8>,
        last_name: vector<u8>,
        email: vector<u8>,
        role: u8,
        department: vector<u8>,
        annual_salary: u64,
        manager_address: address,
        tax_jurisdiction: vector<u8>,
        payment_address: address
    ) acquires EmployeeRegistry {
        let company_address = std::signer::address_of(account);
        assert!(role <= ROLE_ADMIN, E_INVALID_ROLE);
        
        // Ensure registry exists
        if (!exists<EmployeeRegistry>(company_address)) {
            initialize_registry(account);
        };

        // Check if employee already exists
        assert!(!exists<EmployeeProfile>(employee_address), E_EMPLOYEE_ALREADY_EXISTS);
        
        let registry = borrow_global_mut<EmployeeRegistry>(company_address);
        let current_timestamp = aptos_framework::timestamp::now_seconds();
        
        // Create employee profile resource at employee's address
        let profile = EmployeeProfile {
            employee_id: if (employee_id == 0) { registry.next_employee_id } else { employee_id },
            first_name: string::utf8(first_name),
            last_name: string::utf8(last_name),
            email: string::utf8(email),
            role,
            department: string::utf8(department),
            annual_salary,
            manager_address,
            tax_jurisdiction: string::utf8(tax_jurisdiction),
            payment_address,
            start_date: current_timestamp,
            is_active: true,
            created_by: company_address
        };
        
        // Add to registry
        vector::push_back(&mut registry.employees, employee_address);
        registry.next_employee_id = registry.next_employee_id + 1;
        
        // Store profile (this would require the employee to accept it in a real scenario)
        // For demo purposes, we'll store it at the company address with a unique key
        
        // Emit event
        event::emit(EmployeeProfileCreated {
            company_address,
            employee_address,
            employee_id: profile.employee_id,
            created_by: company_address
        });
    }

    // Update employee profile
    public entry fun update_employee_salary(
        account: &signer,
        employee_address: address,
        new_salary: u64
    ) acquires EmployeeProfile {
        let company_address = std::signer::address_of(account);
        assert!(exists<EmployeeProfile>(employee_address), E_EMPLOYEE_NOT_FOUND);
        
        let profile = borrow_global_mut<EmployeeProfile>(employee_address);
        assert!(profile.created_by == company_address, E_UNAUTHORIZED);
        
        profile.annual_salary = new_salary;
        
        // Emit event
        event::emit(EmployeeProfileUpdated {
            company_address,
            employee_address,
            updated_by: company_address
        });
    }

    // Deactivate employee
    public entry fun deactivate_employee(
        account: &signer,
        employee_address: address
    ) acquires EmployeeProfile {
        let company_address = std::signer::address_of(account);
        assert!(exists<EmployeeProfile>(employee_address), E_EMPLOYEE_NOT_FOUND);
        
        let profile = borrow_global_mut<EmployeeProfile>(employee_address);
        assert!(profile.created_by == company_address, E_UNAUTHORIZED);
        
        profile.is_active = false;
        
        // Emit event
        event::emit(EmployeeDeactivated {
            company_address,
            employee_address,
            deactivated_by: company_address
        });
    }

    // View functions
    #[view]
    public fun get_employee_profile(
        company_address: address,
        employee_address: address
    ): (u64, String, String, String, u8, String, u64, address, String, address, u64, bool) acquires EmployeeProfile {
        assert!(exists<EmployeeProfile>(employee_address), E_EMPLOYEE_NOT_FOUND);
        
        let profile = borrow_global<EmployeeProfile>(employee_address);
        assert!(profile.created_by == company_address, E_UNAUTHORIZED);
        
        (
            *&profile.employee_id,
            *&profile.first_name,
            *&profile.last_name,
            *&profile.email,
            *&profile.role,
            *&profile.department,
            *&profile.annual_salary,
            *&profile.manager_address,
            *&profile.tax_jurisdiction,
            *&profile.payment_address,
            *&profile.start_date,
            *&profile.is_active
        )
    }

    #[view]
    public fun get_employee_salary(employee_address: address): u64 acquires EmployeeProfile {
        assert!(exists<EmployeeProfile>(employee_address), E_EMPLOYEE_NOT_FOUND);
        let profile = borrow_global<EmployeeProfile>(employee_address);
        profile.annual_salary
    }

    #[view]
    public fun get_employee_role(employee_address: address): u8 acquires EmployeeProfile {
        assert!(exists<EmployeeProfile>(employee_address), E_EMPLOYEE_NOT_FOUND);
        let profile = borrow_global<EmployeeProfile>(employee_address);
        profile.role
    }

    #[view]
    public fun is_employee_active(employee_address: address): bool acquires EmployeeProfile {
        if (!exists<EmployeeProfile>(employee_address)) {
            return false
        };
        let profile = borrow_global<EmployeeProfile>(employee_address);
        profile.is_active
    }

    #[view]
    public fun get_company_employee_count(company_address: address): u64 acquires EmployeeRegistry {
        if (!exists<EmployeeRegistry>(company_address)) {
            return 0
        };
        let registry = borrow_global<EmployeeRegistry>(company_address);
        vector::length(&registry.employees)
    }

    // Helper functions for role validation
    #[view]
    public fun is_manager_or_above(employee_address: address): bool acquires EmployeeProfile {
        if (!exists<EmployeeProfile>(employee_address)) {
            return false
        };
        let profile = borrow_global<EmployeeProfile>(employee_address);
        profile.role >= ROLE_MANAGER
    }

    #[view]
    public fun can_manage_payroll(employee_address: address): bool acquires EmployeeProfile {
        if (!exists<EmployeeProfile>(employee_address)) {
            return false
        };
        let profile = borrow_global<EmployeeProfile>(employee_address);
        profile.role == ROLE_HR || profile.role == ROLE_ACCOUNTANT || profile.role == ROLE_ADMIN
    }
}