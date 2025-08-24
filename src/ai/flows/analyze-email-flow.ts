
'use server';

/**
 * @fileOverview An AI-powered phishing email content analyzer.
 *
 * - analyzeEmail - A function that analyzes email text to detect phishing attempts.
 * - AnalyzeEmailInput - The input type for the analyzeEmail function.
 * - AnalyzeEmailOutput - The return type for the analyzeEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeEmailInputSchema = z.object({
  emailContent: z.string().describe('The full content or body of the email to analyze.'),
});
export type AnalyzeEmailInput = z.infer<typeof AnalyzeEmailInputSchema>;

const EmailTacticSchema = z.object({
    tactic: z.enum([
        "Urgency or Scarcity",
        "Threats or Consequences",
        "Suspicious Attachments",
        "Impersonation",
        "Generic Salutation",
        "Grammar and Spelling Errors",
        "Unusual Sender Address",
        "Request for Sensitive Information",
        "Unexpected Prize or Offer"
    ]).describe("The specific phishing tactic identified."),
    explanation: z.string().describe("A brief explanation of why this tactic was flagged in the text."),
    quote: z.string().describe("The exact quote from the email that demonstrates this tactic."),
});

const AnalyzeEmailOutputSchema = z.object({
  overallRiskLevel: z
    .number()
    .min(0)
    .max(100)
    .describe('An overall risk level from 0 (Safe) to 100 (Phishing).'),
  overallRecommendation: z.string().describe('A clear, actionable recommendation for the user regarding the entire email.'),
  detectedTactics: z.array(EmailTacticSchema).describe("A list of social engineering and phishing tactics detected in the email."),
});
export type AnalyzeEmailOutput = z.infer<typeof AnalyzeEmailOutputSchema>;

export async function analyzeEmail(input: AnalyzeEmailInput): Promise<AnalyzeEmailOutput> {
  return analyzeEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmailPrompt',
  input: {schema: AnalyzeEmailInputSchema},
  output: {schema: AnalyzeEmailOutputSchema},
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an expert cybersecurity AI specializing in detecting phishing and social engineering in email communications.
Your task is to analyze the provided email content and identify any manipulative tactics being used.

**Email Content to Analyze:**
\`\`\`
{{{emailContent}}}
\`\`\`

**Your Analysis Task:**
1.  **Identify Tactics:** Scrutinize the email for common phishing and social engineering tactics. For each tactic you identify with high confidence, create an entry in the 'detectedTactics' array. You must provide the tactic name, an explanation, and a direct quote from the email.
    *   **Tactic Categories:**
        *   \`Urgency or Scarcity\`: (e.g., "Act now!", "Offer expires in 1 hour")
        *   \`Threats or Consequences\`: (e.g., "Your account will be suspended")
        *   \`Suspicious Attachments\`: Mention of unexpected or generic attachments.
        *   \`Impersonation\`: Pretending to be a known company or person.
        *   \`Generic Salutation\`: (e.g., "Dear Valued Customer")
        *   \`Grammar and Spelling Errors\`: Obvious mistakes that a professional organization wouldn't make.
        *   \`Unusual Sender Address\`: If the sender's email seems off, although you only have the content.
        *   \`Request for Sensitive Information\`: Asking for passwords, credit card numbers, etc.
        *   \`Unexpected Prize or Offer\`: (e.g., "You've won a lottery you never entered")

2.  **Calculate Overall Risk Level:** Based on the number and severity of the tactics you found, determine an \`overallRiskLevel\` from 0 to 100.
    *   0-20: No significant tactics found. Seems like a normal email.
    *   21-60: One or two minor red flags (e.g., generic salutation, a single typo).
    *   61-85: Several red flags, or one very strong one (e.g., a clear threat, a request for a password).
    *   86-100: Blatant phishing attempt with multiple, severe tactics.

3.  **Provide a Recommendation:** Based on the risk level, provide a clear, actionable \`overallRecommendation\`.
    *   For low risk (0-40): "This email appears to be safe, but always be cautious with links and attachments."
    *   For suspicious (41-80): "This email is suspicious. Do not click any links, download attachments, or reply."
    *   For high risk (81-100): "This is likely a phishing attack. Delete this email immediately and do not interact with it."

**Important:**
-   If no tactics are found, return an empty array for \`detectedTactics\` and a low risk score.
-   Be precise. Your analysis helps users avoid being scammed.

Output your findings in the required JSON format.`,
});

const analyzeEmailFlow = ai.defineFlow(
  {
    name: 'analyzeEmailFlow',
    inputSchema: AnalyzeEmailInputSchema,
    outputSchema: AnalyzeEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
