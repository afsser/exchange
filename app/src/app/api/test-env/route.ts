import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let apiKeyStatus = 'not_configured';
  let apiTestResult = null;
  
  if (apiKey) {
    try {
      const testResponse = await fetch(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=${apiKey}`
      );
      
      const testData = await testResponse.json();
      
      if (testData['Error Message']) {
        apiKeyStatus = 'invalid';
        apiTestResult = testData['Error Message'];
      } else if (testData['Note']) {
        apiKeyStatus = 'rate_limited';
        apiTestResult = 'Rate limit reached';
      } else if (testData['Realtime Currency Exchange Rate']) {
        apiKeyStatus = 'working';
        apiTestResult = 'API key is functional';
      } else {
        apiKeyStatus = 'unknown_response';
        apiTestResult = 'Unexpected API response';
      }
    } catch (error) {
      apiKeyStatus = 'network_error';
      apiTestResult = 'Failed to connect to Alpha Vantage';
    }
  }
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    // Só mostra preview em desenvolvimento
    keyPreview: isDevelopment && apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(-4)}` : 'Hidden in production',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    // Status da API key
    apiKeyStatus,
    apiTestResult,
    // Informações úteis
    deploymentInfo: {
      platform: process.env.VERCEL ? 'Vercel' : 'Local',
      region: process.env.VERCEL_REGION || 'localhost'
    }
  });
}