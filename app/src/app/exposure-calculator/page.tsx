'use client';

import { useState, useEffect } from 'react';
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

  // Load initial volatility data
  useEffect(() => {
    fetchVolatility(exposureData.baseCurrency, exposureData.targetCurrency);
  }, []);

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
        
        // Value at Risk calculation (simplified)
        // VaR = Position × Volatility × √(Time/365) × Z-score (95% confidence = 1.645)
        const timeAdjustedVolatility = (volatilityToUse / 100) * Math.sqrt(exposureData.timeHorizon / 365);
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
    
    // Fetch new volatility when currencies change
    const newBaseCurrency = field === 'baseCurrency' ? value : exposureData.baseCurrency;
    const newTargetCurrency = field === 'targetCurrency' ? value : exposureData.targetCurrency;
    
    if (newBaseCurrency !== newTargetCurrency) {
      fetchVolatility(newBaseCurrency, newTargetCurrency);
    } else {
      setVolatilityData({
        from: newBaseCurrency,
        to: newTargetCurrency,
        pair: `${newBaseCurrency}/${newTargetCurrency}`,
        volatility: 0,
        source: 'same_currency',
        period: '30_days_annualized',
        confidence: 'high'
      });
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-600';
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
              <div className="mb-6 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Market Volatility</div>
                    <div className="text-lg font-semibold text-white">
                      {volatilityData.volatility.toFixed(1)}% p.a.
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">
                      {volatilityData.source === 'historical_data' ? '📊 Historical' : '📈 Estimated'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {volatilityData.confidence} confidence
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

            {/* Calculate Button */}
            <button
              onClick={calculateExposure}
              disabled={loading || loadingVolatility || !volatilityData || volatilityData.volatility === undefined}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Calculating...' : 
               loadingVolatility ? 'Loading Market Data...' :
               !volatilityData || volatilityData.volatility === undefined ? 'Select Currency Pair' :
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
                  <p className="text-sm text-indigo-200">
                    Based on {exposureData.volatility}% annual volatility over {exposureData.timeHorizon} days, 
                    there is a 5% chance your exposure could lose more than{' '}
                    {formatCurrency(riskMetrics.valueAtRisk, exposureData.targetCurrency)} due to FX movements.
                  </p>
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
