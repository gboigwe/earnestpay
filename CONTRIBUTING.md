# 👋 Contributing to EarnestPay

We're excited to have you contribute to EarnestPay! This guide will help you get started with the development process and our contribution guidelines.

## 🚀 Getting Started

1. **Fork the Repository**
   - Click the "Fork" button in the top-right corner
   - Clone your forked repository:
     ```bash
     git clone https://github.com/your-username/earnestpay.git
     cd earnestpay
     ```

2. **Set Up Development Environment**
   - Install Node.js 18+ and pnpm
   - Install dependencies:
     ```bash
     cd frontend
     pnpm install
     ```
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```

3. **Development Workflow**
   - Create a new branch for your feature/fix:
     ```bash
     git checkout -b feature/your-feature-name
     ```
   - Make your changes
   - Run tests:
     ```bash
     pnpm test
     ```
   - Commit your changes with a descriptive message
   - Push to your fork and create a pull request

## 🛠️ Multi-Chain Development

### Adding a New Chain

1. Update the `ChainType` type in `frontend/contexts/ChainContext.tsx`
2. Add the chain configuration to the `supportedChains` array
3. Update the wallet connection logic if needed
4. Add chain-specific RPC URLs and configuration

### Testing Multi-Chain Features

- Test on at least one testnet for each affected chain
- Verify wallet connection and transaction signing
- Test chain switching functionality
- Ensure proper error handling for unsupported chains

## 📝 Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Write meaningful commit messages
- Keep PRs focused on a single feature or fix
- Add tests for new functionality

## 🐛 Reporting Issues

When reporting issues, please include:

1. A clear title and description
2. Steps to reproduce the issue
3. Expected vs. actual behavior
4. Browser/OS version
5. Any relevant console errors

## 🔄 Pull Request Process

1. Ensure all tests pass
2. Update the documentation if needed
3. Add a clear description of your changes
4. Reference any related issues
5. Request reviews from maintainers

## 📚 Learning Resources

- [Aptos Developer Docs](https://aptos.dev/)
- [Ethereum Developer Docs](https://ethereum.org/developers/)
- [Wagmi Documentation](https://wagmi.sh/)
- [React Documentation](https://reactjs.org/)

## 🤝 Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🙏 Thank You!

We appreciate your contributions to make EarnestPay better!
