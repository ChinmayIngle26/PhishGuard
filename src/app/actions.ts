
'use server';

import { analyzeEmail, AnalyzeEmailOutput } from '@/ai/flows/analyze-email-flow';
import { addReputationPoints, getUserReputation } from '@/services/reputation';
import { z } from 'zod';

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

//=========== USER REPUTATION ===========//
export async function getUserReputationAction(uid: string) {
    if (!uid) {
        return { success: false, error: 'User ID is required.', data: null };
    }
    try {
        const reputation = await getUserReputation(uid);
        return { success: true, error: null, data: reputation };
    } catch (error) {
        console.error('Error in getUserReputationAction:', error);
        return { success: false, error: 'Failed to fetch user reputation.', data: null };
    }
}
