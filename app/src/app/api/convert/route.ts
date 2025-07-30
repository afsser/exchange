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
    // Frankfurter API requires 'from' and 'to' to be different
    if (from === to) {
      return NextResponse.json({ amount, base: from, rates: { [to]: amount } });
    }
    const apiRes = await fetch(`https://frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
    if (!apiRes.ok) {
      const text = await apiRes.text();
      return NextResponse.json({ error: text }, { status: apiRes.status });
    }
    const data = await apiRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Conversion failed" }, { status: 500 });
  }
}
