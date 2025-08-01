'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ExposureData {
  amount: number;
  baseCurrency: string;
  targetCurrency: string;
  currentRate: number;
  volatility: number;
  timeHorizon: number;
}

interface RiskMetrics {
  exposureValue: number;
  valueAtRisk: number;
  potentialGain: number;
  potentialLoss: number;
  riskLevel: 'Low' | 'Medium' | 'High';
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
  rateLimitInfo?: {
    waitTime: number;
    nextAvailable: Date;
    remainingCalls: number;
  };
  remainingCalls?: number;
  cached?: boolean;
  error?: string;
  calculationMethod?: string;
  cacheType?: string;
  freshCalculation?: boolean;
}

export default function ExposureCalculator() {
  const [exposureData, setExposureData] = useState<ExposureData>({
    amount: 100000,
    baseCurrency: 'EUR',
    targetCurrency: 'USD',
    currentRate: 1.0850,
    volatility: 12.5,
    timeHorizon: 30,
  });

  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [volatilityData, setVolatilityData] = useState<VolatilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingVolatility, setLoadingVolatility] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remove automatic volatility loading to preserve API calls
  // useEffect(() => {
  //   fetchVolatility(exposureData.baseCurrency, exposureData.targetCurrency);
  // }, []);

  const currencies = [
    { code: 'EUR', name: 'Euro' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'NOK', name: 'Norwegian Krone' },
    { code: 'DKK', name: 'Danish Krone' },
  ];

  const fetchVolatility = async (baseCurrency: string, targetCurrency: string) => {
    if (baseCurrency === targetCurrency) {
      setVolatilityData({
        from: baseCurrency,
        to: targetCurrency,
        pair: `${baseCurrency}/${targetCurrency}`,
        volatility: 0,
        source: 'same_currency',
        period: '30_days_annualized',
        confidence: 'high'
      });
      return;
    }
    
    setLoadingVolatility(true);
    try {
      const response = await fetch(`/api/volatility?from=${baseCurrency}&to=${targetCurrency}`);
      if (response.ok) {
        const data = await response.json();
        setVolatilityData(data);
        setExposureData(prev => ({ ...prev, volatility: data.volatility || 12.0 }));
      } else {
        // Fallback data in case of API error
        setVolatilityData({
          from: baseCurrency,
          to: targetCurrency,
          pair: `${baseCurrency}/${targetCurrency}`,
          volatility: 12.0,
          source: 'fallback',
          period: '30_days_annualized',
          confidence: 'low'
        });
        setExposureData(prev => ({ ...prev, volatility: 12.0 }));
      }
    } catch (error) {
      console.error('Error fetching volatility:', error);
      // Fallback data in case of network error
      setVolatilityData({
        from: baseCurrency,
        to: targetCurrency,
        pair: `${baseCurrency}/${targetCurrency}`,
        volatility: 12.0,
        source: 'fallback',
        period: '30_days_annualized',
        confidence: 'low'
      });
      setExposureData(prev => ({ ...prev, volatility: 12.0 }));
    }
    setLoadingVolatility(false);
  };

  const calculateExposure = async () => {
    setLoading(true);
    setError(null);
    
    // Validate inputs first
    if (!exposureData.amount || exposureData.amount <= 0) {
      setError('Please enter a valid exposure amount');
      setLoading(false);
      return;
    }
    
    if (!exposureData.timeHorizon || exposureData.timeHorizon <= 0) {
      setError('Please enter a valid time horizon');
      setLoading(false);
      return;
    }
    
    // Fetch volatility first if not already loaded
    if (!volatilityData || volatilityData.from !== exposureData.baseCurrency || volatilityData.to !== exposureData.targetCurrency) {
      await fetchVolatility(exposureData.baseCurrency, exposureData.targetCurrency);
    }
    
    // Handle same currency case
    if (exposureData.baseCurrency === exposureData.targetCurrency) {
      setRiskMetrics({
        exposureValue: exposureData.amount,
        valueAtRisk: 0,
        potentialGain: 0,
        potentialLoss: 0,
        riskLevel: 'Low'
      });
      setExposureData(prev => ({ ...prev, currentRate: 1.0000 }));
      setLoading(false);
      return;
    }
    
    // Fetch current exchange rate
    try {
      const response = await fetch(`/api/convert?from=${exposureData.baseCurrency}&to=${exposureData.targetCurrency}&amount=1`);
      if (response.ok) {
        const data = await response.json();
        const currentRate = data.rate; // Changed from data.result to data.rate
        
        // Validate that we have a valid rate
        if (!currentRate || currentRate <= 0 || !isFinite(currentRate)) {
          setError('Unable to fetch valid exchange rate. Please try again.');
          setLoading(false);
          return;
        }
        
        // Validate that we have valid volatility
        const volatilityToUse = exposureData.volatility || 12.0;
        if (!volatilityToUse || volatilityToUse <= 0 || !isFinite(volatilityToUse)) {
          setError('Invalid volatility data. Please try again.');
          setLoading(false);
          return;
        }
        
        // Calculate risk metrics
        const exposureValue = exposureData.amount * currentRate;
        
        // Value at Risk calculation (parametric method)
        // VaR = Position × Volatility_adjusted × Z-score (95% confidence = 1.645)
        // Convert annual volatility to time horizon using trading days (252 per year)
        const tradingDaysInPeriod = Math.min(exposureData.timeHorizon, 252); // Cap at 1 year
        const timeAdjustedVolatility = (volatilityToUse / 100) * Math.sqrt(tradingDaysInPeriod / 252);
        const valueAtRisk = exposureValue * timeAdjustedVolatility * 1.645;
        
        const potentialGain = exposureValue * timeAdjustedVolatility * 1.645;
        const potentialLoss = exposureValue * timeAdjustedVolatility * 1.645;
        
        // Risk level based on VaR as percentage of exposure
        const riskPercentage = (valueAtRisk / exposureValue) * 100;
        let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
        if (riskPercentage > 10) riskLevel = 'High';
        else if (riskPercentage > 5) riskLevel = 'Medium';
        
        // Validate final calculations
        if (!isFinite(exposureValue) || !isFinite(valueAtRisk) || !isFinite(potentialGain) || !isFinite(potentialLoss)) {
          setError('Calculation error. Please check your inputs and try again.');
          setLoading(false);
          return;
        }
        
        setRiskMetrics({
          exposureValue,
          valueAtRisk,
          potentialGain,
          potentialLoss,
          riskLevel
        });
        
        setExposureData(prev => ({ ...prev, currentRate }));
      } else {
        setError('Failed to fetch exchange rate. Please try again.');
      }
    } catch (error) {
      console.error('Error calculating exposure:', error);
      setError('Network error. Please check your connection and try again.');
    }
    
    setLoading(false);
  };

  const handleCurrencyChange = (field: 'baseCurrency' | 'targetCurrency', value: string) => {
    setExposureData(prev => ({ ...prev, [field]: value }));
    setRiskMetrics(null); // Clear previous results
    setError(null); // Clear previous errors
    
    // Clear volatility data when currencies change - user will need to manually fetch
    const newBaseCurrency = field === 'baseCurrency' ? value : exposureData.baseCurrency;
    const newTargetCurrency = field === 'targetCurrency' ? value : exposureData.targetCurrency;
    
    if (newBaseCurrency === newTargetCurrency) {
      // Same currency - no volatility needed
      setVolatilityData({
        from: newBaseCurrency,
        to: newTargetCurrency,
        pair: `${newBaseCurrency}/${newTargetCurrency}`,
        volatility: 0,
        source: 'same_currency',
        period: '30_days_annualized',
        confidence: 'high'
      });
    } else {
      // Different currencies - clear volatility data to require manual fetch
      setVolatilityData(null);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Image
              src="/favicon.ico"
              alt="Trade Tools"
              width={64}
              height={64}
              className="mx-auto mb-4"
            />
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            FX Exposure Calculator
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Calculate your foreign exchange exposure and assess currency risk for better hedging decisions.
            Understand your potential gains and losses in volatile FX markets.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-slate-600/50">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Exposure Parameters
            </h2>
            
            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Exposure Amount
              </label>
              <input
                type="number"
                value={exposureData.amount}
                onChange={(e) => setExposureData(prev => ({ 
                  ...prev, 
                  amount: parseFloat(e.target.value) || 0 
                }))}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-400"
                placeholder="Enter amount"
              />
            </div>

            {/* Currency Selectors */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Base Currency
                </label>
                <select
                  value={exposureData.baseCurrency}
                  onChange={(e) => handleCurrencyChange('baseCurrency', e.target.value)}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code} className="bg-slate-700">
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target Currency
                </label>
                <select
                  value={exposureData.targetCurrency}
                  onChange={(e) => handleCurrencyChange('targetCurrency', e.target.value)}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code} className="bg-slate-700">
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Volatility Display */}
            {volatilityData && volatilityData.volatility !== undefined && (
              <div className="mb-6 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-slate-400">Market Volatility (30-day)</div>
                    <div className="text-xl font-semibold text-white">
                      {volatilityData.volatility.toFixed(1)}% p.a.
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">
                      {volatilityData.source === 'alpha_vantage_historical' ? '🔴 Real Historical Data' : 
                       volatilityData.source === 'daily_cache' ? '📅 Daily Cache' : 
                       volatilityData.source === 'alpha_vantage' ? '🔴 Live Data' : 
                       volatilityData.source === 'historical_data' ? '📊 Historical' : 
                       volatilityData.cached ? '💾 Cached' : '📈 Estimated'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {volatilityData.confidence} confidence
                      {volatilityData.calculationMethod === 'historical_standard_deviation' && ' • Real Data'}
                    </div>
                    {volatilityData.remainingCalls !== undefined && (
                      <div className="text-xs text-blue-400">
                        API calls: {volatilityData.remainingCalls}/5
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Trend Information */}
                {volatilityData.trend && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Trend:</span>
                      <span className={`font-medium ${
                        volatilityData.trend.direction === 'up' ? 'text-green-400' :
                        volatilityData.trend.direction === 'down' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {volatilityData.trend.direction === 'up' ? '↗️' : 
                         volatilityData.trend.direction === 'down' ? '↘️' : '→'} 
                        {volatilityData.trend.percentage > 0 ? '+' : ''}{volatilityData.trend.percentage.toFixed(1)}%
                      </span>
                    </div>
                    
                    {/* Risk Level */}
                    {volatilityData.riskScore && (
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">Risk:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          volatilityData.riskScore.level === 'high' ? 'bg-red-500/20 text-red-300' :
                          volatilityData.riskScore.level === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {volatilityData.riskScore.level.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Rate Limit Warning */}
                {volatilityData.rateLimitInfo && (
                  <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-400/30 rounded text-xs text-yellow-300">
                    ⚠️ API limit reached. Next call available in {volatilityData.rateLimitInfo.waitTime}s
                  </div>
                )}
                
                {/* API Error */}
                {volatilityData.error && (
                  <div className="mt-2 p-2 bg-red-500/20 border border-red-400/30 rounded text-xs text-red-300">
                    ⚠️ {volatilityData.error} - Using fallback data
                  </div>
                )}
                
                {/* Data Source Info */}
                {volatilityData.lastUpdated && (
                  <div className="mt-2 text-xs text-slate-500">
                    Last updated: {new Date(volatilityData.lastUpdated).toLocaleString()}
                    {volatilityData.dataPoints && ` • ${volatilityData.dataPoints} data points`}
                    {volatilityData.calculationMethod === 'historical_standard_deviation' && ' • Real volatility calculation'}
                    {volatilityData.cacheType === 'daily' && volatilityData.cached && ' • Daily cache active'}
                    {volatilityData.freshCalculation && ' • Fresh calculation'}
                  </div>
                )}
                
                {/* Daily Cache Info */}
                {volatilityData.cacheType === 'daily' && (
                  <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-xs text-green-300">
                    💾 Daily Cache: This volatility calculation is cached for 24 hours to optimize API usage while maintaining accuracy.
                  </div>
                )}
              </div>
            )}

            {/* No Volatility Data Message */}
            {!volatilityData && exposureData.baseCurrency !== exposureData.targetCurrency && !loadingVolatility && (
              <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-400 text-lg">📊</div>
                  <div>
                    <div className="text-sm font-medium text-blue-300 mb-1">
                      Real Market Volatility Calculation Available
                    </div>
                    <div className="text-xs text-blue-200">
                      Click &quot;Pre-calculate Volatility&quot; to fetch historical price data for {exposureData.baseCurrency}/{exposureData.targetCurrency} and calculate <strong>real volatility</strong> based on 30 days of actual market movements.
                    </div>
                    <div className="text-xs text-blue-300 mt-1">
                      ✨ <strong>Professional Feature:</strong> Uses standard deviation of daily returns (annualized) instead of estimated values.
                    </div>
                    <div className="text-xs text-blue-300 mt-1">
                      💡 Without real data, calculations will use estimated values ({exposureData.baseCurrency === 'EUR' && exposureData.targetCurrency === 'USD' ? '7.2' : '12'}% annual volatility).
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loadingVolatility && (
              <div className="mb-6 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-slate-400">Loading market volatility...</span>
                </div>
              </div>
            )}

            {/* Risk Parameters */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Time Horizon (days)
              </label>
              <input
                type="number"
                value={exposureData.timeHorizon}
                onChange={(e) => setExposureData(prev => ({ 
                  ...prev, 
                  timeHorizon: parseInt(e.target.value) || 0 
                }))}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-400"
                placeholder="30"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-red-400">⚠️</span>
                  <span className="text-sm text-red-300">{error}</span>
                </div>
              </div>
            )}

            {/* Pre-calculate Volatility Button */}
            {!volatilityData && exposureData.baseCurrency !== exposureData.targetCurrency && (
              <button
                onClick={() => fetchVolatility(exposureData.baseCurrency, exposureData.targetCurrency)}
                disabled={loadingVolatility}
                className="w-full mb-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 shadow-lg"
              >
                {loadingVolatility ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Fetching Market Data...</span>
                  </div>
                ) : (
                  <>📊 Pre-calculate Volatility ({exposureData.baseCurrency}/{exposureData.targetCurrency})</>
                )}
              </button>
            )}

            {/* Calculate Button */}
            <button
              onClick={calculateExposure}
              disabled={loading || loadingVolatility}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Calculating...' : 
               loadingVolatility ? 'Loading Market Data...' :
               'Calculate Exposure & Risk'}
            </button>
          </div>

          {/* Results Panel */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-slate-600/50">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Risk Analysis
            </h2>
            
            {riskMetrics ? (
              <div className="space-y-6">
                {/* Calculation Details */}
                <div className="bg-slate-700/70 rounded-lg p-4 border border-slate-600">
                  <div className="text-sm text-slate-400 mb-2">Calculation Details</div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div>Exposure: {formatCurrency(exposureData.amount, exposureData.baseCurrency)} × {exposureData.currentRate.toFixed(4)} = {formatCurrency(riskMetrics.exposureValue, exposureData.targetCurrency)}</div>
                    <div>Annual Volatility: {exposureData.volatility.toFixed(1)}%</div>
                    <div>Time Horizon: {exposureData.timeHorizon} days (√{exposureData.timeHorizon}/252 = {Math.sqrt(exposureData.timeHorizon / 252).toFixed(3)})</div>
                    <div>Time-Adjusted Vol: {exposureData.volatility.toFixed(1)}% × {Math.sqrt(exposureData.timeHorizon / 252).toFixed(3)} = {((exposureData.volatility || 12) * Math.sqrt(exposureData.timeHorizon / 252)).toFixed(2)}%</div>
                    <div>VaR (95%): {formatCurrency(riskMetrics.exposureValue, exposureData.targetCurrency)} × {((exposureData.volatility || 12) * Math.sqrt(exposureData.timeHorizon / 252) / 100).toFixed(4)} × 1.645 = {formatCurrency(riskMetrics.valueAtRisk, exposureData.targetCurrency)}</div>
                  </div>
                </div>

                {/* Current Rate */}
                <div className="bg-slate-700/70 rounded-lg p-4 border border-slate-600">
                  <div className="text-sm text-slate-400">Current Exchange Rate</div>
                  <div className="text-2xl font-bold text-white">
                    1 {exposureData.baseCurrency} = {(exposureData.currentRate || 0).toFixed(4)} {exposureData.targetCurrency}
                  </div>
                </div>

                {/* Exposure Value */}
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                  <div className="text-sm text-blue-300">Total Exposure Value</div>
                  <div className="text-2xl font-bold text-blue-100">
                    {formatCurrency(riskMetrics.exposureValue, exposureData.targetCurrency)}
                  </div>
                </div>

                {/* Value at Risk */}
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                  <div className="text-sm text-red-300">Value at Risk (95% confidence)</div>
                  <div className="text-2xl font-bold text-red-100">
                    {formatCurrency(riskMetrics.valueAtRisk, exposureData.targetCurrency)}
                  </div>
                </div>

                {/* Risk Level */}
                <div className={`rounded-lg p-4 border ${
                  riskMetrics.riskLevel === 'Low' ? 'bg-green-500/20 border-green-400/30' :
                  riskMetrics.riskLevel === 'Medium' ? 'bg-yellow-500/20 border-yellow-400/30' : 'bg-red-500/20 border-red-400/30'
                }`}>
                  <div className="text-sm text-slate-400">Risk Level</div>
                  <div className={`text-2xl font-bold ${
                    riskMetrics.riskLevel === 'Low' ? 'text-green-300' :
                    riskMetrics.riskLevel === 'Medium' ? 'text-yellow-300' : 'text-red-300'
                  }`}>
                    {riskMetrics.riskLevel}
                  </div>
                </div>

                {/* Potential Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                    <div className="text-sm text-green-300">Potential Gain</div>
                    <div className="text-lg font-bold text-green-100">
                      +{formatCurrency(riskMetrics.potentialGain, exposureData.targetCurrency)}
                    </div>
                  </div>
                  
                  <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                    <div className="text-sm text-red-300">Potential Loss</div>
                    <div className="text-lg font-bold text-red-100">
                      -{formatCurrency(riskMetrics.potentialLoss, exposureData.targetCurrency)}
                    </div>
                  </div>
                </div>

                {/* Risk Explanation */}
                <div className="bg-indigo-500/20 border border-indigo-400/30 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-300 mb-2">Risk Assessment</h3>
                  <div className="text-sm text-indigo-200 space-y-2">
                    <p>
                      <strong>Methodology:</strong> Parametric VaR using {exposureData.volatility}% annual volatility 
                      over {exposureData.timeHorizon} trading days (95% confidence level).
                    </p>
                    <p>
                      <strong>Calculation:</strong> Time-adjusted volatility = {exposureData.volatility}% × √({exposureData.timeHorizon}/252) 
                      = {((exposureData.volatility || 12) * Math.sqrt(exposureData.timeHorizon / 252)).toFixed(2)}%
                    </p>
                    <p>
                      <strong>Interpretation:</strong> There is a 5% chance your exposure could lose more than{' '}
                      {formatCurrency(riskMetrics.valueAtRisk, exposureData.targetCurrency)} due to FX movements 
                      over the next {exposureData.timeHorizon} days.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12">
                <div className="text-6xl mb-4">📊</div>
                <p>Configure your exposure parameters and click calculate to see risk analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Trade Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
