module payroll_addr::payroll_manager {
    use std::signer;
    use std::vector;
    use aptos_framework::event;

    // Error codes
    const E_NOT_OWNER: u64 = 1;
    const E_COMPANY_NOT_REGISTERED: u64 = 2;
    const E_EMPLOYEE_NOT_FOUND: u64 = 3;
    const E_INSUFFICIENT_FUNDS: u64 = 4;
    const E_INVALID_AMOUNT: u64 = 5;

    // Company structure
    struct Company has key {
        name: vector<u8>,
        owner: address,
        treasury_balance: u64,
        employees: vector<address>,
        is_active: bool
    }

    // Payment record
    struct PaymentRecord has store, copy, drop {
        employee: address,
        amount: u64,
        payment_type: u8, // 0: salary, 1: bonus, 2: overtime, 3: commission
        timestamp: u64
    }

    // Events
    #[event]
    struct CompanyRegistered has drop, store {
        company_address: address,
        name: vector<u8>,
        owner: address
    }

    #[event]
    struct EmployeeAdded has drop, store {
        company_address: address,
        employee: address,
        added_by: address
    }

    #[event]
    struct PaymentProcessed has drop, store {
        company_address: address,
        employee: address,
        amount: u64,
        payment_type: u8,
        processed_by: address
    }

    #[event]
    struct TreasuryFunded has drop, store {
        company_address: address,
        amount: u64,
        funded_by: address
    }

    // Register a new company
    public entry fun register_company(account: &signer, name: vector<u8>) {
        let company_address = signer::address_of(account);
        
        // Create company resource
        let company = Company {
            name,
            owner: company_address,
            treasury_balance: 0,
            employees: vector::empty<address>(),
            is_active: true
        };
        
        move_to(account, company);
        
        // Emit event
        event::emit(CompanyRegistered {
            company_address,
            name,
            owner: company_address
        });
    }

    // Fund company treasury
    public entry fun fund_treasury(account: &signer, amount: u64) acquires Company {
        let company_address = signer::address_of(account);
        assert!(exists<Company>(company_address), E_COMPANY_NOT_REGISTERED);
        assert!(amount > 0, E_INVALID_AMOUNT);
        
        let company = borrow_global_mut<Company>(company_address);
        assert!(company.owner == company_address, E_NOT_OWNER);
        
        // Transfer APT to treasury (in a real implementation, this would be more complex)
        company.treasury_balance = company.treasury_balance + amount;
        
        // Emit event
        event::emit(TreasuryFunded {
            company_address,
            amount,
            funded_by: company_address
        });
    }

    // Add employee to company
    public entry fun add_employee(account: &signer, employee_address: address) acquires Company {
        let company_address = signer::address_of(account);
        assert!(exists<Company>(company_address), E_COMPANY_NOT_REGISTERED);
        
        let company = borrow_global_mut<Company>(company_address);
        assert!(company.owner == company_address, E_NOT_OWNER);
        
        // Check if employee already exists
        if (!vector::contains(&company.employees, &employee_address)) {
            vector::push_back(&mut company.employees, employee_address);
        };
        
        // Emit event
        event::emit(EmployeeAdded {
            company_address,
            employee: employee_address,
            added_by: company_address
        });
    }

    // Process payment to employee
    public entry fun process_payment(
        account: &signer, 
        employee_address: address, 
        amount: u64
    ) acquires Company {
        let company_address = signer::address_of(account);
        assert!(exists<Company>(company_address), E_COMPANY_NOT_REGISTERED);
        assert!(amount > 0, E_INVALID_AMOUNT);
        
        let company = borrow_global_mut<Company>(company_address);
        assert!(company.owner == company_address, E_NOT_OWNER);
        assert!(company.treasury_balance >= amount, E_INSUFFICIENT_FUNDS);
        assert!(vector::contains(&company.employees, &employee_address), E_EMPLOYEE_NOT_FOUND);
        
        // Deduct from treasury
        company.treasury_balance = company.treasury_balance - amount;
        
        // In a real implementation, transfer actual tokens to employee
        // coin::transfer<AptosCoin>(account, employee_address, amount);
        
        // Emit event
        event::emit(PaymentProcessed {
            company_address,
            employee: employee_address,
            amount,
            payment_type: 0, // Default to salary
            processed_by: company_address
        });
    }

    // View functions
    #[view]
    public fun get_company_info(company_address: address): (vector<u8>, address, u64, u64, bool) acquires Company {
        assert!(exists<Company>(company_address), E_COMPANY_NOT_REGISTERED);
        let company = borrow_global<Company>(company_address);
        (
            company.name,
            company.owner,
            company.treasury_balance,
            vector::length(&company.employees),
            company.is_active
        )
    }

    #[view]
    public fun get_treasury_balance(company_address: address): u64 acquires Company {
        assert!(exists<Company>(company_address), E_COMPANY_NOT_REGISTERED);
        let company = borrow_global<Company>(company_address);
        company.treasury_balance
    }

    #[view]
    public fun is_employee(company_address: address, employee_address: address): bool acquires Company {
        if (!exists<Company>(company_address)) {
            return false
        };
        let company = borrow_global<Company>(company_address);
        vector::contains(&company.employees, &employee_address)
    }

    #[view]
    public fun get_employee_count(company_address: address): u64 acquires Company {
        assert!(exists<Company>(company_address), E_COMPANY_NOT_REGISTERED);
        let company = borrow_global<Company>(company_address);
        vector::length(&company.employees)
    }
}