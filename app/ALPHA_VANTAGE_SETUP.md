# Alpha Vantage API Integration

## API Key Configuration

This project uses the **Alpha Vantage API** to obtain real-time foreign exchange volatility data.

### 1. Free API Limits

- **5 calls per minute**
- **500 calls per day**
- Historical data: up to 20+ years
- Support for 150+ currencies

### 2. Implemented Features

#### ✅ Smart Rate Limiting
- Automatic control of 5 calls/minute
- Fallback to static data when limit exceeded
- 5-minute cache to reduce calls

#### ✅ Real Volatility Analysis
- Calculation based on 30 days of historical data
- Annualized volatility (industry standard)
- Automatic trend analysis

#### ✅ Advanced Metrics
- **Volatility**: Annualized standard deviation of returns
- **Trend**: Direction and percentage change (30 days)
- **Price Range**: Minimum, maximum and current
- **Risk Score**: Automatic classification (Low/Medium/High)

#### ✅ Error Handling
- Smart fallback to historical data
- Visual indicators of data source
- Informative messages about rate limits

### 3. API Response Example

```json
{
  "from": "EUR",
  "to": "USD",
  "pair": "EUR/USD",
  "volatility": 12.3,
  "source": "alpha_vantage",
  "period": "30_days",
  "confidence": "high",
  "trend": {
    "direction": "up",
    "percentage": 2.1,
    "description": "Strengthening 2.1% over 30 days"
  },
  "priceRange": {
    "min": 1.0850,
    "max": 1.1120,
    "current": 1.0965
  },
  "riskScore": {
    "level": "medium",
    "score": 12.3,
    "description": "Moderate volatility - some price fluctuation expected"
  },
  "dataPoints": 30,
  "lastUpdated": "2025-08-01T10:30:00.000Z",
  "remainingCalls": 4
}
```
