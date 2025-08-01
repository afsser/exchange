# FX Exposure Calculator - Foreign Exchange Risk Management Tool

Professional foreign exchange risk analysis system with real-time volatility data for enterprise financial management.

## 🎯 Key Features

- **Real Market Data**: Integration with Alpha Vantage API
- **VaR Calculation**: Value at Risk based on historical volatility
- **Smart Caching**: Automatic API call optimization
- **Rate Limiting**: Request control (5 calls/minute)
- **Full Transparency**: Complete mathematical calculation breakdown

## 📊 Business Use Case

**Real Example**: TechBrasil Importer with ¥ 2,000,000 exposure
- **Calculated VaR**: R$ 89,250 (5.7% of exposure)
- **Decision**: R$ 7,850 hedge to eliminate R$ 89k risk
- **Result**: Professional foreign exchange risk management

👉 **See complete example at**: [BUSINESS_CASE_EXAMPLE.md](./BUSINESS_CASE_EXAMPLE.md)

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

👉 **Complete setup at**: [ALPHA_VANTAGE_SETUP.md](./ALPHA_VANTAGE_SETUP.md)

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

## 📈 System Architecture

```
/app
├── src/lib/alphaVantage.ts     # Serviço principal + rate limiter
├── src/app/api/volatility/     # API endpoint com cache
├── src/app/exposure-calculator/ # Main interface
└── .env.local                  # API key configuration
```

## 🎯 Business Value

**Before (without the tool)**:
- ❌ Decisions based on intuition
- ❌ Cash flow surprises
- ❌ Inadequate risk management

**After (with FX Calculator)**:
- ✅ Decisions based on real data
- ✅ Quantified and controlled risk
- ✅ Professional hedge strategy
- ✅ Best practices compliance

## 📚 Documentation

- 📋 **[Complete Index](./INDEX.md)** - Navigation through all documentation
- 🏢 **[Business Use Case](./BUSINESS_CASE_EXAMPLE.md)** - Detailed TechBrasil example
- 🔧 **[Technical Documentation](./TECHNICAL_DOCUMENTATION.md)** - Architecture and implementation
- ⚙️ **[Alpha Vantage Setup](./ALPHA_VANTAGE_SETUP.md)** - API configuration

---

*Developed to demonstrate expertise in financial risk management and market data API integration.*
