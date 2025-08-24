
"use client";

import * as React from "react"
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";
import { PhishGuardLogo } from "@/components/phishguard-logo";
import { Separator } from "@/components/ui/separator";

function GoogleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M21.35 11.1H12.18v2.8h4.94c-.2 1.5-1.7 3.4-4.94 3.4-3 0-5.4-2.4-5.4-5.4s2.4-5.4 5.4-5.4c1.4 0 2.5.6 3.1 1.2l2.2-2.2C16.9 3.2 14.7 2 12.18 2c-5.4 0-9.8 4.4-9.8 9.8s4.4 9.8 9.8 9.8c5.2 0 9.2-3.4 9.2-9.4c0-.6-.1-1.2-.25-1.7z"></path>
        </svg>
    )
}

export default function LoginPage() {
    const [loginEmail, setLoginEmail] = React.useState('');
    const [loginPassword, setLoginPassword] = React.useState('');
    const [signupEmail, setSignupEmail] = React.useState('');
    const [signupPassword, setSignupPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [googleLoading, setGoogleLoading] = React.useState(false);

    const { login, signup, loginWithGoogle } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login({ email: loginEmail, password: loginPassword });
            toast({ title: "Login Successful", description: "Welcome back!" });
            router.push('/');
        } catch (error) {
            console.error("Login failed:", error);
            const firebaseError = error as FirebaseError;
            toast({ variant: 'destructive', title: "Login Failed", description: firebaseError.message });
        } finally {
            setLoading(false);
        }
    }
    
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signup({ email: signupEmail, password: signupPassword });
            toast({ title: "Signup Successful", description: "Welcome to PhishGuard!" });
            router.push('/');
        } catch (error) {
            console.error("Signup failed:", error);
            const firebaseError = error as FirebaseError;
            toast({ variant: 'destructive', title: "Signup Failed", description: firebaseError.message });
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            await loginWithGoogle();
            toast({ title: "Login Successful", description: "Welcome!" });
            router.push('/');
        } catch (error) {
            console.error("Google Login failed:", error);
            const firebaseError = error as FirebaseError;
            toast({ variant: 'destructive', title: "Google Login Failed", description: firebaseError.message });
        } finally {
            setGoogleLoading(false);
        }
    }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
      <div className="mb-8 text-center">
        <PhishGuardLogo />
        <p className="mt-4 text-lg text-muted-foreground">Sign in or create an account to continue.</p>
      </div>
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <form onSubmit={handleLogin}>
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full" onClick={handleGoogleLogin} type="button" disabled={googleLoading}>
                    {googleLoading ? 'Signing in...' : <><GoogleIcon /> Sign in with Google</>}
                </Button>
                <div className="flex items-center gap-4">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="m@example.com" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login with Email'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={handleSignup}>
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create a new account to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="m@example.com" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" required value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                 <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
