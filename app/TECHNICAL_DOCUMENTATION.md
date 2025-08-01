# Technical Documentation - FX Exposure Calculator

## 🏗️ System Architecture

### Main Components

#### 1. Alpha Vantage Service (`src/lib/alphaVantage.ts`)
```typescript
class AlphaVantageRateLimiter {
  private callTimes: number[] = [];
  private readonly maxCallsPerMinute = 5;
  
  async waitIfNeeded(): Promise<void> {
    // Implements automatic rate limiting control
  }
}
```

**Features**:
- ✅ Automatic rate limiting (5 calls/minute)
- ✅ Daily cache with localStorage
- ✅ Fallback to synthetic data
- ✅ Volatility calculation based on real data

#### 2. API Endpoint (`src/app/api/volatility/route.ts`)
```typescript
export async function GET(request: NextRequest) {
  const volatilityData = await getVolatilityWithDailyCache(pair);
  return NextResponse.json(volatilityData);
}
```

**Characteristics**:
- RESTful endpoint for volatility data
- Daily cache integration
- Robust error handling
- Standardized JSON response

#### 3. Main Interface (`src/app/exposure-calculator/page.tsx`)
```typescript
const handlePreCalculateVolatility = async () => {
  setIsLoadingVolatility(true);
  // Loads volatility on demand
};
```

**UI Features**:
- Manual data loading control
- Visual status indicators
- Detailed calculations exposed
- Real-time feedback

## 📊 Financial Algorithms

### Volatility Calculation
```typescript
function calculateVolatility(prices: number[]): number {
  // 1. Calculate daily logarithmic returns
  const returns = prices.slice(1).map((price, i) => 
    Math.log(price / prices[i])
  );
  
  // 2. Calculate variance of returns
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => 
    sum + Math.pow(r - mean, 2), 0
  ) / (returns.length - 1);
  
  // 3. Annualize volatility (252 trading days)
  const dailyVolatility = Math.sqrt(variance);
  const annualizedVolatility = dailyVolatility * Math.sqrt(252);
  
  return annualizedVolatility * 100; // As percentage
}
```

### VaR (Value at Risk) Calculation
```typescript
function calculateVaR(
  exposure: number,
  volatility: number,
  days: number,
  confidenceLevel: number = 0.95
): number {
  // Z-score for 95% confidence
  const zScore = 1.645;
  
  // VaR formula
  const var = exposure * 
              (volatility / 100) * 
              Math.sqrt(days / 252) * 
              zScore;
  
  return var;
}
```

## 🔧 Cache System

### Daily Cache (localStorage)
```typescript
interface DailyVolatilityCache {
  [currencyPair: string]: {
    volatility: number;
    timestamp: number;
    isRealData: boolean;
  };
}
```

**Cache Strategy**:
- **Duration**: 24 hours per entry
- **Key**: Currency pair (e.g., "USD/BRL")
- **Cleanup**: Automatic on next query
- **Advantage**: Reduces API calls from 30+ to 1 per day

### Rate Limiting
```typescript
class AlphaVantageRateLimiter {
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    
    // Remove old calls (>1 minute)
    this.callTimes = this.callTimes.filter(time => 
      now - time < 60000
    );
    
    // If limit reached, wait
    if (this.callTimes.length >= this.maxCallsPerMinute) {
      const oldestCall = Math.min(...this.callTimes);
      const waitTime = 60000 - (now - oldestCall);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.callTimes.push(now);
  }
}
```

## 🌐 Alpha Vantage API Integration

### Used Endpoints

#### 1. FX Daily Data
```
GET https://www.alphavantage.co/query?
function=FX_DAILY&
from_symbol=USD&
to_symbol=BRL&
apikey=YOUR_API_KEY
```

