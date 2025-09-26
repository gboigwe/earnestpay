module payroll_addr::tax_calculator {
    use std::vector;
    use std::string::{Self, String};
    use aptos_framework::event;

    // Error codes
    const E_INVALID_JURISDICTION: u64 = 1;
    const E_INVALID_AMOUNT: u64 = 2;
    const E_TAX_RATE_NOT_FOUND: u64 = 3;
    const E_UNAUTHORIZED: u64 = 4;

    // Tax jurisdiction codes
    const JURISDICTION_US_FEDERAL: vector<u8> = b"US_FED";
    const JURISDICTION_US_CA: vector<u8> = b"US_CA";
    const JURISDICTION_US_NY: vector<u8> = b"US_NY";
    const JURISDICTION_US_TX: vector<u8> = b"US_TX";
    const JURISDICTION_UK: vector<u8> = b"UK";
    const JURISDICTION_EU_DE: vector<u8> = b"EU_DE";
    const JURISDICTION_EU_FR: vector<u8> = b"EU_FR";

    // Tax calculation result
    struct TaxCalculation has store, copy, drop {
        gross_amount: u64,
        federal_tax: u64,
        state_tax: u64,
        social_security: u64,
        medicare: u64,
        unemployment: u64,
        total_taxes: u64,
        net_amount: u64,
        jurisdiction: String
    }

    // Tax rate structure
    struct TaxRate has store {
        jurisdiction_code: String,
        federal_rate: u64, // Basis points (e.g., 2200 = 22%)
        state_rate: u64,
        social_security_rate: u64,
        medicare_rate: u64,
        unemployment_rate: u64,
        is_active: bool
    }

    // Tax configuration for company
    struct TaxConfiguration has key {
        company_address: address,
        supported_jurisdictions: vector<TaxRate>,
        default_jurisdiction: String
    }

    // Employee tax records
    struct EmployeeTaxRecord has key {
        employee_address: address,
        company_address: address,
        jurisdiction: String,
        ytd_gross: u64,
        ytd_taxes: u64,
        tax_calculations: vector<TaxCalculation>
    }

    // Events
    #[event]
    struct TaxConfigurationUpdated has drop, store {
        company_address: address,
        jurisdiction: String,
        updated_by: address
    }

    #[event]
    struct TaxCalculated has drop, store {
        company_address: address,
        employee_address: address,
        gross_amount: u64,
        total_taxes: u64,
        net_amount: u64,
        jurisdiction: String
    }

    // Initialize tax configuration for company
    public entry fun initialize_tax_config(account: &signer) {
        let company_address = std::signer::address_of(account);
        
        if (!exists<TaxConfiguration>(company_address)) {
            let config = TaxConfiguration {
                company_address,
                supported_jurisdictions: vector::empty<TaxRate>(),
                default_jurisdiction: string::utf8(JURISDICTION_US_FEDERAL)
            };
            
            // Add default US tax rates
            add_default_tax_rates(&mut config.supported_jurisdictions);
            
            move_to(account, config);
        };
    }

    // Add or update tax rate for jurisdiction
    public entry fun update_tax_rate(
        account: &signer,
        jurisdiction_code: vector<u8>,
        federal_rate: u64,
        state_rate: u64,
        social_security_rate: u64,
        medicare_rate: u64,
        unemployment_rate: u64
    ) acquires TaxConfiguration {
        let company_address = std::signer::address_of(account);
        
        if (!exists<TaxConfiguration>(company_address)) {
            initialize_tax_config(account);
        };
        
        let config = borrow_global_mut<TaxConfiguration>(company_address);
        let jurisdiction_str = string::utf8(jurisdiction_code);
        
        // Find existing rate or add new one
        let rates = &mut config.supported_jurisdictions;
        let len = vector::length(rates);
        let found = false;
        let i = 0;
        
        while (i < len && !found) {
            let rate = vector::borrow_mut(rates, i);
            if (rate.jurisdiction_code == jurisdiction_str) {
                rate.federal_rate = federal_rate;
                rate.state_rate = state_rate;
                rate.social_security_rate = social_security_rate;
                rate.medicare_rate = medicare_rate;
                rate.unemployment_rate = unemployment_rate;
                rate.is_active = true;
                found = true;
            };
            i = i + 1;
        };
        
        if (!found) {
            let new_rate = TaxRate {
                jurisdiction_code: jurisdiction_str,
                federal_rate,
                state_rate,
                social_security_rate,
                medicare_rate,
                unemployment_rate,
                is_active: true
            };
            vector::push_back(rates, new_rate);
        };
        
        // Emit event
        event::emit(TaxConfigurationUpdated {
            company_address,
            jurisdiction: jurisdiction_str,
            updated_by: company_address
        });
    }

    // Calculate taxes for an employee payment
    public fun calculate_taxes(
        company_address: address,
        _employee_address: address,
        gross_amount: u64,
        jurisdiction_code: vector<u8>
    ): TaxCalculation acquires TaxConfiguration {
        assert!(gross_amount > 0, E_INVALID_AMOUNT);
        assert!(exists<TaxConfiguration>(company_address), E_TAX_RATE_NOT_FOUND);
        
        let config = borrow_global<TaxConfiguration>(company_address);
        let jurisdiction_str = string::utf8(jurisdiction_code);
        let rates = &config.supported_jurisdictions;
        let tax_rate = find_tax_rate(rates, &jurisdiction_str);
        
        // Calculate individual tax components (using basis points)
        let federal_tax = (gross_amount * tax_rate.federal_rate) / 10000;
        let state_tax = (gross_amount * tax_rate.state_rate) / 10000;
        let social_security = (gross_amount * tax_rate.social_security_rate) / 10000;
        let medicare = (gross_amount * tax_rate.medicare_rate) / 10000;
        let unemployment = (gross_amount * tax_rate.unemployment_rate) / 10000;
        
        let total_taxes = federal_tax + state_tax + social_security + medicare + unemployment;
        let net_amount = gross_amount - total_taxes;
        
        TaxCalculation {
            gross_amount,
            federal_tax,
            state_tax,
            social_security,
            medicare,
            unemployment,
            total_taxes,
            net_amount,
            jurisdiction: jurisdiction_str
        }
    }

    // Preview tax calculation (view function)
    #[view]
    public fun preview_tax_calculation(
        employee_address: address,
        gross_amount: u64,
        jurisdiction_code: vector<u8>
    ): (u64, u64, u64, u64, u64, u64, u64, u64) acquires TaxConfiguration, EmployeeTaxRecord {
        // For preview, we'll use a default company or the employee's current company
        // In a real implementation, this would be more sophisticated
        
        if (!exists<EmployeeTaxRecord>(employee_address)) {
            // Use default rates for preview
            let federal_tax = (gross_amount * 2200) / 10000; // 22%
            let state_tax = (gross_amount * 500) / 10000; // 5%
            let social_security = (gross_amount * 620) / 10000; // 6.2%
            let medicare = (gross_amount * 145) / 10000; // 1.45%
            let unemployment = (gross_amount * 60) / 10000; // 0.6%
            let total_taxes = federal_tax + state_tax + social_security + medicare + unemployment;
            let net_amount = gross_amount - total_taxes;
            
            return (gross_amount, federal_tax, state_tax, social_security, medicare, unemployment, total_taxes, net_amount)
        };
        
        let record = borrow_global<EmployeeTaxRecord>(employee_address);
        let calculation = calculate_taxes(record.company_address, employee_address, gross_amount, jurisdiction_code);
        
        (
            calculation.gross_amount,
            calculation.federal_tax,
            calculation.state_tax,
            calculation.social_security,
            calculation.medicare,
            calculation.unemployment,
            calculation.total_taxes,
            calculation.net_amount
        )
    }

    // Record tax calculation for employee
    public fun record_tax_calculation_internal(
        account: &signer,
        employee_address: address,
        calculation: TaxCalculation
    ) acquires EmployeeTaxRecord {
        let company_address = std::signer::address_of(account);
        
        if (!exists<EmployeeTaxRecord>(employee_address)) {
            let record = EmployeeTaxRecord {
                employee_address,
                company_address,
                jurisdiction: calculation.jurisdiction,
                ytd_gross: calculation.gross_amount,
                ytd_taxes: calculation.total_taxes,
                tax_calculations: vector::empty<TaxCalculation>()
            };
            vector::push_back(&mut record.tax_calculations, calculation);
            move_to(account, record); // Note: This would need employee consent in reality
        } else {
            let record = borrow_global_mut<EmployeeTaxRecord>(employee_address);
            record.ytd_gross = record.ytd_gross + calculation.gross_amount;
            record.ytd_taxes = record.ytd_taxes + calculation.total_taxes;
            vector::push_back(&mut record.tax_calculations, calculation);
        };
        
        // Emit event
        event::emit(TaxCalculated {
            company_address,
            employee_address,
            gross_amount: calculation.gross_amount,
            total_taxes: calculation.total_taxes,
            net_amount: calculation.net_amount,
            jurisdiction: calculation.jurisdiction
        });
    }

    // Helper function to add default tax rates
    fun add_default_tax_rates(rates: &mut vector<TaxRate>) {
        // US Federal rates
        vector::push_back(rates, TaxRate {
            jurisdiction_code: string::utf8(JURISDICTION_US_FEDERAL),
            federal_rate: 2200, // 22%
            state_rate: 0,
            social_security_rate: 620, // 6.2%
            medicare_rate: 145, // 1.45%
            unemployment_rate: 60, // 0.6%
            is_active: true
        });
        
        // California
        vector::push_back(rates, TaxRate {
            jurisdiction_code: string::utf8(JURISDICTION_US_CA),
            federal_rate: 2200,
            state_rate: 930, // 9.3%
            social_security_rate: 620,
            medicare_rate: 145,
            unemployment_rate: 60,
            is_active: true
        });
        
        // New York
        vector::push_back(rates, TaxRate {
            jurisdiction_code: string::utf8(JURISDICTION_US_NY),
            federal_rate: 2200,
            state_rate: 685, // 6.85%
            social_security_rate: 620,
            medicare_rate: 145,
            unemployment_rate: 60,
            is_active: true
        });
    }

    // Helper function to find tax rate
    fun find_tax_rate(rates: &vector<TaxRate>, jurisdiction: &String): &TaxRate {
        let len = vector::length(rates);
        let i = 0;
        
        while (i < len) {
            let rate = vector::borrow(rates, i);
            if (&rate.jurisdiction_code == jurisdiction && rate.is_active) {
                return rate
            };
            i = i + 1;
        };
        
        // Return first rate as default if not found
        assert!(len > 0, E_TAX_RATE_NOT_FOUND);
        vector::borrow(rates, 0)
    }

    // View functions
    #[view]
    public fun get_employee_ytd_summary(employee_address: address): (u64, u64) acquires EmployeeTaxRecord {
        if (!exists<EmployeeTaxRecord>(employee_address)) {
            return (0, 0)
        };
        
        let record = borrow_global<EmployeeTaxRecord>(employee_address);
        (record.ytd_gross, record.ytd_taxes)
    }

    #[view]
    public fun get_supported_jurisdictions(company_address: address): vector<String> acquires TaxConfiguration {
        if (!exists<TaxConfiguration>(company_address)) {
            return vector::empty<String>()
        };
        
        let config = borrow_global<TaxConfiguration>(company_address);
        let rates = &config.supported_jurisdictions;
        let len = vector::length(rates);
        let jurisdictions = vector::empty<String>();
        let i = 0;
        
        while (i < len) {
            let rate = vector::borrow(rates, i);
            if (rate.is_active) {
                vector::push_back(&mut jurisdictions, rate.jurisdiction_code);
            };
            i = i + 1;
        };
        
        jurisdictions
    }
}