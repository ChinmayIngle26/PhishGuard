import { ShieldCheck } from 'lucide-react';

export function PhishGuardLogo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <ShieldCheck className="h-10 w-10 text-primary" />
      <span className="text-4xl font-bold tracking-tight text-primary">PhishGuard</span>
    </div>
  );
}
