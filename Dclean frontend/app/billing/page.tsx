'use client';

import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard,
  Check,
  Star,
  Shield,
  Crown,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const planIcons: Record<string, any> = {
  free: Shield,
  basic: Shield,
  professional: Star,
  pro: Star,
  enterprise: Crown,
};

export default function BillingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [plansResponse, subscriptionResponse, invoicesResponse] = await Promise.all([
        apiClient.listPlans().catch(() => []),
        apiClient.getSubscription().catch(() => null),
        apiClient.listInvoices().catch(() => ({ results: [] })),
      ]);

      setPlans(plansResponse || []);
      setSubscription(subscriptionResponse);
      setInvoices(invoicesResponse.results || []);
    } catch (err) {
      console.error('Failed to fetch billing data:', err);
      setError('Failed to load billing information.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  if (loading) {
    return (
      <MainLayout pageTitle="Billing & Plans" pageSubtitle="Loading billing data...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading your billing information...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Default plans if API returns none
  const displayPlans = plans.length > 0 ? plans : [
    { id: 'free', name: 'Free', price: 0, interval: 'month', description: 'Basic privacy protection', features: ['5 scans/month', '10 matches', '3 removals'] },
    { id: 'basic', name: 'Basic', price: 9.99, interval: 'month', description: 'Essential privacy', features: ['25 scans/month', '100 matches', '25 removals'] },
    { id: 'pro', name: 'Professional', price: 29.99, interval: 'month', description: 'Complete protection', features: ['Unlimited scans', 'Unlimited matches', 'Unlimited removals'] },
    { id: 'enterprise', name: 'Enterprise', price: 99.99, interval: 'month', description: 'For businesses', features: ['Everything in Pro', 'Up to 10 profiles', 'Team management'] },
  ];

  const currentPlan = subscription?.plan_name || displayPlans.find(p => p.id === subscription?.plan)?.name || 'Free';
  const planPrice = subscription?.plan_name ? displayPlans.find(p => p.name === subscription.plan_name)?.price || 0 : 0;

  return (
    <MainLayout
      pageTitle="Billing & Plans"
      pageSubtitle="Manage your subscription and usage"
    >
      <div className="space-y-6">
        {error && (
          <Card className="border-destructive/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-destructive">{error}</p>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Plan Overview */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-secondary to-purple-400">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold">{currentPlan}</h3>
                    <Badge className={cn('bg-success text-success-foreground', subscription?.status === 'active' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground')}>
                      {subscription?.status || 'Active'}
                    </Badge>
                  </div>
                  {subscription?.current_period_end && (
                    <p className="text-sm text-muted-foreground mb-1">
                      Billing cycle ends: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    ${planPrice}<span className="text-lg text-muted-foreground">/month</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="plans">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans">Available Plans</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payment">Payment Method</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="mt-6">
            {/* Billing Period Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={cn(
                'text-sm font-medium',
                billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'
              )}>
                Monthly
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              >
                <div className={cn(
                  'w-10 h-5 rounded-full transition-colors',
                  billingPeriod === 'yearly' ? 'bg-primary' : 'bg-muted'
                )}>
                  <div className={cn(
                    'w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all',
                    billingPeriod === 'yearly' ? 'left-5' : 'left-0.5'
                  )} />
                </div>
              </Button>
              <span className={cn(
                'text-sm font-medium',
                billingPeriod === 'yearly' ? 'text-foreground' : 'text-muted-foreground'
              )}>
                Yearly <Badge className="ml-2 bg-success/10 text-success text-xs">Save 20%</Badge>
              </span>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayPlans.map((plan) => {
                const Icon = planIcons[plan.id?.toLowerCase()] || Shield;
                const displayPrice = billingPeriod === 'yearly' && plan.price > 0
                  ? `$${(plan.price * 12 * 0.8 / 12).toFixed(2)}/mo`
                  : plan.price === 0 
                    ? 'Free'
                    : `$${plan.price}/mo`;
                
                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      'relative border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2',
                      currentPlan === plan.name
                        ? 'border-primary shadow-xl'
                        : 'border-border/50'
                    )}
                  >
                    {plan.name === 'Professional' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-secondary to-purple-400 text-white px-3 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    {currentPlan === plan.name && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-primary to-cyan-400 text-white px-3 py-1">
                          Current Plan
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <p className="text-4xl font-bold">{displayPrice}</p>
                        {billingPeriod === 'yearly' && plan.price > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Billed ${(plan.price * 12 * 0.8).toFixed(2)}/year
                          </p>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {(plan.features || []).map((feature: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        className={cn(
                          'w-full',
                          currentPlan === plan.name
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
                        )}
                        disabled={currentPlan === plan.name}
                      >
                        {currentPlan === plan.name ? 'Current Plan' : 'Get Started'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-12 text-center">
                    <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">No Invoices Yet</h3>
                    <p className="text-muted-foreground">
                      Your billing history will appear here once you have invoices.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                invoices.map((invoice) => (
                  <Card key={invoice.id} className="border-border/50 hover:border-primary/30 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                            <DollarSign className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{invoice.subscription || 'Subscription'} Plan</h3>
                            <p className="text-sm text-muted-foreground">
                              {invoice.billing_period_start && invoice.billing_period_end
                                ? `${new Date(invoice.billing_period_start).toLocaleDateString()} - ${new Date(invoice.billing_period_end).toLocaleDateString()}`
                                : new Date(invoice.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold">${invoice.amount || '0.00'}</p>
                            <Badge className={cn('mt-1', 
                              invoice.status === 'paid' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                            )}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="payment" className="mt-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Update your credit card or payment information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-12 w-12 text-primary" />
                      <div>
                        <p className="font-semibold">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                      </div>
                    </div>
                    <Badge className="bg-success text-success-foreground">Default</Badge>
                  </div>
                </div>
                
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  Update Payment Method
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
