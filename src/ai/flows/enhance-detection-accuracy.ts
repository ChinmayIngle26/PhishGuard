'use server';

/**
 * @fileOverview An AI-powered phishing URL detector flow.
 *
 * - analyzeUrl - A function that analyzes a URL to detect phishing attempts.
 * - AnalyzeUrlInput - The input type for the analyzeUrl function.
 * - AnalyzeUrlOutput - The return type for the analyzeUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUrlInputSchema = z.object({
  url: z.string().describe('The URL to analyze.'),
});
export type AnalyzeUrlInput = z.infer<typeof AnalyzeUrlInputSchema>;

const AnalyzeUrlOutputSchema = z.object({
  isPhishing: z.boolean().describe('Whether the URL is likely a phishing attempt.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence level of the phishing detection (0 to 1).'),
  reason: z.string().describe('The reason for the phishing determination.'),
});
export type AnalyzeUrlOutput = z.infer<typeof AnalyzeUrlOutputSchema>;

export async function analyzeUrl(input: AnalyzeUrlInput): Promise<AnalyzeUrlOutput> {
  return analyzeUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeUrlPrompt',
  input: {schema: AnalyzeUrlInputSchema},
  output: {schema: AnalyzeUrlOutputSchema},
  prompt: `You are an AI-powered phishing detection expert.

You will analyze the given URL and determine if it is a phishing attempt.

Consider various factors such as URL structure, domain age, presence of suspicious keywords,
and any other relevant indicators.

URL: {{{url}}}

Based on your analysis, determine the likelihood of the URL being a phishing attempt.
Set the isPhishing field to true if it is likely a phishing attempt, and false otherwise.
Provide a confidence level (0 to 1) indicating the certainty of your detection.
Explain the reason for your determination in the reason field.

Ensure that the output adheres to the AnalyzeUrlOutputSchema format.`, // Changed prompt to conform to the format and description requirements
});

const analyzeUrlFlow = ai.defineFlow(
  {
    name: 'analyzeUrlFlow',
    inputSchema: AnalyzeUrlInputSchema,
    outputSchema: AnalyzeUrlOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