#### 2. Response Structure
```json
{
  "Meta Data": {
    "1. Information": "Forex Daily Prices",
    "2. From Symbol": "USD",
    "3. To Symbol": "BRL"
  },
  "Time Series (FX)": {
    "2024-12-15": {
      "1. open": "6.0500",
      "2. high": "6.0800",
      "3. low": "6.0200",
      "4. close": "6.0600"
    }
  }
}
```

### Data Processing
```typescript
function parseAlphaVantageData(data: any): number[] {
  const timeSeries = data['Time Series (FX)'];
  const prices: number[] = [];
  
  Object.keys(timeSeries)
    .sort()
    .slice(-30) // Last 30 days
    .forEach(date => {
      const closePrice = parseFloat(timeSeries[date]['4. close']);
      prices.push(closePrice);
    });
  
  return prices;
}
```

## 🔍 Monitoring and Debug

### System Logs
```typescript
console.log('📊 Volatility Calculation:', {
  currencyPair: pair,
  dataPoints: prices.length,
  volatility: `${volatility.toFixed(2)}%`,
  isRealData: true,
  cacheStatus: 'fresh'
});
```

### Interface Indicators
- 🔴 **Real Historical Data**: Real API data
- 📅 **Daily Cache**: Active cache (today's data)
- ⚡ **Fresh calculation**: Newly calculated data
- 🔄 **Loading**: Loading API data

### API Calls Counter
```typescript
const [apiCallCount, setApiCallCount] = useState(0);

// Increments on each real API call
const incrementApiCallCount = () => {
  const newCount = apiCallCount + 1;
  setApiCallCount(newCount);
  localStorage.setItem('apiCallCount', newCount.toString());
};
```

## 🚀 Build and Deploy

### Next.js Configuration
```javascript
// next.config.js
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: false
  }
};
```

### Build Scripts
```bash
# Local build (development)
npm run build

# Production build (recommended)
NODE_ENV=production npm run build

# Deploy to Vercel
vercel --prod
```

### Environment Variables Configuration

#### Development (`.env.local`)
```bash
# .env.local - NEVER commit to Git
ALPHA_VANTAGE_API_KEY=5M4DMAZCO9I74257
```

#### Production (Vercel Dashboard)
1. Access: https://vercel.com/dashboard
2. Select the project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `ALPHA_VANTAGE_API_KEY`
   - **Value**: `your_api_key_here`
   - **Environment**: Production, Preview, Development

#### Post-deploy Verification
```bash
# Test if the variable was configured correctly
curl https://your-project.vercel.app/api/test-env | jq '{hasKey: .hasApiKey, status: .apiKeyStatus, platform: .deploymentInfo.platform}'

# Expected result:
# {
#   "hasKey": true,
#   "status": "working",  
#   "platform": "Vercel"
# }
```

### Deploy Checklist
- [ ] API key configured in Vercel
- [ ] `.env.local` in `.gitignore`
- [ ] Build without errors: `NODE_ENV=production npm run build`
- [ ] API key test: `curl .../api/test-env`
- [ ] Functionality test: Calculate VaR for CNY/BRL
- [ ] Verify daily cache working
- [ ] Confirm rate limiting active

## 📈 Performance and Optimizations

### Performance Metrics
- **First load**: ~2-3 seconds (with real data)
- **Subsequent loads**: ~0.1 seconds (cache)
- **API calls per day**: 1 per currency pair
- **Local storage**: ~1KB per currency pair

### Implemented Optimizations
1. **Daily Cache**: Reduces 96% of API calls
2. **Rate Limiting**: Prevents API blocks
3. **Lazy Loading**: Data loaded on demand
4. **Fallback**: System never becomes unavailable
5. **localStorage**: Persists data between sessions

## 🔒 Error Handling

### Covered Scenarios
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  // Process data...
} catch (error) {
  console.warn('API unavailable, using fallback data');
  return generateFallbackVolatility(pair);
}
```

**Error Types**:
- API Rate Limit exceeded
- Network connectivity issues
- Invalid API response format
- Missing or invalid API key

### Recovery Strategies
1. **Fallback Data**: Synthetic data based on similar pairs
2. **Retry Logic**: Automatic attempts with backoff
3. **User Feedback**: Clear messages about status
4. **Graceful Degradation**: System works even offline

## 🎯 Test Cases

### Manual Test Scenarios
1. **Functional API**: Real data loaded correctly
2. **API Unavailable**: Fallback triggered automatically
3. **Rate Limit**: System waits automatically
4. **Expired Cache**: Data updated on next access
5. **Multiple Pairs**: Independent cache per currency

### API Key Test (`/api/test-env`)
```bash
# Local test
curl http://localhost:3001/api/test-env | jq '.apiKeyStatus'

