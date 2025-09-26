module payroll_addr::payment_scheduler {
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    // Error codes
    const E_SCHEDULE_NOT_FOUND: u64 = 1;
    const E_UNAUTHORIZED: u64 = 2;
    const E_INVALID_FREQUENCY: u64 = 3;
    const E_INVALID_AMOUNT: u64 = 4;
    const E_SCHEDULE_ALREADY_EXISTS: u64 = 5;

    // Payment types
    const PAYMENT_TYPE_SALARY: u8 = 0;
    const PAYMENT_TYPE_BONUS: u8 = 1;
    const PAYMENT_TYPE_OVERTIME: u8 = 2;
    const PAYMENT_TYPE_COMMISSION: u8 = 3;

    // Payment frequencies (in seconds)
    const FREQUENCY_WEEKLY: u64 = 604800; // 7 days
    const FREQUENCY_BIWEEKLY: u64 = 1209600; // 14 days
    const FREQUENCY_MONTHLY: u64 = 2592000; // 30 days
    const FREQUENCY_QUARTERLY: u64 = 7776000; // 90 days
    const FREQUENCY_ANNUALLY: u64 = 31536000; // 365 days

    // Payment schedule structure
    struct PaymentSchedule has store {
        id: u64,
        employee_address: address,
        payment_type: u8,
        frequency: u64, // in seconds
        amount: u64,
        next_payment_time: u64,
        last_payment_time: u64,
        is_active: bool,
        created_by: address,
        created_at: u64
    }

    // Company payment schedules
    struct PaymentScheduleRegistry has key {
        company_address: address,
        schedules: vector<PaymentSchedule>,
        next_schedule_id: u64
    }

    // Events
    #[event]
    struct PaymentScheduleCreated has drop, store {
        company_address: address,
        schedule_id: u64,
        employee_address: address,
        payment_type: u8,
        frequency: u64,
        amount: u64,
        created_by: address
    }

    #[event]
    struct PaymentScheduleUpdated has drop, store {
        company_address: address,
        schedule_id: u64,
        updated_by: address
    }

    #[event]
    struct PaymentScheduleDeactivated has drop, store {
        company_address: address,
        schedule_id: u64,
        deactivated_by: address
    }

    #[event]
    struct ScheduledPaymentExecuted has drop, store {
        company_address: address,
        schedule_id: u64,
        employee_address: address,
        amount: u64,
        executed_at: u64
    }

    // Initialize payment schedule registry
    public entry fun initialize_scheduler(account: &signer) {
        let company_address = std::signer::address_of(account);
        
        if (!exists<PaymentScheduleRegistry>(company_address)) {
            let registry = PaymentScheduleRegistry {
                company_address,
                schedules: vector::empty<PaymentSchedule>(),
                next_schedule_id: 1
            };
            move_to(account, registry);
        };
    }

    // Create a new payment schedule
    public entry fun create_payment_schedule(
        account: &signer,
        employee_address: address,
        payment_type: u8,
        frequency: u64,
        amount: u64,
        start_date: u64
    ) acquires PaymentScheduleRegistry {
        let company_address = std::signer::address_of(account);
        assert!(amount > 0, E_INVALID_AMOUNT);
        assert!(is_valid_frequency(frequency), E_INVALID_FREQUENCY);
        
        // Initialize registry if it doesn't exist
        if (!exists<PaymentScheduleRegistry>(company_address)) {
            initialize_scheduler(account);
        };
        
        let registry = borrow_global_mut<PaymentScheduleRegistry>(company_address);
        let current_time = timestamp::now_seconds();
        let next_payment = if (start_date > current_time) { start_date } else { current_time + frequency };
        
        let schedule = PaymentSchedule {
            id: registry.next_schedule_id,
            employee_address,
            payment_type,
            frequency,
            amount,
            next_payment_time: next_payment,
            last_payment_time: 0,
            is_active: true,
            created_by: company_address,
            created_at: current_time
        };
        
        vector::push_back(&mut registry.schedules, schedule);
        
        // Emit event
        event::emit(PaymentScheduleCreated {
            company_address,
            schedule_id: registry.next_schedule_id,
            employee_address,
            payment_type,
            frequency,
            amount,
            created_by: company_address
        });
        
        registry.next_schedule_id = registry.next_schedule_id + 1;
    }

    // Update payment schedule amount
    public entry fun update_schedule_amount(
        account: &signer,
        schedule_id: u64,
        new_amount: u64
    ) acquires PaymentScheduleRegistry {
        let company_address = std::signer::address_of(account);
        assert!(new_amount > 0, E_INVALID_AMOUNT);
        assert!(exists<PaymentScheduleRegistry>(company_address), E_SCHEDULE_NOT_FOUND);
        
        let registry = borrow_global_mut<PaymentScheduleRegistry>(company_address);
        let schedule_index = find_schedule_index(&registry.schedules, schedule_id);
        assert!(schedule_index < vector::length(&registry.schedules), E_SCHEDULE_NOT_FOUND);
        
        let schedule = vector::borrow_mut(&mut registry.schedules, schedule_index);
        schedule.amount = new_amount;
        
        // Emit event
        event::emit(PaymentScheduleUpdated {
            company_address,
            schedule_id,
            updated_by: company_address
        });
    }

    // Deactivate payment schedule
    public entry fun deactivate_schedule(
        account: &signer,
        schedule_id: u64
    ) acquires PaymentScheduleRegistry {
        let company_address = std::signer::address_of(account);
        assert!(exists<PaymentScheduleRegistry>(company_address), E_SCHEDULE_NOT_FOUND);
        
        let registry = borrow_global_mut<PaymentScheduleRegistry>(company_address);
        let schedule_index = find_schedule_index(&registry.schedules, schedule_id);
        assert!(schedule_index < vector::length(&registry.schedules), E_SCHEDULE_NOT_FOUND);
        
        let schedule = vector::borrow_mut(&mut registry.schedules, schedule_index);
        schedule.is_active = false;
        
        // Emit event
        event::emit(PaymentScheduleDeactivated {
            company_address,
            schedule_id,
            deactivated_by: company_address
        });
    }

    // Execute due payments (this would be called by an automated system)
    public entry fun execute_due_payments(account: &signer) acquires PaymentScheduleRegistry {
        let company_address = std::signer::address_of(account);
        assert!(exists<PaymentScheduleRegistry>(company_address), E_SCHEDULE_NOT_FOUND);
        
        let registry = borrow_global_mut<PaymentScheduleRegistry>(company_address);
        let current_time = timestamp::now_seconds();
        let schedules_len = vector::length(&registry.schedules);
        let i = 0;
        
        while (i < schedules_len) {
            let schedule = vector::borrow_mut(&mut registry.schedules, i);
            
            if (schedule.is_active && schedule.next_payment_time <= current_time) {
                // Update schedule for next payment
                schedule.last_payment_time = current_time;
                schedule.next_payment_time = current_time + schedule.frequency;
                
                // Emit event for payment execution
                event::emit(ScheduledPaymentExecuted {
                    company_address,
                    schedule_id: schedule.id,
                    employee_address: schedule.employee_address,
                    amount: schedule.amount,
                    executed_at: current_time
                });
                
                // In a real implementation, this would trigger the actual payment
                // payroll_manager::process_payment(account, schedule.employee_address, schedule.amount);
            };
            
            i = i + 1;
        };
    }

    // Helper function to find schedule index
    fun find_schedule_index(schedules: &vector<PaymentSchedule>, schedule_id: u64): u64 {
        let len = vector::length(schedules);
        let i = 0;
        
        while (i < len) {
            let schedule = vector::borrow(schedules, i);
            if (schedule.id == schedule_id) {
                return i
            };
            i = i + 1;
        };
        
        len // Return invalid index if not found
    }

    // Helper function to validate frequency
    fun is_valid_frequency(frequency: u64): bool {
        frequency == FREQUENCY_WEEKLY ||
        frequency == FREQUENCY_BIWEEKLY ||
        frequency == FREQUENCY_MONTHLY ||
        frequency == FREQUENCY_QUARTERLY ||
        frequency == FREQUENCY_ANNUALLY ||
        frequency >= 86400 // At least daily (24 hours)
    }

    // View functions
    #[view]
    public fun get_payment_schedule(
        company_address: address,
        schedule_id: u64
    ): (u64, address, u8, u64, u64, u64, u64, bool) acquires PaymentScheduleRegistry {
        assert!(exists<PaymentScheduleRegistry>(company_address), E_SCHEDULE_NOT_FOUND);
        
        let registry = borrow_global<PaymentScheduleRegistry>(company_address);
        let schedule_index = find_schedule_index(&registry.schedules, schedule_id);
        assert!(schedule_index < vector::length(&registry.schedules), E_SCHEDULE_NOT_FOUND);
        
        let schedule = vector::borrow(&registry.schedules, schedule_index);
        (
            schedule.id,
            schedule.employee_address,
            schedule.payment_type,
            schedule.frequency,
            schedule.amount,
            schedule.next_payment_time,
            schedule.last_payment_time,
            schedule.is_active
        )
    }

    #[view]
    public fun get_employee_schedules_count(
        company_address: address,
        employee_address: address
    ): u64 acquires PaymentScheduleRegistry {
        if (!exists<PaymentScheduleRegistry>(company_address)) {
            return 0
        };
        
        let registry = borrow_global<PaymentScheduleRegistry>(company_address);
        let schedules = &registry.schedules;
        let len = vector::length(schedules);
        let count = 0;
        let i = 0;
        
        while (i < len) {
            let schedule = vector::borrow(schedules, i);
            if (schedule.employee_address == employee_address && schedule.is_active) {
                count = count + 1;
            };
            i = i + 1;
        };
        
        count
    }

    #[view]
    public fun get_due_payments_count(company_address: address): u64 acquires PaymentScheduleRegistry {
        if (!exists<PaymentScheduleRegistry>(company_address)) {
            return 0
        };
        
        let registry = borrow_global<PaymentScheduleRegistry>(company_address);
        let current_time = timestamp::now_seconds();
        let schedules = &registry.schedules;
        let len = vector::length(schedules);
        let count = 0;
        let i = 0;
        
        while (i < len) {
            let schedule = vector::borrow(schedules, i);
            if (schedule.is_active && schedule.next_payment_time <= current_time) {
                count = count + 1;
            };
            i = i + 1;
        };
        
        count
    }

    #[view]
    public fun get_total_schedules_count(company_address: address): u64 acquires PaymentScheduleRegistry {
        if (!exists<PaymentScheduleRegistry>(company_address)) {
            return 0
        };
        
        let registry = borrow_global<PaymentScheduleRegistry>(company_address);
        vector::length(&registry.schedules)
    }
}