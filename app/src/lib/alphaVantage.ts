// Rate limiter for Alpha Vantage API (5 calls per minute)
export class AlphaVantageRateLimiter {
  private static callTimestamps: number[] = [];
  
  static canMakeCall(): { allowed: boolean; waitTime?: number; nextAvailable?: Date } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove timestamps older than 1 minute
    this.callTimestamps = this.callTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
    
    if (this.callTimestamps.length < 5) {
      this.callTimestamps.push(now);
      return { allowed: true };
    }
    
    const oldestCall = this.callTimestamps[0];
    const waitTime = Math.ceil((60000 - (now - oldestCall)) / 1000);
    const nextAvailable = new Date(oldestCall + 60000);
    
    return { 
      allowed: false, 
      waitTime,
      nextAvailable 
    };
  }
  
  static getRemainingCalls(): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentCalls = this.callTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
    return Math.max(0, 5 - recentCalls.length);
  }
}

interface AlphaVantageHistoricalData {
  [date: string]: {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
  };
}

interface AlphaVantageResponse {
  'Meta Data': {
    '1. Information': string;
    '2. From Symbol': string;
    '3. To Symbol': string;
    '4. Output Size': string;
    '5. Last Refreshed': string;
  };
  'Time Series FX (Daily)': AlphaVantageHistoricalData;
  'Error Message'?: string;
  'Note'?: string;
}

export interface VolatilityAnalysis {
  volatility: number;
  trend: {
    direction: 'up' | 'down' | 'sideways';
    percentage: number;
    description: string;
  };
  priceRange: {
    min: number;
    max: number;
    current: number;
  };
  riskScore: {
    level: 'low' | 'medium' | 'high';
    score: number;
    description: string;
  };
  dataPoints: number;
  period: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'alpha_vantage' | 'fallback';
  lastUpdated: string;
}

// Daily cache for volatility calculations - recalculates once per day
interface DailyVolatilityCache {
  [pair: string]: {
    data: VolatilityData;
    calculatedDate: string; // YYYY-MM-DD format
    timestamp: number;
  };
}

interface VolatilityData {
  from: string;
  to: string;
  pair: string;
  volatility: number;
  source: string;
  period: string;
  confidence: string;
  trend?: {
    direction: 'up' | 'down' | 'sideways';
    percentage: number;
    description: string;
  };
  priceRange?: {
    min: number;
    max: number;
    current: number;
  };
  riskScore?: {
    level: 'low' | 'medium' | 'high';
    score: number;
    description: string;
  };
  dataPoints?: number;
  lastUpdated?: string;
  calculationMethod?: string;
  cached?: boolean;
  cacheType?: string;
  freshCalculation?: boolean;
  remainingCalls?: number;
  rateLimitInfo?: {
    waitTime: number;
    nextAvailable: Date;
    remainingCalls: number;
  };
  error?: string;
}

class VolatilityDailyCache {
  private static cache: DailyVolatilityCache = {};
  private static readonly CACHE_KEY = 'fx_volatility_daily_cache';
  
  static {
    // Load cache from localStorage on initialization
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.CACHE_KEY);
        if (stored) {
          this.cache = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Failed to load volatility cache:', error);
      }
    }
  }
  
  static getTodayString(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }
  
  static isToday(dateString: string): boolean {
    return dateString === this.getTodayString();
  }
  
  static get(pair: string): VolatilityData | null {
    const cached = this.cache[pair];
    if (!cached) return null;
    
    // Check if cache is from today
    if (this.isToday(cached.calculatedDate)) {
      return cached.data;
    }
    
    // Cache expired - remove it
    delete this.cache[pair];
    this.saveToStorage();
    return null;
  }
  
  static set(pair: string, data: VolatilityData): void {
    this.cache[pair] = {
      data,
      calculatedDate: this.getTodayString(),
      timestamp: Date.now()
    };
    this.saveToStorage();
  }
  
  private static saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
      } catch (error) {
        console.warn('Failed to save volatility cache:', error);
      }
    }
  }
  
  static clearOldEntries(): void {
    let hasChanges = false;
    
    for (const pair in this.cache) {
      if (!this.isToday(this.cache[pair].calculatedDate)) {
        delete this.cache[pair];
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      this.saveToStorage();
    }
  }
}

export class AlphaVantageService {
  private static readonly API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
  private static readonly BASE_URL = 'https://www.alphavantage.co/query';
  