# Production test
curl https://your-project.vercel.app/api/test-env | jq '.apiKeyStatus'

# Expected results:
# "working" - API key working
# "invalid" - Invalid API key
# "rate_limited" - Call limit reached
# "not_configured" - API key not configured
```

### Calculation Validation
```typescript
// VaR test for CNY/BRL (based on real case)
const testVaR = calculateVaR(
  1554000,  // R$ 1.554M exposure
  11.5,     // 11.5% real volatility
  60,       // 60 days
  0.95      // 95% confidence
);
// Expected result: R$ 143,447

// Annualized volatility test
const testVolatility = calculateAnnualizedVolatility([
  0.7750, 0.7760, 0.7755, 0.7770, 0.7765, // example prices
  0.7780, 0.7775, 0.7785, 0.7790, 0.7795
]);
// Expected result: ~8-15% (data dependent)
```

## 🔑 API Key Testing and Validation

### Diagnostic Endpoint (`/api/test-env`)

The system includes a specialized endpoint for testing and diagnosing Alpha Vantage API key status in both development and production environments.

#### Endpoint Implementation
```typescript
// src/app/api/test-env/route.ts
export async function GET() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Test the API key by making a real call
  const testResponse = await fetch(
    `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=${apiKey}`
  );
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyPreview: isDevelopment ? `${apiKey.substring(0, 4)}...` : 'Hidden',
    apiKeyStatus: 'working' | 'invalid' | 'rate_limited' | 'network_error',
    environment: process.env.NODE_ENV,
    deploymentInfo: {
      platform: process.env.VERCEL ? 'Vercel' : 'Local',
      region: process.env.VERCEL_REGION || 'localhost'
    }
  });
}
```

### Test Commands

#### 1. Local Test (Development)
```bash
# Method 1: curl
curl http://localhost:3001/api/test-env | jq

# Method 2: wget
wget -qO- http://localhost:3001/api/test-env | jq

# Method 3: httpie (if installed)
http GET localhost:3001/api/test-env
```

#### 2. Production Test
```bash
# Replace with your Vercel URL
curl https://your-project.vercel.app/api/test-env | jq

# Example with real domain
curl https://fx-calculator-omega.vercel.app/api/test-env | jq
```

### Result Interpretation

#### ✅ **API Key Working Correctly**
```json
{
  "hasApiKey": true,
  "keyLength": 16,
  "keyPreview": "5M4D...4257",  // Only in development
  "environment": "development",
  "timestamp": "2025-08-01T01:07:10.123Z",
  "apiKeyStatus": "working",
  "apiTestResult": "API key is functional",
  "deploymentInfo": {
    "platform": "Local",
    "region": "localhost"
  }
}
```

#### ❌ **Invalid API Key**
```json
{
  "hasApiKey": true,
  "keyLength": 16,
  "keyPreview": "Hidden in production",
  "environment": "production",
  "apiKeyStatus": "invalid",
  "apiTestResult": "Invalid API call. Please retry or visit the documentation...",
  "deploymentInfo": {
    "platform": "Vercel",
    "region": "iad1"
  }
}
```

#### ⚠️ **Rate Limit Reached**
```json
{
  "hasApiKey": true,
  "keyLength": 16,
  "keyPreview": "Hidden in production",
  "apiKeyStatus": "rate_limited",
  "apiTestResult": "Rate limit reached",
  "deploymentInfo": {
    "platform": "Vercel",
    "region": "iad1"
  }
}
```

#### 🚫 **API Key Not Configured**
```json
{
  "hasApiKey": false,
  "keyLength": 0,
  "keyPreview": "Hidden in production",
  "apiKeyStatus": "not_configured",
  "apiTestResult": null,
  "deploymentInfo": {
    "platform": "Vercel",
    "region": "iad1"
  }
}
```

### Automated Test Script

#### Complete Test (Local + Production)
The project includes an automated bash script to test the API key:

```bash
# Run the test script
./test-api-key.sh

