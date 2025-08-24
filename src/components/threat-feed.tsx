
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface Threat {
  url: string;
  riskLevel: number;
  timestamp: string;
}

function ThreatItem({ threat }: { threat: Threat }) {
    const timeAgo = formatDistanceToNow(new Date(threat.timestamp), { addSuffix: true });
    
    const badgeClass = threat.riskLevel > 85 
        ? 'border-destructive/50 bg-destructive/10 text-destructive' 
        : 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500';

    return (
        <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <div className="flex-grow">
                    <p className="font-mono text-sm truncate max-w-[200px] sm:max-w-md md:max-w-lg">
                        {threat.url}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {timeAgo}
                    </p>
                </div>
            </div>
             <Badge variant="outline" className={cn('font-semibold text-xs', badgeClass)}>
                {threat.riskLevel}
            </Badge>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3 w-full">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                    </div>
                    <Skeleton className="h-5 w-10 rounded-full" />
                </div>
            ))}
        </div>
    )
}

export function ThreatFeed() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'threats'), orderBy('timestamp', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const threatsData: Threat[] = [];
      querySnapshot.forEach((doc) => {
        threatsData.push(doc.data() as Threat);
      });
      setThreats(threatsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching real-time threats:", error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Card className="w-full mt-8 border-none shadow-none">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl">Real-time Threat Feed</CardTitle>
            <CardDescription>
                Live feed of dangerous URLs being detected by PhishGuard.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2 border rounded-lg p-2">
                {loading && <LoadingSkeleton />}
                {!loading && threats.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                        <p>No recent threats detected.</p>
                        <p className="text-sm">The feed will update automatically.</p>
                    </div>
                )}
                {!loading && threats.map((threat, index) => (
                    <ThreatItem key={`${threat.url}-${index}`} threat={threat} />
                ))}
            </div>
        </CardContent>
    </Card>
  );
}
