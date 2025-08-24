'use server';

import { analyzeUrl } from '@/ai/flows/enhance-detection-accuracy';
import { NextRequest, NextResponse } from 'next/server';

const getCorsHeaders = () => {
    return new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
};

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: getCorsHeaders() });
    }

    const result = await analyzeUrl({ url });
    return NextResponse.json(result, { headers: getCorsHeaders() });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: getCorsHeaders() });
  }
}