# Or specify custom production URL
./test-api-key.sh https://my-project.vercel.app
```

**Example output:**
```
🔍 Testing Alpha Vantage API Key...
==================================

📍 Testing Local (Development):
URL: http://localhost:3001/api/test-env
   Status: working
   Has Key: true
   Platform: Local
   Environment: development
   Test Result: API key is functional
   ✅ API Key working perfectly!

📍 Testing Production:
URL: https://fx-calculator.vercel.app/api/test-env
   Status: working
   Has Key: true
   Platform: Vercel
   Environment: production
   Test Result: API key is functional
   ✅ API Key working perfectly!

📊 Test Summary:
==================
🎉 Success! API Key working in both environments
   ✅ Local: OK
   ✅ Production: OK
```

#### Individual Manual Test
```bash
# Local test
curl http://localhost:3001/api/test-env | jq

# Production test
curl https://your-project.vercel.app/api/test-env | jq
```

### Continuous Monitoring

#### Healthcheck Endpoint
```bash
# Add to your monitoring/CI
curl -f https://your-project.vercel.app/api/test-env || exit 1
```

#### Notification Webhook
```bash
# Example with Slack/Discord webhook
API_STATUS=$(curl -s https://your-project.vercel.app/api/test-env | jq -r '.apiKeyStatus')

if [ "$API_STATUS" != "working" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 FX Calculator API Key failed: '$API_STATUS'"}' \
        YOUR_SLACK_WEBHOOK_URL
fi
```

### Troubleshooting

#### Problem: "API Key not configured"
```bash
# 1. Check local file
cat .env.local | grep ALPHA_VANTAGE_API_KEY

# 2. Check in Vercel (via CLI)
vercel env ls

# 3. Add variable in Vercel
vercel env add ALPHA_VANTAGE_API_KEY
```

#### Problem: "Rate limit reached"
```bash
# Wait 1 minute and test again
sleep 60 && curl http://localhost:3001/api/test-env | jq '.apiKeyStatus'
```

#### Problem: "Network error"
```bash
# Test direct connectivity with Alpha Vantage
curl "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=demo"
```

### CI/CD Integration

#### GitHub Actions
```yaml
# .github/workflows/test-api.yml
name: Test API Key
on: [push, pull_request]

jobs:
  test-api:
    runs-on: ubuntu-latest
    steps:
      - name: Test API Key
        run: |
          RESPONSE=$(curl -s ${{ secrets.VERCEL_URL }}/api/test-env)
          STATUS=$(echo $RESPONSE | jq -r '.apiKeyStatus')
          if [ "$STATUS" != "working" ]; then
            echo "❌ API Key test failed: $STATUS"
            exit 1
          fi
          echo "✅ API Key is working"
```

### Endpoint Security

#### Security Features
- **Development**: Shows API key preview (first 4 + last 4 characters)
- **Production**: Never exposes the complete API key
- **Logs**: Does not record API keys in logs
- **Rate Limiting**: Respects Alpha Vantage limits
- **Error Handling**: Handles all possible error scenarios

#### Security Recommendations
1. **Remove in production**: Consider removing the endpoint after initial tests
2. **Authentication**: Add authentication if keeping in production
3. **IP Whitelist**: Restrict access by IP if necessary
4. **Audit Logs**: Record who accesses the endpoint
