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
    if (from === to) {
      const numAmount = parseFloat(amount);
      return NextResponse.json({ 
        amount: numAmount, 
        base: from, 
        rates: { [to]: numAmount } ,
        rate: 1,
        date: new Date().toISOString().split('T')[0],
        time_last_updated: Math.floor(Date.now() / 1000)
      });
    }
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

    if (!data.rates || !data.rates[to]) {
      return NextResponse.json({ 
        error: `Currency ${to} not supported` 
      }, { status: 400 });
    }

    const rate = data.rates[to];
    const convertedAmount = parseFloat(amount) * rate;
    
    return NextResponse.json({
      amount: parseFloat(amount),
      base: from,
      rates: { [to]: convertedAmount },
      rate: rate,
      date: data.date,
      time_last_updated: data.time_last_updated
    });
  } catch (err: unknown) {
    console.error('Convert API error:', err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}