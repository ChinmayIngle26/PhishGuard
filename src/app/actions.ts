
'use server';

import { analyzeUrl, AnalyzeUrlOutput } from '@/ai/flows/enhance-detection-accuracy';
import { addReputationPoints, getUserReputation } from '@/services/reputation';
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

const FeedbackSchema = z.object({
    userId: z.string().min(1, { message: 'User ID is required.' }),
    feedbackType: z.enum(['good', 'bad']),
});

export async function submitFeedbackAction(prevState: any, formData: FormData): Promise<{ success: boolean; error?: string }> {
    const validatedFields = FeedbackSchema.safeParse({
        userId: formData.get('userId'),
        feedbackType: formData.get('feedbackType'),
    });
    
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input.' };
    }

    try {
        const { userId, feedbackType } = validatedFields.data;
        const userRep = await getUserReputation(userId);
        if (!userRep) {
            return { success: false, error: 'User reputation profile not found.' };
        }
        await addReputationPoints(userId, feedbackType);
        return { success: true };
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return { success: false, error: 'Failed to submit feedback. Please try again.' };
    }
}
