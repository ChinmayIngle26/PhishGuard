import { PhishGuardLogo } from '@/components/phishguard-logo';
import { UrlScanner } from '@/components/url-scanner';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <header className="my-12 text-center">
        <PhishGuardLogo />
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Your first line of defense against phishing attacks. Our AI-powered scanner helps you identify malicious links before you click.
        </p>
      </header>
      <div className="w-full">
        <UrlScanner />
      </div>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PhishGuard. All rights reserved.</p>
      </footer>
    </div>
  );
}
