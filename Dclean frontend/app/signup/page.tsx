'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function SignUpPage() {
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const passwordStrength = (): { score: number; label: string; color: string } => {
    const password = formData.password;
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'text-destructive' };
    if (score <= 4) return { score, label: 'Medium', color: 'text-warning' };
    return { score, label: 'Strong', color: 'text-success' };
  };

  const strength = passwordStrength();
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!passwordsMatch) {
      setSubmitError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setSubmitError('Password must be at least 8 characters long');
      return;
    }
    
    if (!agreeTerms) {
      setSubmitError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email: formData.email,
        username: formData.username,
        first_name: formData.name.trim().split(' ')[0] || '',
        last_name: formData.name.trim().split(' ').slice(1).join(' ') || '',
        password: formData.password,
        password2: formData.confirmPassword,
      });
    } catch (err: any) {
      // Error is automatically set by auth context and displayed on form
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="absolute top-0 -right-40 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      {/* Left Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-3 text-center">
            {/* Mobile Logo */}
            <div className="flex justify-center lg:hidden mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-xl">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Start protecting your online privacy today
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Message - Prominent Display */}
            {(submitError || error) && (
              <div className="p-5 rounded-xl bg-gradient-to-r from-destructive/15 to-destructive/5 border-2 border-destructive/30 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-destructive mb-2">Unable to Create Account</p>
                    <div className="space-y-2">
                      {(submitError || error)?.split('\n').map((msg, idx) => (
                        <p key={idx} className="text-sm text-destructive font-medium">• {msg}</p>
                      ))}
                    </div>
                    {error?.includes('already exists') && (
                      <div className="mt-4 pt-4 border-t border-destructive/20">
                        <Link href="/login" className="flex items-center gap-2 text-sm text-primary hover:underline font-semibold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          Already have an account? Sign in here
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 bg-muted/50"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-10 bg-muted/50"
                    required
                    disabled={submitting}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Choose a unique username (letters, numbers, underscores only)</p>
              </div>

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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-muted/50"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 bg-muted/50"
                    required
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    disabled={submitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password strength</span>
                      <span className={strength.color}>{strength.label}</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            level <= strength.score
                              ? strength.score <= 2
                                ? 'bg-destructive'
                                : strength.score <= 4
                                ? 'bg-warning'
                                : 'bg-success'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10 bg-muted/50"
                    required
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    disabled={submitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {formData.confirmPassword && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      {passwordsMatch ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  )}
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              <div className="space-y-4">
                {/* Terms and Conditions Checkbox - REQUIRED */}
                <label className="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md relative"
                  style={{
                    borderColor: agreeTerms ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    backgroundColor: agreeTerms ? 'hsl(var(--primary) / 0.05)' : 'transparent',
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5 relative" style={{ width: '1.5rem', height: '1.5rem' }}>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      disabled={submitting}
                      className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
                    />
                    {/* Checkbox box */}
                    <div 
                      className="w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all"
                      style={{
                        borderColor: agreeTerms ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                        backgroundColor: agreeTerms ? 'hsl(var(--primary))' : 'transparent',
                      }}
                    >
                      {agreeTerms && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1">
                      I have read and agree to the Terms and Conditions *
                    </p>
                    <p className="text-xs text-muted-foreground">
                      By checking this box, you confirm that you have read and agree to our{' '}
                      <Link href="/terms" className="text-primary hover:underline font-medium" target="_blank">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary hover:underline font-medium" target="_blank">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                </label>
                
                {/* Error message if not checked */}
                {!agreeTerms && submitError?.includes('agree') && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <svg className="w-4 h-4 text-destructive flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-destructive font-medium">
                      You must check the box to accept the Terms and Conditions before continuing
                    </p>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                disabled={submitting || loading}
              >
                {submitting || loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10">
        <div className="flex flex-col justify-center items-center w-full p-12">
          <div className="max-w-lg space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-2xl animate-pulse-glow">
                  <Shield className="h-12 w-12 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold gradient-text">Dclean</h1>
                <p className="text-lg text-muted-foreground">Privacy Protection Platform</p>
              </div>
            </div>

            {/* Benefits */}
            <h2 className="text-3xl font-bold mb-6">
              Take Control of Your Online Privacy
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
                <div className="p-3 rounded-xl bg-gradient-to-br from-success/20 to-success/10">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Free Privacy Scan</h3>
                  <p className="text-muted-foreground">
                    Get started with a free scan to see where your data is exposed across the internet.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Automated Removals</h3>
                  <p className="text-muted-foreground">
                    We handle the complicated removal process for you, contacting data brokers on your behalf.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
                <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ongoing Monitoring</h3>
                  <p className="text-muted-foreground">
                    Continuous monitoring ensures your data stays removed and alerts you if it reappears.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-xs text-muted-foreground mt-1">Data Brokers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">1M+</p>
                <p className="text-xs text-muted-foreground mt-1">Records Removed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">99%</p>
                <p className="text-xs text-muted-foreground mt-1">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
