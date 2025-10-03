# EarnestPay - Payroll you can trust—on time, every time.

## Overview

EarnestPay is a modern payroll and payouts platform for companies and salary earners, secured by Aptos. This system enables on-chain salary disbursement in stablecoins with integrated tax calculation and compliance features.

## 🚀 Key Features

### Smart Contract Capabilities
- **Company Registration & Management**: Register companies and manage treasury funds
- **Employee Registry**: Comprehensive employee profiles with role-based access control
- **Payment Scheduling**: Automated salary disbursement with flexible frequency options
- **Tax Calculation**: Multi-jurisdiction tax calculation with real-time withholding
- **Compliance Tracking**: Automated audit trails and compliance monitoring

### Frontend Features
- **Employer Dashboard**: Complete company management interface
- **Employee Portal**: Personal payroll information and document access
- **Real-time Updates**: Live balance tracking and payment status
- **Multi-role Support**: Different interfaces for employers, employees, and accountants

## 🏗️ Architecture

### Smart Contracts (Move)
```
sources/
├── payroll_manager.move      # Core payroll operations
├── employee_registry.move    # Employee management & profiles
├── payment_scheduler.move    # Automated payment scheduling
└── tax_calculator.move       # Tax calculation & compliance
```

### Frontend (React + TypeScript)
```
frontend/src/
├── App.tsx                   # Main employer dashboard
├── EmployeePortal.tsx        # Employee interface
├── WalletProvider.tsx        # Aptos wallet integration
├── WalletConnection.tsx      # Wallet connection component
└── services/payroll.ts       # Smart contract integration
```

## 🔧 Technical Stack

- **Blockchain**: Aptos (Move language)
- **Frontend**: React 18 + TypeScript + Ant Design
- **Wallet Integration**: @aptos-labs/ts-sdk + Multiple wallet adapters
- **Testing**: Move unit tests
- **Development Tools**: Aptos CLI 7.8.0

## 📋 Prerequisites

- Node.js 16+ and npm
- Aptos CLI (installed and configured)
- Supported Aptos wallet (Petra, Martian, etc.)

### 2. Clone and Setup

```bash
git clone https://github.com/gboigwe/earnestpay.git
cd earnestpay

# Install frontend dependencies
cd payroll/frontend
npm install
```

### 3. Compile Smart Contracts

```bash
# Return to root directory
cd ..

# Compile Move contracts
aptos move compile

# Run tests
aptos move test
```

### 4. Start Frontend

```bash
# Start development server
cd payroll/frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## 🎯 MVP Demonstration

### For Employers:
1. **Connect Wallet**: Connect your Aptos wallet (Petra recommended)
2. **Register Company**: Set up your company profile
3. **Add Employees**: Register employee wallet addresses and profiles
4. **Fund Treasury**: Add funds to the company treasury
5. **Process Payments**: Make salary payments to employees
6. **View Schedules**: Set up and manage automated payment schedules

### For Employees:
1. Click "Employee Portal" in the top navigation
2. **View Pay History**: See all payment records and tax withholdings
3. **Check Upcoming Payments**: View scheduled payments
4. **Download Tax Documents**: Access W-2s and tax summaries
5. **Update Information**: Manage payment preferences and tax details

## 🔒 Security Features

- **Role-based Access Control**: Different permissions for employers, HR, and accountants
- **Audit Trails**: Complete transaction history on-chain
- **Resource Safety**: Move language prevents common financial vulnerabilities

## 💰 Cost Efficiency

- **Low Transaction Costs**: ~$0.00005 per transaction on Aptos
- **Parallel Execution**: Optimized for high throughput with Block-STM
- **Gas Optimization**: Efficient contract design minimizes fees

## 🌟 Innovation Highlights

1. **Advanced Tax Integration**: Real-time, multi-jurisdiction tax calculation
2. **Automated Compliance**: Built-in regulatory compliance features
3. **Scalable Architecture**: Designed for enterprise-level operations
4. **User Experience**: Intuitive interfaces for all stakeholders
5. **Blockchain Benefits**: Transparency, immutability, and global accessibility

## 📈 Future Roadmap

### Phase 2 Features
- **Stablecoin Integration**: USDC, USDT payment support
- **Advanced Reporting**: Comprehensive analytics dashboard
- **API Integration**: Connect with existing HR systems
- **Mobile App**: Native mobile application

### Phase 3 Features
- **Multi-chain Support**: Expand to other blockchain networks
- **AI-powered Compliance**: Automated regulatory reporting
- **Benefits Management**: Health insurance and retirement plans
- **Global Expansion**: Support for international payroll

## 📜 License

This project is licensed under the [MIT License](./LICENSE). 

## 🏆 Contract Deployment Details

📝 Contract deployed at: 0x4f5ccbe1c0d287233e5d0bdf4d884c2558dbfa43816f96c4286fbab9f0047e44

📋 Your contract modules:
  - 0x4f5ccbe1c0d287233e5d0bdf4d884c2558dbfa43816f96c4286fbab9f0047e44::payroll_manager
  - 0x4f5ccbe1c0d287233e5d0bdf4d884c2558dbfa43816f96c4286fbab9f0047e44::employee_registry
  - 0x4f5ccbe1c0d287233e5d0bdf4d884c2558dbfa43816f96c4286fbab9f0047e44::payment_scheduler
  - 0x4f5ccbe1c0d287233e5d0bdf4d884c2558dbfa43816f96c4286fbab9f0047e44::tax_calculator
---

**Built with ❤️ for the Aptos ecosystem and the future of decentralized finance**
