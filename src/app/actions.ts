
'use server';

import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { analyzeUrl, AnalyzeUrlOutput } from '@/ai/flows/enhance-detection-accuracy';
import { analyzeEmail, AnalyzeEmailOutput } from '@/ai/flows/analyze-email-flow';
import { addReputationPoints, createUserReputation, getUserReputation } from '@/services/reputation';
import { addThreat } from '@/services/threats';
import { z } from 'zod';

// Initialize Firebase Admin for this server-side environment.
try {
  initializeFirebaseAdmin();
} catch (error) {
    console.error("Failed to initialize Firebase Admin SDK in actions.ts. Features requiring admin privileges may fail.", error);
}


const DANGEROUS_RISK_THRESHOLD = 75;

//=========== URL SCANNING ===========//

const ScanUrlSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

interface ScanUrlState {
  success: boolean;
  data: AnalyzeUrlOutput | null;
  error: string | null;
}

export async function scanUrlAction(prevState: ScanUrlState, formData: FormData): Promise<ScanUrlState> {
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

  const url = validatedFields.data.url;

  try {
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

//=========== EMAIL ANALYSIS ===========//

const ScanEmailSchema = z.object({
  emailContent: z.string().min(50, { message: 'Email content must be at least 50 characters long.' }),
});

interface ScanEmailState {
  success: boolean;
  data: AnalyzeEmailOutput | null;
  error: string | null;
}

export async function scanEmailAction(prevState: ScanEmailState, formData: FormData): Promise<ScanEmailState> {
    const validatedFields = ScanEmailSchema.safeParse({
        emailContent: formData.get('emailContent'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            data: null,
            error: validatedFields.error.errors.map((e) => e.message).join(', '),
        };
    }

    try {
        const result = await analyzeEmail({ emailContent: validatedFields.data.emailContent });
        return {
            success: true,
            data: result,
            error: null,
        };
    } catch (error) {
        console.error('Error analyzing email:', error);
        return {
            success: false,
            data: null,
            error: 'An unexpected error occurred during email analysis. Please try again.',
        };
    }
}


//=========== USER FEEDBACK ===========//

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
        await addReputationPoints(userId, feedbackType);
        return { success: true };
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return { success: false, error: 'Failed to submit feedback. Please try again.' };
    }
}
