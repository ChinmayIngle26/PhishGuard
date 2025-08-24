
import { analyzeEmail } from '@/ai/flows/analyze-email-flow';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const AnalyzeEmailSchema = z.object({
  emailContent: z.string().min(50, { message: 'Email content must be at least 50 characters long.' }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedFields = AnalyzeEmailSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({ error: validatedFields.error.errors.map((e) => e.message).join(', ') }, { status: 400 });
    }

    const { emailContent } = validatedFields.data;
    
    const result = await analyzeEmail({ emailContent });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error in /api/analyze-email:', error);
    const isRateLimitError = error.status === 429;
    
    return NextResponse.json({ 
        error: isRateLimitError ? 'API rate limit exceeded. Please try again later.' : 'Internal Server Error' 
    }, { 
        status: isRateLimitError ? 429 : 500 
    });
  }
}
