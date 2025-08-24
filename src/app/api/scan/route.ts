
'use server';

import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { analyzeUrl } from '@/ai/flows/enhance-detection-accuracy';
import { addThreat } from '@/services/threats';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Firebase Admin for this server-side environment.
try {
  initializeFirebaseAdmin();
} catch (error) {
    console.error("Failed to initialize Firebase Admin SDK in API route. Features requiring admin privileges may fail.", error);
}


const DANGEROUS_RISK_THRESHOLD = 75;

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

    // If the URL is dangerous, add it to the threat feed
    if (result.riskLevel >= DANGEROUS_RISK_THRESHOLD) {
      await addThreat({
        url: url,
        riskLevel: result.riskLevel,
        reason: result.reason,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(result, { headers: getCorsHeaders() });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: getCorsHeaders() });
  }
}
