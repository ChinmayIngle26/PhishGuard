
'use client';

import { useState } from 'react';
import { PhishGuardLogo } from '@/components/phishguard-logo';
import { UrlScanner } from '@/components/url-scanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Mail } from 'lucide-react';
import { EmailScanner } from '@/components/email-scanner';
import { ThreatFeed } from '@/components/threat-feed';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [activeTab, setActiveTab] = useState('url');

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <header className="my-12 text-center">
        <PhishGuardLogo />
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Your first line of defense against phishing. Use our AI-powered tools
          to scan URLs and analyze emails for threats in real-time.
        </p>
      </header>
      <div className="w-full max-w-2xl">
        <Tabs
          defaultValue="url"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">
              <Shield className="mr-2 h-4 w-4" />
              URL Scanner
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="mr-2 h-4 w-4" />
              Email Analyzer
            </TabsTrigger>
          </TabsList>
          <TabsContent value="url">
            <UrlScanner />
          </TabsContent>
          <TabsContent value="email">
            <EmailScanner />
          </TabsContent>
        </Tabs>
      </div>

      <div className="w-full max-w-4xl mt-16">
        <Separator />
        <ThreatFeed />
      </div>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} PhishGuard. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
