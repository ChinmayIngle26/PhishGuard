
import { analyzeUrl } from '@/ai/flows/enhance-detection-accuracy';
import { addThreat } from '@/services/threats';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const DANGEROUS_RISK_THRESHOLD = 75;

const ScanUrlSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

const getCorsHeaders = () => {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
};

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedFields = ScanUrlSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({ error: validatedFields.error.errors.map((e) => e.message).join(', ') }, { status: 400, headers: getCorsHeaders() });
    }

    const { url } = validatedFields.data;
    
    const result = await analyzeUrl({ url });

    // If the URL is dangerous, add it to the threat feed.
    if (result.riskLevel >= DANGEROUS_RISK_THRESHOLD) {
      try {
        await addThreat({
          url: url,
          riskLevel: result.riskLevel,
          reason: result.reason,
          timestamp: new Date().toISOString(),
        });
      } catch (threatError) {
          console.error("Failed to add threat to database, but returning success to user.", threatError);
      }
    }

    return NextResponse.json(result, { headers: getCorsHeaders() });
  } catch (error) {
    console.error('API Error in /api/scan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: getCorsHeaders() });
  }
}
