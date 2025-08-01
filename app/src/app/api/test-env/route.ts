// src/app/api/test-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyPreview: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(-4)}` : 'Not found',
    environment: process.env.NODE_ENV
  });
}