'use server';

import { analyzeUrl, AnalyzeUrlOutput } from '@/ai/flows/enhance-detection-accuracy';
import { z } from 'zod';

const ScanUrlSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

interface ScanState {
  success: boolean;
  data: AnalyzeUrlOutput | null;
  error: string | null;
}

export async function scanUrlAction(prevState: ScanState, formData: FormData): Promise<ScanState> {
  const validatedFields = ScanUrlSchema.safeParse({
    url: formData.get('url'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      data: null,
      error: validatedFields.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    const result = await analyzeUrl({ url: validatedFields.data.url });
    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    console.error('Error analyzing URL:', error);
    return {
      success: false,
      data: null,
      error: 'An unexpected error occurred. Please try again later.',
    };
  }
}
