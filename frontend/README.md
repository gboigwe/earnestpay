# EarnestPay - Blockchain Payroll Management Platform

EarnestPay is a comprehensive payroll management system built on the Aptos blockchain. It enables companies to manage employee payroll, process payments, schedule automated payments, and handle tax compliance—all secured by blockchain technology.

## 🚀 Features

### Core Functionality
- **Company Registration** - Register your company on-chain with immutable records
- **Employee Management** - Add, update, and manage employee profiles with blockchain verification
- **Payroll Processing** - Process individual and batch payments with APT cryptocurrency
- **Payment Scheduling** - Automate recurring payments (weekly, bi-weekly, monthly)
- **Tax & Compliance** - Built-in tax calculation for multiple jurisdictions (US Federal, State, etc.)
- **Payment History** - Complete audit trail of all transactions on-chain
- **Treasury Management** - Company wallet for managing payroll funds

### User Experience
- **Modern Dashboard** - Professional, user-friendly interface with real-time stats
- **Wallet Integration** - Seamless connection with Aptos wallets (Petra, Martian, etc.)
- **Confirmation Dialogs** - Safety checks before critical financial transactions
- **Error Handling** - User-friendly error messages with actionable guidance
- **Responsive Design** - Mobile-first design that works on all devices
- **Loading States** - Skeleton loaders for better perceived performance
- **Empty States** - Helpful guidance when no data is available

## 🛠 Tech Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast development and build tool
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Framer Motion** - Smooth animations
- **Aptos Wallet Adapter** - Wallet connection

### Blockchain
- **Aptos TS SDK** - Blockchain interactions
- **Move Language** - Smart contracts
- **Aptos Devnet** - Development network

### State Management
- **React Hooks** - Local state management
- **IndexedDB** - Client-side employee caching

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Update .env with your configuration
VITE_APP_NETWORK=devnet
VITE_MODULE_ADDRESS=your_module_address
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Opens the app at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📝 Move Smart Contract Commands

The application uses the [aptos-cli npm package](https://github.com/aptos-labs/aptos-cli) for Move contract management:

```bash
# Compile Move contracts
npm run move:compile

# Run Move tests
npm run move:test

# Publish contracts to devnet
npm run move:publish

# Upgrade existing contracts
npm run move:upgrade
```

## 🎨 Key Components

### Dashboard Components
- `PayrollDashboard` - Main dashboard with navigation
- `CompanyStatus` - Real-time company statistics
- `ModernNavigation` - Sidebar and mobile navigation

### Core Features
- `CompanyRegistration` - Register company on-chain
- `EmployeeProfileForm` - Add/edit employee profiles
- `ProcessPayroll` - Individual and batch payment processing
- `SchedulerManager` - Automated payment scheduling
- `TaxCompliance` - Tax calculation and compliance

### UI Components
- `WalletButton` - Wallet connection with balance display
- `ConfirmationDialog` - Transaction confirmation modals
- `EmptyState` - Helpful empty state components
- `Skeleton` - Loading state indicators

## 🎨 Design System

### Color Palette
- **Primary** - Blue-Green (#0891b2) - Trust & Financial Stability
- **Success** - Green (#10b981) - Successful Transactions
- **Warning** - Amber (#f59e0b) - Alerts & Warnings
- **Info** - Blue (#3b82f6) - Information
- **Destructive** - Red (#ef4444) - Errors & Deletions

### Typography
- **Font Family** - Inter (Professional, readable)
- **Heading Scales** - 24px, 30px, 48px
- **Body Text** - 16px, 18px

## 🔐 Security Features

- **Confirmation Dialogs** - Prevent accidental transactions
- **Wallet Verification** - All transactions require wallet signature
- **Error Prevention** - Client-side validation before blockchain submission
- **Gas Estimation** - Pre-transaction gas checks
- **Immutable Records** - Company and employee data stored on-chain

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Tablet Support** - Adaptive layouts for tablets
- **Desktop Experience** - Full-featured desktop interface
- **Touch Friendly** - Large touch targets (44x44px minimum)

## 🚀 Deployment

### Vercel Deployment
```bash
npm run deploy
```

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables on your hosting platform

## 📊 Smart Contract Architecture

### Modules
- `payroll_manager.move` - Core payroll logic
- `employee_registry.move` - Employee management
- `payment_scheduler.move` - Automated scheduling
- `tax_calculator.move` - Tax computation
- `company_treasury.move` - Fund management

### Key Functions
- `register_company()` - Register new company
- `create_employee_profile()` - Add employee
- `process_payment()` - Send payment
- `create_payment_schedule()` - Schedule recurring payment
- `calculate_taxes()` - Compute tax withholdings

## 🧪 Testing

```bash
# Run Move contract tests
npm run move:test

# Frontend unit tests (if configured)
npm test
```

## 📈 Performance Optimizations

- **Skeleton Loaders** - Instant visual feedback
- **Lazy Loading** - Code splitting for faster loads
- **Caching** - IndexedDB for employee data
- **Optimistic Updates** - Immediate UI updates
- **Batch Processing** - Efficient multi-payment handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Aptos Labs for blockchain infrastructure
- shadcn/ui for beautiful components
- Lucide React for icons
- Framer Motion for animations

---

Built with ❤️ on Aptos Blockchain
