
"use client";

import { useFormStatus, useFormState } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { submitFeedbackAction } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { AnalyzeUrlOutput } from '@/ai/flows/enhance-detection-accuracy';
import { ShieldCheck, ShieldAlert, ShieldX, ThumbsUp, ThumbsDown, Loader2, Link as LinkIcon, CheckCircle2, Building } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from './auth-provider';
import Link from 'next/link';

type ScanResultWithUrl = AnalyzeUrlOutput & { url: string };

const initialFeedbackState = {
    success: false,
    error: undefined,
}

function FeedbackButton({ feedbackType, isPending, hasBeenSelected, formAction }: { feedbackType: 'good' | 'bad', isPending: boolean, hasBeenSelected: boolean, formAction: (payload: FormData) => void }) {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleClick = (e: React.MouseEvent<HTMLFormElement>) => {
        if (!user) {
            e.preventDefault();
            toast({
                title: "Login Required",
                description: "Please log in to provide feedback and earn rewards.",
                action: <Button asChild variant="outline" size="sm"><Link href="/login">Login</Link></Button>
            });
        }
    }

    return (
        <form action={formAction} onSubmit={(e) => { handleClick(e.currentTarget); }} className="flex items-center gap-2">
            {user && <input type="hidden" name="userId" value={user.uid} />}
            <input type="hidden" name="feedbackType" value={feedbackType} />
            <Button 
                type="submit" 
                variant="outline" 
                size="sm" 
                disabled={isPending}
                className={cn({'bg-accent text-accent-foreground': hasBeenSelected})}
            >
                {isPending && hasBeenSelected ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                ) : (
                    hasBeenSelected ? (
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                        feedbackType === 'good' ? <ThumbsUp className="mr-2 h-4 w-4" /> : <ThumbsDown className="mr-2 h-4 w-4" />
                    )
                )}
                {feedbackType === 'good' ? 'Yes' : 'No'}
            </Button>
        </form>
    )
}

function ResultCard({ result }: { result: ScanResultWithUrl }) {
    const { riskLevel, reason, url, impersonatedBrand, recommendation } = result;
    const { toast } = useToast();
    const [feedbackState, feedbackAction, isFeedbackPending] = useFormState(submitFeedbackAction, initialFeedbackState);
    const [submittedFeedback, setSubmittedFeedback] = useState<'good' | 'bad' | null>(null);
    
    useEffect(() => {
        if (feedbackState.success) {
            toast({
                title: "Feedback Submitted",
                description: "Thank you for helping improve PhishGuard! Your reputation has been updated.",
            });
            // This is a bit of a hack to find out which button was clicked.
            const lastAction = (feedbackState as any).lastAction;
            if (lastAction) {
                setSubmittedFeedback(lastAction);
            }
        }
        if (feedbackState.error) {
            toast({
                variant: 'destructive',
                title: "Feedback Failed",
                description: feedbackState.error,
            });
        }
    }, [feedbackState, toast]);

    let status: 'Safe' | 'Low Risk' | 'Suspicious' | 'Dangerous';
    let colorClass: string;
    let Icon: React.ElementType;
    let progressClass: string;
    let badgeClass: string;

    if (riskLevel > 75) {
        status = 'Dangerous';
        colorClass = 'text-destructive';
        Icon = ShieldX;
        progressClass = '[&>div]:bg-destructive';
        badgeClass = 'border-destructive/50 bg-destructive/10 text-destructive';
    } else if (riskLevel > 40) {
        status = 'Suspicious';
        colorClass = 'text-yellow-500';
        Icon = ShieldAlert;
        progressClass = '[&>div]:bg-yellow-500';
        badgeClass = 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500';
    } else if (riskLevel > 10) {
        status = 'Low Risk';
        colorClass = 'text-primary';
        Icon = ShieldCheck;
        progressClass = '[&>div]:bg-primary';
        badgeClass = 'border-primary/50 bg-primary/10 text-primary';
    } else {
        status = 'Safe';
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
                        <CardDescription>Scan result for the submitted URL.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-md overflow-hidden border">
                    <LinkIcon className="h-4 w-4 shrink-0"/>
                    <span className="truncate font-mono">{url}</span>
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Risk Level</span>
                        <Badge variant="outline" className={cn('font-semibold', badgeClass)}>
                            {riskLevel}/100
                        </Badge>
                    </div>
                    <Progress value={riskLevel} className={cn('h-2', progressClass)} />
                </div>

                {impersonatedBrand && (
                     <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Building className="h-4 w-4" /> Impersonated Brand</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md border">{impersonatedBrand}</p>
                    </div>
                )}

                <div>
                    <h4 className="font-semibold mb-2">AI Analysis</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md border whitespace-pre-wrap">{reason}</p>
                </div>

                 <div>
                    <h4 className="font-semibold mb-2">Recommendation</h4>
                    <p className={cn("text-sm font-semibold p-3 rounded-md border", badgeClass)}>{recommendation}</p>
                </div>

                <div className="pt-4 border-t">
                     <div className="flex justify-center items-center gap-4">
                        <p className="text-sm text-muted-foreground">Was this result helpful?</p>
                        <div className="flex items-center gap-2">
                             <FeedbackButton feedbackType="good" isPending={isFeedbackPending} hasBeenSelected={submittedFeedback === 'good'} formAction={feedbackAction} />
                             <FeedbackButton feedbackType="bad" isPending={isFeedbackPending} hasBeenSelected={submittedFeedback === 'bad'} formAction={feedbackAction} />
                        </div>
                    </div>
                     {submittedFeedback && (
                        <p className="text-xs text-center text-muted-foreground mt-3 animate-in fade-in-0">
                            Thank you for your feedback!
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


export function UrlScanner() {
  const [result, setResult] = useState<ScanResultWithUrl | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const url = formData.get('url') as string;

    try {
        const response = await fetch('/api/actions/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'An unexpected error occurred.');
        }

        setResult({ ...data, url });

    } catch (err: any) {
        const errorMessage = err.message || 'An unexpected error occurred. Please try again later.';
        setError(errorMessage);
        toast({
            variant: 'destructive',
            title: 'Scan Failed',
            description: errorMessage,
        });
    } finally {
        setPending(false);
    }
  }
  
  useEffect(() => {
    if (error) {
        toast({
            variant: 'destructive',
            title: 'Scan Failed',
            description: error,
        });
    }
  }, [error, toast]);

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle>AI-Powered URL Scanner</CardTitle>
          <CardDescription>Enter a URL to scan for phishing threats in real-time.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <Input
                    name="url"
                    type="url"
                    placeholder="https://example.com"
                    required
                    className="flex-grow text-base"
                    disabled={pending}
                />
                <Button type="submit" disabled={pending} className="w-full sm:w-auto flex-shrink-0">
                  {pending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    'Scan URL'
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
