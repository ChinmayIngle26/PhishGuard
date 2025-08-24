
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
  riskLevel: z
    .number()
    .min(0)
    .max(100)
    .describe('A risk level from 0 (Safe) to 100 (Dangerous).'),
  reason: z.string().describe('A detailed analysis of the signals that led to the risk determination.'),
  impersonatedBrand: z.string().optional().describe('The brand or service the URL is attempting to impersonate, if any.'),
    recommendation: z.string().describe('A clear, actionable recommendation for the user.'),
});
export type AnalyzeUrlOutput = z.infer<typeof AnalyzeUrlOutputSchema>;

export async function analyzeUrl(input: AnalyzeUrlInput): Promise<AnalyzeUrlOutput> {
  return analyzeUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeUrlPrompt',
  input: {schema: AnalyzeUrlInputSchema},
  output: {schema: AnalyzeUrlOutputSchema},
  model: ai.model('googleai/gemini-2.0-flash'),
  prompt: `You are a Principal Security Analyst AI specializing in detecting modern, sophisticated phishing attacks.
You are tasked with analyzing a URL to determine if it is malicious. You must be aware of advanced evasion tactics, including AI prompt injection and social engineering.

Analyze the following URL: {{{url}}}

Consider these critical factors in your analysis:
1.  **URL Structure & Content:**
    *   **Brand Impersonation:** Does the domain, subdomains, or path attempt to mimic a known brand (e.g., 'gmial.com', 'google-support.xyz')? If you detect brand impersonation, you MUST populate the 'impersonatedBrand' field with the name of the brand.
    *   **Suspicious Keywords:** Does the URL contain terms that create urgency or demand action (e.g., 'login-expiry', 'account-verification', 'secure-update')?
    *   **Subdomain Complexity:** Are there an unusual number of subdomains?
    *   **File Extensions:** Does the URL point to an executable file (.exe, .scr) or an unusual file type?

2.  **Redirection & Obfuscation:**
    *   **Redirect Chains:** Be highly suspicious if the URL belongs to a legitimate service (e.g., a marketing platform like Microsoft Dynamics, SendGrid, etc.) but is likely used for redirection. These are often used as an initial hop to a malicious site.
    *   **URL Shorteners:** Treat URLs from common shorteners with caution until the final destination is known.

3.  **Inferred Landing Page Analysis:**
    *   **CAPTCHA/Human Verification:** While not inherently malicious, the presence of a CAPTCHA on an unusual domain can be a sign of an attacker trying to block automated security crawlers. Mention this possibility.
    *   **Social Engineering Cues:** Based on the URL, what is the likely intent of the page? Does it suggest a login form, a prize, a warning, or a request for credentials?

**Your Task:**
Based on a holistic analysis of the URL, provide a risk score and a detailed breakdown.

- **riskLevel**: Provide a score from 0 (completely safe) to 100 (definitely phishing/malicious).
    - 0-10: Standard, well-known, safe sites (e.g., google.com, wikipedia.org).
    - 11-40: Seems safe, but is a less common domain or has some unusual characteristics.
    - 41-70: Suspicious. Contains some red flags like unusual keywords, complex subdomains, or is a known redirector/shortener.
    - 71-90: Highly Suspicious. Strong indicators of phishing, like brand impersonation.
    - 91-100: Dangerous. Almost certainly a malicious site impersonating a login page or attempting to serve malware.

- **reason**: Provide a concise but detailed explanation for your determination, referencing the factors above. Explain *why* the URL has the assigned risk level. Structure your reasoning with sub-headings for positive and negative signals if applicable.

- **impersonatedBrand**: If brand impersonation is detected, specify the brand name (e.g., "Google", "Apple", "Bank of America"). Otherwise, leave it empty.

- **recommendation**: Based on the risk level, provide a clear, actionable recommendation.
    - For low risk (0-40): "This site appears to be safe."
    - For suspicious (41-70): "Proceed with caution. Do not enter sensitive information."
    - For high risk (71-100): "Avoid this site. It shows strong signs of being a phishing or malicious page."

Output your findings in the required JSON format.`,
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
