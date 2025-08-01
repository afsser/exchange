import { NextRequest, NextResponse } from 'next/server';
import { AlphaVantageService } from '@/lib/alphaVantage';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from')?.toUpperCase();
  const to = searchParams.get('to')?.toUpperCase();

  if (!from || !to) {
    return NextResponse.json(
      { error: 'Missing required parameters: from and to' },
      { status: 400 }
    );
  }

  try {
    // Use daily cache method for real volatility calculation
    const volatilityData = await AlphaVantageService.getVolatilityWithDailyCache(from, to);
    
    return NextResponse.json(volatilityData);
  } catch (error) {
    console.error('Error in volatility API:', error);
    
    // Return enhanced fallback data
    const fallbackData = AlphaVantageService.getFallbackVolatility(from, to);
    return NextResponse.json({
      ...fallbackData,
      error: 'API error - using enhanced fallback data'
    });
  }
}
