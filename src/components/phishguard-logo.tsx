import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhishGuardLogoProps {
    size?: 'default' | 'sm';
}

export function PhishGuardLogo({ size = 'default' }: PhishGuardLogoProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", {
        'gap-2': size === 'default',
        'gap-1.5': size === 'sm',
    })}>
      <ShieldCheck className={cn("text-primary", {
        "h-10 w-10": size === 'default',
        "h-6 w-6": size === 'sm',
      })} />
      <span className={cn("font-bold tracking-tight text-primary", {
        "text-4xl": size === 'default',
        "text-xl": size === 'sm',
      })}>PhishGuard</span>
    </div>
  );
}
