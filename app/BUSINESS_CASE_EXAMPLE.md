# Business Use Case: TechBrasil Importer

## Real Foreign Exchange Exposure Scenario

### 📊 Company Situation

**TechBrasil Importadora Ltda.**
- **Sector**: Electronic equipment import
- **Location**: São Paulo, Brazil
- **Operation**: Electronic components import from China
- **Exposure currency**: Chinese Yuan (CNY)

### 💰 Commercial Operation

**Transaction Details:**
- **Import value**: ¥ 2,000,000 (Chinese Yuan)
- **Analysis date**: August 2025
- **Current exchange rate**: CNY/BRL = 0.7770
- **Value in Reais**: R$ 1,554,000
- **Payment term**: 60 days

### 📈 Foreign Exchange Risk Analysis

#### Market Data (Alpha Vantage API - Real Data)
- **Historical volatility**: 11.5% per year
- **Analysis period**: 30 days of real historical data
- **Source**: 🔴 Real Historical Data (Alpha Vantage API)
- **Confidence**: High confidence • Real Data
- **Calculation**: Annualized standard deviation (252 trading days)
- **Trend**: ↗️ +1.3% (Yuan strengthening against Real)
- **Data points**: 30 real data points
- **Last update**: 01/08/2025, 01:07:10

#### VaR (Value at Risk) Calculation
```
Formula: VaR = Exposure × Volatility × √(Days/252) × Z-score

Where:
- Exposure: R$ 1,554,000
- Volatility: 11.5% per year
- Days: 60 days (payment term)
- Z-score: 1.645 (95% confidence level)
- Trading days per year: 252

Detailed calculation:
1. Exposure: CN¥ 2,000,000 × 0.7770 = R$ 1,554,000
2. Time factor: √(60/252) = 0.488
3. Adjusted volatility: 11.5% × 0.488 = 5.61%
4. Final VaR: R$ 1,554,000 × 0.0561 × 1.645 = R$ 143,447
```

### 🎯 Results Interpretation

#### What does the VaR of R$ 143,447 mean?
- **Definition**: With 95% confidence, the maximum loss in 60 days will not exceed R$ 143,447
- **Percentage of exposure**: 9.2% of the total operation value
- **Daily equivalent risk**: Approximately R$ 2,391 per trading day

#### Risk Scenarios
1. **Favorable Scenario (5%)**: Yuan appreciates → Import savings (potential gain of +R$ 143,447)
2. **Normal Scenario (90%)**: Variation within expected (±R$ 143k)
3. **Adverse Scenario (5%)**: Yuan depreciates → Maximum loss of R$ 143,447

### 💡 Hedge Decision

#### Cost-Benefit Analysis
- **Hedge cost**: ~0.5% per year = R$ 6,475 (60 days)
- **Risk eliminated**: R$ 143,447
- **Ratio**: Pay R$ 6,475 to eliminate risk of R$ 143,447

#### Recommendation
✅ **DO HEDGE** - The cost of R$ 6,475 is highly justified to eliminate a potential risk of R$ 143,447

### 📋 Available Hedge Instruments

1. **Currency Forward**
   - Locks exchange rate for 60 days
   - Cost: bank spread (~0.5%)
   - Eliminates 100% of foreign exchange risk

2. **Currency Swap**
   - Flexibility to take advantage of favorable scenarios
   - Cost: slightly higher than forward
   - Protection against adverse movements

3. **Currency Options**
   - Protection against losses while maintaining potential gains
   - Cost: option premium (~1-2%)
   - Greater flexibility, higher cost

### 📊 Continuous Monitoring

#### Tracking Indicators
- **Realized vs. implied volatility**
- **CNY/BRL correlation with other factors**
- **China-Brazil economic news**
- **Central bank monetary policies**

#### Periodic Review
- **Frequency**: Weekly
- **Review triggers**: Volatility change >20%
- **Adjustments**: Hedge resizing as necessary

### 🎯 Tool Added Value

#### For the Financial Manager
- **Objective quantification** of foreign exchange risk
- **Scientific basis** for hedge decisions
- **Clear communication** with board and investors
- **Compliance** with risk management practices

#### For the Company
- **Predictability** of import costs
- **Protection** against excessive volatility
- **Cost of capital optimization**
- **Competitiveness** in domestic market

### 📈 Next Steps

1. **Implement hedge** via 60-day forward
2. **Monitor daily** exchange rates
3. **Review weekly** hedge strategy
4. **Document** all decisions for audit
5. **Evaluate** hedge effectiveness at maturity

---

## 🔧 Tool Usage

### Inputs Used
```
Exposure Amount: 2000000
Currency Pair: CNY/BRL
Time Horizon: 60 days
Confidence Level: 95%
```

### Generated Outputs
```
Calculated VaR: R$ 143,446.55
Volatility (Real Data): 11.5% p.a.
Risk Percentage: 9.2%
Data Source: 🔴 Real Historical Data
Cache Status: 💾 Daily Cache (Fresh calculation)
API Calls: 4/5 remaining
Trend: ↗️ +1.3% (Yuan strengthening)
Risk Level: MEDIUM
Last Updated: 01/08/2025, 01:07:10
Data Points: 30 real market data points
```

### Features Used
- ✅ **Alpha Vantage Integration**: Real market data
- ✅ **Volatility Calculation**: 30 days of history
- ✅ **Smart Cache**: API call optimization
- ✅ **Rate Limiting**: Automatic request control
- ✅ **Transparency**: Complete calculation breakdown

---

*This example demonstrates how the foreign exchange exposure calculator can be used in a real import scenario, providing valuable insights for financial risk management decisions.*
