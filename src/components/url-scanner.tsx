
"use client";

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useRef, useState } from 'react';
import { scanUrlAction, submitFeedbackAction } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { AnalyzeUrlOutput } from '@/ai/flows/enhance-detection-accuracy';
import { ShieldCheck, ShieldAlert, ShieldX, ThumbsUp, ThumbsDown, Loader2, Link as LinkIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from './auth-provider';
import Link from 'next/link';

type ScanResultWithUrl = AnalyzeUrlOutput & { url: string };

const initialScanState = {
  success: false,
  data: null,
  error: null,
};

const initialFeedbackState = {
    success: false,
    error: undefined,
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
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
  );
}

function ResultCard({ result }: { result: ScanResultWithUrl }) {
    const { isPhishing, confidence, reason, url } = result;
    const { user } = useAuth();
    const { toast } = useToast();
    const [feedbackState, feedbackAction] = useActionState(submitFeedbackAction, initialFeedbackState);
    const formRef = useRef<HTMLFormElement>(null);
    const { pending } = useFormStatus();


    useEffect(() => {
        if(feedbackState.success) {
            toast({
                title: "Feedback Submitted",
                description: "Thank you for helping improve PhishGuard! Your reputation has been updated.",
            });
        }
        if (feedbackState.error) {
            toast({
                variant: 'destructive',
                title: "Feedback Failed",
                description: feedbackState.error,
            });
        }
    }, [feedbackState, toast]);

    const handleFeedbackClick = (feedbackType: 'good' | 'bad') => {
        if (!user) {
            toast({
                title: "Login Required",
                description: "Please log in to provide feedback and earn rewards.",
                action: <Button asChild variant="outline" size="sm"><Link href="/login">Login</Link></Button>
            });
            return;
        }

        const formData = new FormData();
        formData.append('userId', user.uid);
        formData.append('feedbackType', feedbackType);
        feedbackAction(formData);
    }

    let status: 'Safe' | 'Suspicious' | 'Dangerous' | 'Probably Safe';
    let colorClass: string;
    let Icon: React.ElementType;
    let progressClass: string;
    let badgeClass: string;

    if (isPhishing) {
        if (confidence >= 0.75) {
            status = 'Dangerous';
            colorClass = 'text-destructive';
            Icon = ShieldX;
            progressClass = '[&>div]:bg-destructive';
            badgeClass = 'border-destructive/50 bg-destructive/10 text-destructive';
        } else {
            status = 'Suspicious';
            colorClass = 'text-yellow-500';
            Icon = ShieldAlert;
            progressClass = '[&>div]:bg-yellow-500';
            badgeClass = 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500';
        }
    } else {
        if (confidence >= 0.75) {
            status = 'Safe';
            colorClass = 'text-green-600';
            Icon = ShieldCheck;
            progressClass = '[&>div]:bg-green-600';
            badgeClass = 'border-green-600/50 bg-green-600/10 text-green-600';
        } else {
            status = 'Probably Safe';
            colorClass = 'text-primary';
            Icon = ShieldCheck;
            progressClass = '[&>div]:bg-primary';
            badgeClass = 'border-primary/50 bg-primary/10 text-primary';
        }
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
                        <span className="text-sm font-medium">Confidence Score</span>
                        <Badge variant="outline" className={cn('font-semibold', badgeClass)}>
                            {(confidence * 100).toFixed(0)}%
                        </Badge>
                    </div>
                    <Progress value={confidence * 100} className={cn('h-2', progressClass)} />
                </div>

                <div>
                    <h4 className="font-semibold mb-2">AI Analysis</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md border">{reason}</p>
                </div>

                <div className="pt-4 border-t">
                    <p className="text-sm text-center text-muted-foreground mb-3">Was this result helpful?</p>
                    <form action={feedbackAction} ref={formRef} className="flex justify-center gap-4">
                         <Button variant="outline" size="sm" onClick={() => handleFeedbackClick('good')} disabled={pending}>
                            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" /> }
                             Yes
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleFeedbackClick('bad')} disabled={pending}>
                            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsDown className="mr-2 h-4 w-4" />}
                             No
                        </Button>
                    </form>
                     <p className="text-xs text-center text-muted-foreground mt-3 max-w-sm mx-auto">Your feedback is anonymized and helps improve our detection engine for everyone.</p>
                </div>
            </CardContent>
        </Card>
    );
}


export function UrlScanner() {
  const [scanState, formAction] = useActionState(scanUrlAction, initialScanState);
  const [result, setResult] = useState<ScanResultWithUrl | null>(null);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (scanState.success && scanState.data) {
        const url = formRef.current?.url.value || '';
        setResult({ ...scanState.data, url });
    } else if (scanState.error) {
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: scanState.error,
      });
      setResult(null);
    }
  }, [scanState, toast]);

  return (
    <div className="w-full flex flex-col items-center gap-8 px-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle>AI-Powered URL Scanner</CardTitle>
          <CardDescription>Enter a URL to scan for phishing threats in real-time.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <Input
                    name="url"
                    type="url"
                    placeholder="https://example.com"
                    required
                    className="flex-grow text-base"
                />
                <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
      
      {result && <ResultCard result={result} />}
    </div>
  );
}
