
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert, ShieldX, Bot, Quote, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

// Re-define the type here to avoid importing from the server-only flow file.
type EmailTactic = {
    tactic: "Urgency or Scarcity" | "Threats or Consequences" | "Suspicious Attachments" | "Impersonation" | "Generic Salutation" | "Grammar and Spelling Errors" | "Unusual Sender Address" | "Request for Sensitive Information" | "Unexpected Prize or Offer";
    explanation: string;
    quote: string;
};

type AnalyzeEmailOutput = {
    overallRiskLevel: number;
    overallRecommendation: string;
    detectedTactics: EmailTactic[];
};


function ResultCard({ result }: { result: AnalyzeEmailOutput }) {
    const { overallRiskLevel, overallRecommendation, detectedTactics } = result;

    let status: 'Likely Safe' | 'Suspicious' | 'Dangerous';
    let colorClass: string;
    let Icon: React.ElementType;
    let progressClass: string;
    let badgeClass: string;

    if (overallRiskLevel > 80) {
        status = 'Dangerous';
        colorClass = 'text-destructive';
        Icon = ShieldX;
        progressClass = '[&>div]:bg-destructive';
        badgeClass = 'border-destructive/50 bg-destructive/10 text-destructive';
    } else if (overallRiskLevel > 40) {
        status = 'Suspicious';
        colorClass = 'text-yellow-500';
        Icon = ShieldAlert;
        progressClass = '[&>div]:bg-yellow-500';
        badgeClass = 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500';
    } else {
        status = 'Likely Safe';
        colorClass = 'text-green-600';
        Icon = ShieldCheck;
        progressClass = '[&>div]:bg-green-600';
        badgeClass = 'border-green-600/50 bg-green-600/10 text-green-600';
    }


    return (
        <Card className="w-full max-w-2xl animate-in fade-in-0 zoom-in-95">
            <CardHeader>
                <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                    <Icon className={cn("h-12 w-12 shrink-0", colorClass)} />
                    <div className='w-full'>
                        <CardTitle className={cn("text-2xl", colorClass)}>{status}</CardTitle>
                        <CardDescription>AI analysis of the submitted email content.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Overall Risk Level</span>
                        <Badge variant="outline" className={cn('font-semibold', badgeClass)}>
                            {overallRiskLevel}/100
                        </Badge>
                    </div>
                    <Progress value={overallRiskLevel} className={cn('h-2', progressClass)} />
                </div>

                <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Bot className="h-4 w-4" /> AI Recommendation</h4>
                    <p className={cn("text-sm font-semibold p-3 rounded-md border", badgeClass)}>{overallRecommendation}</p>
                </div>
                
                {detectedTactics.length > 0 ? (
                    <div>
                        <h4 className="font-semibold mb-2">Detected Phishing Tactics</h4>
                        <div className="space-y-3">
                            {detectedTactics.map((tactic, index) => (
                                <div key={index} className="p-3 bg-muted rounded-md border">
                                    <p className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> {tactic.tactic}</p>
                                    <p className="text-sm text-muted-foreground mt-1 mb-2">{tactic.explanation}</p>
                                    <blockquote className="border-l-4 border-primary/50 pl-3 text-sm italic flex items-start gap-2">
                                        <Quote className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span>{tactic.quote}</span>
                                    </blockquote>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <Alert>
                        <Bot className="h-4 w-4"/>
                        <AlertTitle>No Obvious Tactics Found</AlertTitle>
                        <AlertDescription>
                            The AI did not detect any of the common phishing tactics it looks for. However, always remain cautious.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}


export function EmailScanner() {
  const [result, setResult] = useState<AnalyzeEmailOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error,
      });
    }
  }, [error, toast]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const emailContent = formData.get('emailContent') as string;
    
    if (emailContent.length < 50) {
        setError('Email content must be at least 50 characters long.');
        setPending(false);
        return;
    }

    try {
        const response = await fetch('/api/analyze-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailContent }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'An unexpected error occurred.');
        }

        setResult(data);

    } catch (err: any) {
        const errorMessage = err.message || 'An unexpected error occurred. Please try again later.';
        setError(errorMessage);
    } finally {
        setPending(false);
    }
  }


  return (
    <div className="w-full flex flex-col items-center gap-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle>AI-Powered Email Analyzer</CardTitle>
          <CardDescription>Paste the full content of a suspicious email to analyze it for phishing and social engineering tactics.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
             <Textarea
                name="emailContent"
                placeholder="Paste email content here..."
                required
                className="min-h-[200px] text-sm"
              />
            <div className="flex justify-end">
               <Button type="submit" disabled={pending} className="w-full sm:w-auto">
                    {pending ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Email...
                        </>
                    ) : (
                        'Analyze Email'
                    )}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {result && <ResultCard result={result} />}
    </div>
  );
}