  static async getHistoricalData(fromSymbol: string, toSymbol: string): Promise<AlphaVantageResponse> {
    const url = `${this.BASE_URL}?function=FX_DAILY&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&apikey=${this.API_KEY}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TradeTools/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for API errors
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage API error: ${data['Error Message']}`);
    }
    
    if (data['Note']) {
      throw new Error('API_RATE_LIMIT_EXCEEDED');
    }
    
    return data;
  }
  
  static calculateVolatilityFromHistoricalData(data: AlphaVantageHistoricalData): VolatilityAnalysis {
    const timeSeriesData = Object.entries(data)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-30); // Last 30 days
    
    console.log(`📊 Calculating volatility from ${timeSeriesData.length} data points`);
    
    if (timeSeriesData.length < 5) {
      throw new Error('Insufficient historical data');
    }
    
    // Calculate daily returns
    const prices = timeSeriesData.map(([, values]) => parseFloat(values['4. close']));
    console.log(`💰 Price range: ${Math.min(...prices).toFixed(4)} - ${Math.max(...prices).toFixed(4)}`);
    
    const returns = [];
    
    for (let i = 1; i < prices.length; i++) {
      const dailyReturn = (prices[i] - prices[i - 1]) / prices[i - 1];
      returns.push(dailyReturn);
    }
    
    // Calculate volatility (standard deviation of returns, annualized)
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / (returns.length - 1);
    const dailyVolatility = Math.sqrt(variance);
    const annualizedVolatility = dailyVolatility * Math.sqrt(252) * 100; // 252 trading days per year
    
    console.log(`📈 Calculated real volatility: ${annualizedVolatility.toFixed(2)}% (daily: ${(dailyVolatility * 100).toFixed(4)}%)`);
    console.log(`📊 Mean return: ${(meanReturn * 100).toFixed(4)}%, Variance: ${(variance * 10000).toFixed(6)}`);
    
    // Calculate trend
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const trendPercentage = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    let trendDirection: 'up' | 'down' | 'sideways' = 'sideways';
    if (Math.abs(trendPercentage) > 1) {
      trendDirection = trendPercentage > 0 ? 'up' : 'down';
    }
    
    // Calculate price range
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Calculate risk score
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let riskDescription = '';
    
    if (annualizedVolatility > 20) {
      riskLevel = 'high';
      riskDescription = 'High volatility - significant price swings expected';
    } else if (annualizedVolatility > 10) {
      riskLevel = 'medium';
      riskDescription = 'Moderate volatility - some price fluctuation expected';
    } else {
      riskDescription = 'Low volatility - relatively stable price movements';
    }
    
    return {
      volatility: Math.round(annualizedVolatility * 10) / 10,
      trend: {
        direction: trendDirection,
        percentage: Math.round(trendPercentage * 100) / 100,
        description: `${trendDirection === 'up' ? 'Strengthening' : trendDirection === 'down' ? 'Weakening' : 'Stable'} ${Math.abs(trendPercentage).toFixed(1)}% over 30 days`
      },
      priceRange: {
        min: Math.round(minPrice * 10000) / 10000,
        max: Math.round(maxPrice * 10000) / 10000,
        current: Math.round(lastPrice * 10000) / 10000
      },
      riskScore: {
        level: riskLevel,
        score: Math.round(annualizedVolatility * 10) / 10,
        description: riskDescription
      },
      dataPoints: timeSeriesData.length,
      period: '30_days',
      confidence: timeSeriesData.length >= 20 ? 'high' : 'medium',
      source: 'alpha_vantage',
      lastUpdated: new Date().toISOString()
    };
  }

  // Get volatility with daily caching - calculates only once per day
  static async getVolatilityWithDailyCache(fromCurrency: string, toCurrency: string): Promise<VolatilityData> {
    const pair = `${fromCurrency}${toCurrency}`;
    
    // Clear old cache entries first
    VolatilityDailyCache.clearOldEntries();
    
    // Check daily cache first
    const cachedVolatility = VolatilityDailyCache.get(pair);
    if (cachedVolatility) {
      console.log(`📅 Using daily cached volatility for ${pair}`);
      return {
        ...cachedVolatility,
        cached: true,
        cacheType: 'daily',
        source: 'daily_cache'
      };
    }
    
    console.log(`🔄 Calculating fresh daily volatility for ${pair}`);
    
    // Check rate limiting
    const rateLimitCheck = AlphaVantageRateLimiter.canMakeCall();
    if (!rateLimitCheck.allowed) {
      console.log(`⏳ Rate limit hit, using fallback for ${pair}`);
      const fallbackData = this.getFallbackVolatility(fromCurrency, toCurrency);
      return {
        ...fallbackData,
        rateLimitInfo: {
          waitTime: rateLimitCheck.waitTime!,
          nextAvailable: rateLimitCheck.nextAvailable!,
          remainingCalls: 0
        }
      };
    }
    
    try {
      // Fetch real historical data and calculate volatility
      const volatilityData = await this.calculateRealVolatility(fromCurrency, toCurrency);
      
      // Cache the result for the entire day
      VolatilityDailyCache.set(pair, volatilityData);
      
      return {
        ...volatilityData,
        remainingCalls: AlphaVantageRateLimiter.getRemainingCalls(),
        cached: false,
        cacheType: 'daily',
        freshCalculation: true
      };
    } catch (error) {
      console.error(`❌ Error calculating volatility for ${pair}:`, error);
      
      // Return fallback data
      const fallbackData = this.getFallbackVolatility(fromCurrency, toCurrency);
      return {
        ...fallbackData,
        error: 'API error - using fallback data',
        remainingCalls: AlphaVantageRateLimiter.getRemainingCalls()
      };
    }
  }

  // Calculate volatility from real historical data
  static async calculateRealVolatility(fromCurrency: string, toCurrency: string): Promise<VolatilityData> {
    // Fetch historical FX data
    const historicalData = await this.getHistoricalData(fromCurrency, toCurrency);
    
    if (!historicalData['Time Series FX (Daily)']) {
      throw new Error('No historical data available');
    }
    
    // Calculate volatility using real historical prices
    const volatilityAnalysis = this.calculateVolatilityFromHistoricalData(
      historicalData['Time Series FX (Daily)']
    );
    
    return {
      from: fromCurrency,
      to: toCurrency,
      pair: `${fromCurrency}/${toCurrency}`,
      volatility: volatilityAnalysis.volatility,
      source: 'alpha_vantage_historical',
      period: '30_days_real_data',
      confidence: volatilityAnalysis.confidence,
      trend: volatilityAnalysis.trend,
      priceRange: volatilityAnalysis.priceRange,
      riskScore: volatilityAnalysis.riskScore,
      dataPoints: volatilityAnalysis.dataPoints,
      lastUpdated: volatilityAnalysis.lastUpdated,
      calculationMethod: 'historical_standard_deviation'
    };
  }

  // Fallback volatility data for when API fails
  static getFallbackVolatility(fromCurrency: string, toCurrency: string): VolatilityData {
    // Enhanced fallback data with more realistic volatilities by currency pair
    const fallbackVolatilities: { [key: string]: number } = {
      // Major pairs (lower volatility)
      'EURUSD': 7.2, 'USDEUR': 7.2,
      'GBPUSD': 9.1, 'USDGBP': 9.1,
      'USDJPY': 8.4, 'JPYUSD': 8.4,
      'USDCHF': 7.8, 'CHFUSD': 7.8,
      'AUDUSD': 11.3, 'USDAUD': 11.3,
      'USDCAD': 8.9, 'CADUSD': 8.9,
      
      // Cross pairs (moderate volatility)
      'EURGBP': 6.8, 'GBPEUR': 6.8,
      'EURJPY': 9.2, 'JPYEUR': 9.2,
      'GBPJPY': 12.1, 'JPYGBP': 12.1,
      
      // Emerging market pairs (higher volatility)
      'USDBRL': 18.7, 'BRLUSD': 18.7,
      'USDCNY': 4.2, 'CNYUSD': 4.2,
      'EURCNY': 8.1, 'CNYEUR': 8.1,
      'GBPCNY': 9.8, 'CNYGBP': 9.8,
      'CNYBRL': 18.4, 'BRLCNY': 18.4, // CNY/BRL - Alta volatilidade (mercados emergentes)
      
      // Nordic pairs
      'USDSEK': 12.3, 'SEKUSD': 12.3,
      'USDNOK': 13.1, 'NOKUSD': 13.1,
      'USDDKK': 7.9, 'DKKUSD': 7.9,
    };
    
    const pairKey = `${fromCurrency}${toCurrency}`;
    const fallbackVolatility = fallbackVolatilities[pairKey] || 12.0;
    
    return {
      from: fromCurrency,
      to: toCurrency,
      pair: `${fromCurrency}/${toCurrency}`,
      volatility: fallbackVolatility,
      source: 'fallback_enhanced',
      period: '30_days_estimated',
      confidence: 'low',
      trend: {
        direction: 'sideways' as const,
        percentage: 0,
        description: 'No trend data available (fallback mode)'
      },
      riskScore: {
        level: fallbackVolatility > 15 ? 'high' : fallbackVolatility > 10 ? 'medium' : 'low' as const,
        score: fallbackVolatility,
        description: `Estimated risk based on ${fallbackVolatility}% volatility`
      },
      dataPoints: 0,
      lastUpdated: new Date().toISOString(),
      calculationMethod: 'fallback_estimate'
    };
  }
}
