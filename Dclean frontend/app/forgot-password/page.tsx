'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Integrate with Django backend
      // const response = await api.forgotPassword(email);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      {/* Card */}
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-3 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-xl animate-pulse-glow">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold">
            {submitted ? 'Check Your Email' : 'Forgot Password?'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {submitted
              ? "We've sent you a password reset link"
              : "No worries, we'll send you reset instructions"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {submitted ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-success" />
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center">
                <p className="text-sm font-medium text-success mb-1">Reset Email Sent!</p>
                <p className="text-xs text-muted-foreground">
                  Check your inbox at <strong>{email}</strong>
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSubmitted(false)}
                >
                  Resend Email
                </Button>
                
                <Button
                  className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90"
                  asChild
                >
                  <Link href="/login">
                    Back to Login
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive text-center">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-muted/50"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the email address associated with your account
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              {/* Back to Login */}
              <Button
                variant="ghost"
                className="w-full"
                asChild
              >
                <Link href="/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
              </Button>

              {/* Help Text */}
              <p className="text-xs text-center text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
