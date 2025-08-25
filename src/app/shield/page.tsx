
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ShieldX, Loader2, ArrowLeft, Building } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PhishGuardLogo } from '@/components/phishguard-logo';

// Re-define the type here to avoid importing from the server-only flow file.
type AnalyzeUrlOutput = {
    riskLevel: number;
    reason: string;
    impersonatedBrand?: string;
    recommendation: string;
};

type ScanResultWithUrl = AnalyzeUrlOutput & { url: string };

function ResultCard({ result, onProceed }: { result: ScanResultWithUrl; onProceed: () => void }) {
    const { riskLevel, reason, url, impersonatedBrand, recommendation } = result;

    let status: 'Suspicious' | 'Dangerous';
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
    } else {
        status = 'Suspicious';
        colorClass = 'text-yellow-500';
        Icon = ShieldAlert;
        progressClass = '[&>div]:bg-yellow-500';
        badgeClass = 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500';
    }


    return (
        <Card className="w-full max-w-2xl animate-in fade-in-0 zoom-in-95">
            <CardHeader>
                <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                    <Icon className={cn("h-12 w-12 shrink-0", colorClass)} />
                    <div className='w-full'>
                        <CardTitle className={cn("text-2xl", colorClass)}>{status} Link Detected</CardTitle>
                        <CardDescription>PhishGuard blocked navigation to the following URL:</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-md overflow-hidden border">
                    <ShieldAlert className="h-4 w-4 shrink-0"/>
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

                 <div className="pt-4 border-t text-center">
                    <p className="text-sm text-center font-medium mb-3">Are you sure you want to proceed?</p>
                    <p className="text-xs text-muted-foreground mb-4">Accessing this page is not recommended and may put your security at risk.</p>
                     <Button variant="destructive" onClick={onProceed}>
                        Proceed to Site Anyway
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}


function LoadingState() {
    return (
         <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-2xl font-semibold">Analyzing...</h2>
            <p className="text-muted-foreground max-w-md">PhishGuard is scanning the link to ensure your safety. Please wait a moment.</p>
        </div>
    )
}

function ErrorState({ message, onRetry }: { message: string, onRetry: () => void }) {
    const router = useRouter();
    return (
         <div className="flex flex-col items-center gap-4 text-center">
            <ShieldX className="h-12 w-12 text-destructive" />
            <h2 className="text-2xl font-semibold">Scan Failed</h2>
            <p className="text-muted-foreground max-w-md">{message}</p>
            <div className='flex gap-2 mt-4'>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
                 <Button onClick={onRetry}>
                    Retry Scan
                </Button>
            </div>
        </div>
    )
}

export default function ShieldPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [result, setResult] = useState<ScanResultWithUrl | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const urlToScan = searchParams.get('url');

    const runScan = async () => {
        if (!urlToScan || !urlToScan.startsWith('http')) {
            setIsLoading(false);
            setError("Invalid URL provided.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: urlToScan }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'An unexpected error occurred.');
            }
            setResult({ ...data, url: urlToScan });
        } catch (err: any) {
            console.error("Scan failed:", err);
            setError(err.message || 'Failed to analyze the URL.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        runScan();
    }, [urlToScan]);

    const handleProceed = () => {
        if(urlToScan) {
            const shieldedUrl = new URL(urlToScan);
            shieldedUrl.searchParams.set('phishguard-override', 'true');
            window.location.href = shieldedUrl.toString();
        }
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <header className="my-12 text-center">
            <PhishGuardLogo />
        </header>

        {isLoading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={runScan} />}
        {result && <ResultCard result={result} onProceed={handleProceed} />}
      
        <footer className="mt-12 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PhishGuard. Your AI-powered shield against phishing.</p>
        </footer>
    </div>
  );
}
