# Trade Tools

https://tradetools.vercel.app/

## 🎯 Key Features

### ⚖️ FX Exposure Calculator - Foreign Exchange Risk Management Tool

Professional foreign exchange risk analysis system with real-time volatility data for enterprise financial management.

- **Real Market Data**: Integration with Alpha Vantage API
- **VaR Calculation**: Value at Risk based on historical volatility
- **Smart Caching**: Automatic API call optimization
- **Rate Limiting**: Request control (5 calls/minute)
- **Full Transparency**: Complete mathematical calculation breakdown

👉 **See complete example at**: [BUSINESS_CASE_EXAMPLE.md](./app/BUSINESS_CASE_EXAMPLE.md)

### 💱 Currency Converter

A modern, responsive currency converter built with Next.js 15 and the App Router, featuring real-time exchange rates and a clean, accessible interface.

- **Real-time Exchange Rates**: Powered by ExchangeRate API
- **Multi-Currency Support**: USD, EUR, GBP, BRL, JPY, AUD, CAD, CHF, CNY
- **Smart Formatting**: Adaptive decimal precision and number formatting
- **Input Validation**: Amount limiting and error handling
- **Responsive Design**: Mobile-first approach with dark mode support

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React 19** - Latest React with modern hooks
- **API Routes** - Server-side API handling
- **Dev Container** - Consistent development environment on Debian GNU/Linux 12

## 🚀 Getting Started

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### API Configuration

1. **Alpha Vantage API Key**:
   ```bash
   # Create .env.local file
   ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

2. **Get API Key**: [Alpha Vantage Free API](https://www.alphavantage.co/support/#api-key)

👉 **Complete setup at**: [ALPHA_VANTAGE_SETUP.md](./app/ALPHA_VANTAGE_SETUP.md)

### Run the Project

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
NODE_ENV=production npm run build
```

Access [http://localhost:3000](http://localhost:3000) to use the calculator.

## 🔧 Technical Features

### Alpha Vantage Integration
- **Rate Limiting**: 5 calls per minute (automatic)
- **Daily Cache**: Volatility data persists for 24h
- **Fallback**: Synthetic data when API unavailable
- **Monitoring**: Real-time call counter

### Financial Calculations
- **Real Volatility**: Based on 30 days of historical data
- **VaR (Value at Risk)**: Industry standard formula
- **Trading Days**: 252 days per year (financial standard)
- **Transparency**: All calculations detailed in interface

### User Interface
- **Manual Control**: "Pre-calculate Volatility" button
- **Visual Indicators**: Data source status
- **Detailed Calculations**: Section with formulas and values
- **Real-time Feedback**: Loading states and messages
- **Responsive Design**: Mobile-optimized with dark/light mode support
- **Accessibility**: Proper form controls and validation feedback

## 📈 System Architecture

```
/app
├── src/lib/alphaVantage.ts     # Alpha Vantage service + rate limiter
├── src/app/api/volatility/     # Volatility API endpoint with cache
├── src/app/api/convert/        # Currency conversion API endpoint
├── src/app/exposure-calculator/ # FX risk management interface
├── src/app/currency/           # Currency converter interface
└── .env.local                  # API key configuration
```

## 🌐 API Integrations

- **Alpha Vantage API**: Historical volatility data for VaR calculations
- **ExchangeRate API**: Real-time currency exchange rates
- **Smart Caching**: Optimized API usage with 24h data persistence
- **Fallback Systems**: Synthetic data when APIs unavailable

## 🎯 Business Value

### FX Risk Management
**Before (without the tool)**:
- ❌ Decisions based on intuition
- ❌ Cash flow surprises
- ❌ Inadequate risk management

**After (with FX Calculator)**:
- ✅ Decisions based on real data
- ✅ Quantified and controlled risk
- ✅ Professional hedge strategy
- ✅ Best practices compliance

### Currency Operations
- ✅ Real-time exchange rates for trading decisions
- ✅ Professional currency conversion with proper formatting
- ✅ Multi-currency support for international operations
- ✅ Mobile-accessible for on-the-go conversions

## 📚 Documentation

- 📋 **[Complete Index](./app/INDEX.md)** - Navigation through all documentation
- 🏢 **[Business Use Case](./app/BUSINESS_CASE_EXAMPLE.md)** - Detailed TechBrasil example
- 🔧 **[Technical Documentation](./app/TECHNICAL_DOCUMENTATION.md)** - Architecture and implementation
- ⚙️ **[Alpha Vantage Setup](./app/ALPHA_VANTAGE_SETUP.md)** - API configuration

---

*Professional foreign exchange risk management and currency conversion tool developed with modern web technologies and financial best practices.*

