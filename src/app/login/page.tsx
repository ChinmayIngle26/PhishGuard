
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

export default function LoginPage() {
    const [loginEmail, setLoginEmail] = React.useState('');
    const [loginPassword, setLoginPassword] = React.useState('');
    const [signupEmail, setSignupEmail] = React.useState('');
    const [signupPassword, setSignupPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const { login, signup } = useAuth();
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
                    {loading ? 'Logging in...' : 'Login'}
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
