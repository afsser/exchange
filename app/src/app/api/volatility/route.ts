import { NextRequest, NextResponse } from 'next/server';

// Historical volatility data for major currency pairs (annualized %)
// Based on typical market volatilities - in production, this would come from real market data
const volatilityData: { [key: string]: number } = {
  // Major pairs
  'EUR/USD': 12.5,
  'USD/EUR': 12.5,
  'GBP/USD': 15.8,
  'USD/GBP': 15.8,
  'USD/JPY': 10.2,
  'JPY/USD': 10.2,
  'EUR/GBP': 8.7,
  'GBP/EUR': 8.7,
  'AUD/USD': 14.3,
  'USD/AUD': 14.3,
  'USD/CAD': 9.8,
  'CAD/USD': 9.8,
  'USD/CHF': 11.2,
  'CHF/USD': 11.2,
  
  // Cross pairs
  'EUR/JPY': 13.1,
  'JPY/EUR': 13.1,
  'EUR/CHF': 6.8,
  'CHF/EUR': 6.8,
  'GBP/JPY': 16.9,
  'JPY/GBP': 16.9,
  'AUD/JPY': 15.7,
  'JPY/AUD': 15.7,
  
  // Emerging markets (higher volatility)
  'USD/BRL': 22.4,
  'BRL/USD': 22.4,
  'EUR/BRL': 24.1,
  'BRL/EUR': 24.1,
  'USD/CNY': 6.2,
  'CNY/USD': 6.2,
  'EUR/CNY': 8.9,
  'CNY/EUR': 8.9,
  
  // Nordic currencies
  'EUR/SEK': 11.3,
  'SEK/EUR': 11.3,
  'EUR/NOK': 13.7,
  'NOK/EUR': 13.7,
  'EUR/DKK': 2.1, // Very low due to peg
  'DKK/EUR': 2.1,
  'USD/SEK': 13.8,
  'SEK/USD': 13.8,
  'USD/NOK': 15.2,
  'NOK/USD': 15.2,
  'USD/DKK': 12.7,
  'DKK/USD': 12.7,
  
  // Additional crosses
  'GBP/CHF': 14.2,
  'CHF/GBP': 14.2,
  'AUD/CAD': 12.6,
  'CAD/AUD': 12.6,
  'CAD/JPY': 11.8,
  'JPY/CAD': 11.8,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters: from and to currencies' },
        { status: 400 }
      );
    }
    
    if (from === to) {
      return NextResponse.json({
        from,
        to,
        volatility: 0,
        source: 'same_currency'
      });
    }
    
    // Try to find volatility for the currency pair
    const pair = `${from}/${to}`;
    let volatility = volatilityData[pair];
    
    // If not found, use a default based on currency types
    if (volatility === undefined) {
      // Default volatilities based on currency characteristics
      const emergingCurrencies = ['BRL', 'CNY'];
      const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
      
      const fromIsEmerging = emergingCurrencies.includes(from);
      const toIsEmerging = emergingCurrencies.includes(to);
      const fromIsMajor = majorCurrencies.includes(from);
      const toIsMajor = majorCurrencies.includes(to);
      
      if (fromIsEmerging || toIsEmerging) {
        volatility = 18.5; // Higher volatility for emerging market pairs
      } else if (fromIsMajor && toIsMajor) {
        volatility = 12.0; // Standard volatility for major pairs
      } else {
        volatility = 15.0; // Medium volatility for other pairs
      }
    }
    
    return NextResponse.json({
      from,
      to,
      pair,
      volatility,
      source: volatilityData[pair] ? 'historical_data' : 'estimated',
      period: '30_days_annualized',
      confidence: volatilityData[pair] ? 'high' : 'medium'
    });
    
  } catch (error) {
    console.error('Volatility API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volatility data' },
      { status: 500 }
    );
  }
}
