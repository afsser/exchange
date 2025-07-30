import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const amount = searchParams.get("amount");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!amount || !from || !to) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    // Handle same currency conversion
    if (from === to) {
      const numAmount = parseFloat(amount);
      return NextResponse.json({ 
        amount: numAmount, 
        base: from, 
        rates: { [to]: numAmount } 
      });
    }

    // Use ExchangeRate-API (free, no API key required)
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${from}`;
    console.log('Calling ExchangeRate API:', apiUrl);
    
    const apiRes = await fetch(apiUrl);
    
    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error('ExchangeRate API error:', apiRes.status, apiRes.statusText, errorText);
      return NextResponse.json({ 
        error: `Currency conversion failed: ${apiRes.status} ${apiRes.statusText}` 
      }, { status: apiRes.status });
    }

    const data = await apiRes.json();
    console.log('ExchangeRate API response:', data);
    
    // Check if target currency exists in rates
    if (!data.rates || !data.rates[to]) {
      return NextResponse.json({ 
        error: `Currency ${to} not supported` 
      }, { status: 400 });
    }
    
    // Calculate the converted amount
    const rate = data.rates[to];
    const convertedAmount = parseFloat(amount) * rate;
    
    return NextResponse.json({
      amount: parseFloat(amount),
      base: from,
      rates: { [to]: convertedAmount }
    });
  } catch (err: unknown) {
    console.error('Convert API error:', err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}