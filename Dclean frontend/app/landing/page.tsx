'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Shield, Search, Zap, Lock, Eye, Globe, CheckCircle2,
  ArrowRight, Star, ChevronDown, Radar, Trash2, Bell,
  Users, TrendingDown, Award, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

// ─── Animated counter hook ───────────────────────────────────────────────────
function useCountUp(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// ─── Stat card with animated counter ────────────────────────────────────────
function StatCard({ value, suffix, label, color, animate }: {
  value: number; suffix: string; label: string; color: string; animate: boolean;
}) {
  const count = useCountUp(value, 2000, animate);
  return (
    <div className="text-center group">
      <div className={`text-4xl md:text-5xl font-black ${color} transition-transform group-hover:scale-110`}>
        {animate ? count : 0}{suffix}
      </div>
      <p className="text-muted-foreground mt-2 text-sm font-medium">{label}</p>
    </div>
  );
}

// ─── Feature card ────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, gradient, delay }: {
  icon: any; title: string; desc: string; gradient: string; delay: string;
}) {
  return (
    <div
      className="group relative p-6 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
      style={{ animationDelay: delay }}
    >
      {/* Glow on hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4 shadow-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-bold mb-2 group-hover:gradient-text transition-all">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Pricing card ────────────────────────────────────────────────────────────
function PricingCard({ name, price, period, features, highlighted, cta }: {
  name: string; price: string; period: string; features: string[];
  highlighted?: boolean; cta: string;
}) {
  return (
    <div className={`relative flex flex-col rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2 ${
      highlighted
        ? 'border-primary bg-gradient-to-b from-primary/10 to-secondary/5 shadow-2xl shadow-primary/20'
        : 'border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/30'
    }`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
            MOST POPULAR
          </span>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-1">{name}</h3>
        <div className="flex items-baseline gap-1 mt-3">
          <span className="text-4xl font-black gradient-text">{price}</span>
          <span className="text-muted-foreground text-sm">{period}</span>
        </div>
      </div>
      <ul className="space-y-3 flex-1 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">{f}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        className={highlighted
          ? 'w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all'
          : 'w-full'}
        variant={highlighted ? 'default' : 'outline'}
      >
        <Link href="/signup">{cta}</Link>
      </Button>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Nav scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Intersection observer for stats counter
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: Radar, title: 'Deep Web Scanning', desc: 'Scan 500+ data brokers, people-search sites and dark web sources to find exactly where your data lives.', gradient: 'from-primary to-cyan-400', delay: '0ms' },
    { icon: Trash2, title: 'Automated Removals', desc: 'We handle the entire opt-out process — submitting requests, following up and confirming deletions.', gradient: 'from-secondary to-purple-400', delay: '100ms' },
    { icon: Bell, title: 'Real-Time Monitoring', desc: '24/7 alerting the moment your data reappears anywhere on the web, so you stay protected long-term.', gradient: 'from-accent to-pink-400', delay: '200ms' },
    { icon: Lock, title: 'End-to-End Encryption', desc: 'Your personal information is always encrypted in transit and at rest using AES-256 and TLS 1.3.', gradient: 'from-emerald-500 to-teal-400', delay: '300ms' },
    { icon: Globe, title: 'Global Coverage', desc: 'Coverage across GDPR (EU), CCPA (California) and global privacy regulations in 40+ countries.', gradient: 'from-amber-500 to-orange-400', delay: '400ms' },
    { icon: Zap, title: 'Instant Reports', desc: 'Get a fully detailed privacy risk score and actionable report within minutes of your first scan.', gradient: 'from-violet-500 to-indigo-400', delay: '500ms' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Account', desc: 'Sign up for free and enter your basic info. We keep everything encrypted and secure.', icon: Users },
    { num: '02', title: 'Run a Privacy Scan', desc: 'Our bots scan 500+ data brokers simultaneously and map every location your data appears.', icon: Search },
    { num: '03', title: 'Review Your Exposure', desc: 'Get a detailed risk report showing exactly what data is exposed and where it was found.', icon: Eye },
    { num: '04', title: 'We Remove It For You', desc: 'Sit back while our system automatically sends removal requests and tracks every response.', icon: TrendingDown },
  ];

  const testimonials = [
    { name: 'Sarah Mitchell', role: 'Privacy Advocate', avatar: 'SM', quote: 'Dclean helped me remove my data from 54 broker sites in under a week. I finally feel in control.' },
    { name: 'James Kato', role: 'Software Engineer', avatar: 'JK', quote: 'The automated monitoring caught my info re-appearing on three sites. The alerts saved me hours of manual work.' },
    { name: 'Aisha Okonkwo', role: 'Freelance Writer', avatar: 'AO', quote: 'As someone who values privacy, Dclean is the only tool I trust to keep my personal data off the internet.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg animate-pulse-glow">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Dclean</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Pricing', 'About'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                <Link href="/">Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-sm">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-lg">
                  <Link href="/signup">Get Started Free</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-6 py-4 space-y-4">
            {['Features', 'How It Works', 'Pricing', 'About'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >{item}</a>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
              <Button asChild variant="outline"><Link href="/login">Sign In</Link></Button>
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-3xl animate-pulse-glow" />
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm text-primary mb-8 animate-float">
            <Star className="h-4 w-4 fill-primary" />
            <span className="font-medium">Trusted by 50,000+ privacy-conscious users</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Your Personal Data
            <br />
            <span className="gradient-text">Erased from the Web</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Dclean automatically finds and removes your personal information from data brokers,
            people-search sites, and privacy-violating databases — then monitors 24/7 to keep it gone.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="text-base px-8 py-6 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1"
            >
              <Link href="/signup">
                Start For Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base px-8 py-6 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all hover:-translate-y-1"
            >
              <Link href="/login">Sign In to Dashboard</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
            {['No credit card required', 'GDPR & CCPA compliant', 'Cancel anytime', '256-bit encryption'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                {t}
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-20 border-y border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <StatCard value={500} suffix="+" label="Data Brokers Covered" color="gradient-text" animate={statsVisible} />
            <StatCard value={99} suffix="%" label="Removal Success Rate" color="gradient-text" animate={statsVisible} />
            <StatCard value={50} suffix="K+" label="Users Protected" color="gradient-text" animate={statsVisible} />
            <StatCard value={3} suffix="M+" label="Records Removed" color="gradient-text" animate={statsVisible} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/30 bg-secondary/10 text-sm text-secondary mb-6">
              <Shield className="h-4 w-4" />
              <span>Everything you need</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Powerful Privacy <span className="gradient-text">Protection Tools</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              One platform. Everything you need to discover, remove, and monitor your personal data presence across the entire web.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Simple. Fast. <span className="gradient-text">Effective.</span>
            </h2>
            <p className="text-muted-foreground text-lg">Up and running in minutes. Fully automated from there.</p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary via-secondary to-accent opacity-30" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="relative text-center group">
                    <div className="relative inline-flex mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-card to-card border-2 border-border/50 group-hover:border-primary/50 flex items-center justify-center transition-all duration-300 shadow-xl group-hover:shadow-primary/20">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <span className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold flex items-center justify-center shadow-lg">
                        {step.num.slice(1)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Loved by <span className="gradient-text">Privacy Champions</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm italic leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Simple, <span className="gradient-text">Transparent Pricing</span>
            </h2>
            <p className="text-muted-foreground text-lg">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              name="Free" price="$0" period="/month"
              features={['1 privacy scan', '10 data broker checks', 'Basic risk report', 'Email alerts']}
              cta="Get Started Free"
            />
            <PricingCard
              name="Pro" price="$12" period="/month"
              features={['Unlimited scans', '500+ data brokers', 'Automated removals', 'Real-time monitoring', 'Priority support', 'GDPR/CCPA tools']}
              cta="Start Pro Trial"
              highlighted
            />
            <PricingCard
              name="Business" price="$49" period="/month"
              features={['Everything in Pro', 'Up to 10 users', 'Bulk scanning', 'Custom reports', 'API access', 'Dedicated success manager']}
              cta="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-12 text-center bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 border border-primary/20">
            {/* Decorative blobs */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/30 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-2xl mx-auto mb-6 animate-pulse-glow">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Ready to Reclaim <span className="gradient-text">Your Privacy?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Join 50,000+ users who've taken control of their digital footprint. Start your free scan today — no credit card needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="text-base px-8 py-6 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-2xl hover:-translate-y-1 transition-all"
                >
                  <Link href="/signup">
                    <Award className="h-5 w-5 mr-2" />
                    Start Free — No Credit Card
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base px-8 py-6 hover:-translate-y-1 transition-all">
                  <Link href="/login">I Already Have an Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/30 bg-card/30 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold gradient-text text-lg">Dclean</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              {['Privacy Policy', 'Terms of Service', 'Contact', 'Blog'].map((l) => (
                <a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">© 2026 Dclean. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
