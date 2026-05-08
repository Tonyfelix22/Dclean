'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import {
  LayoutDashboard,
  Search,
  Target,
  ShieldCheck,
  Activity,
  CreditCard,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  X,
  LogOut,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scans', label: 'Scans', icon: Search },
  { href: '/matches', label: 'Matches', icon: Target },
  { href: '/removals', label: 'Removals', icon: ShieldCheck },
  { href: '/monitoring', label: 'Monitoring', icon: Activity },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/landing', label: 'Landing Page', icon: Globe },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await apiClient.listNotifications({ unread_only: true, page_size: 1 });
        if (response && typeof response.count === 'number') {
          setUnreadCount(response.count);
        }
      } catch (err: any) {
        // Silently fail - notifications are not critical
        // Don't log expected auth errors to avoid console spam
        if (err?.code !== 'HTTP_401' && err?.details?.code !== 'token_expired') {
          console.warn('Failed to fetch unread count:', err);
        }
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'U'
    : '?';

  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim() || user.email
    : 'User';

  const userEmail = user?.email || '';

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-40 md:z-auto h-screen transition-all duration-300 ease-in-out',
          'bg-gradient-to-b from-card to-background border-r border-border',
          collapsed ? 'md:w-20' : 'md:w-64',
          mobileOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className={cn(
            'flex items-center gap-3 px-6 py-6 border-b border-border',
            collapsed && 'md:justify-center md:px-0'
          )}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg animate-pulse-glow">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold gradient-text">Dclean</h1>
                <span className="text-xs text-muted-foreground">Privacy Protection</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return collapsed ? (
                <TooltipProvider key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg'
                            : 'hover:bg-accent/10 text-muted-foreground hover:text-foreground'
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-foreground shadow-md border border-primary/20'
                      : 'hover:bg-accent/5 text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className={cn(
                    'h-5 w-5 transition-transform duration-200 group-hover:scale-110',
                    isActive && 'text-primary'
                  )} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="px-3 py-4 border-t border-border space-y-2">
            {/* Notifications */}
            <Link
              href="/notifications"
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-accent/5',
                collapsed && 'justify-center'
              )}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">{unreadCount > 99 ? '99+' : unreadCount}</Badge>
                  )}
                </>
              )}
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-accent/5',
                collapsed && 'justify-center'
              )}
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
              {!collapsed && <span className="text-sm">Settings</span>}
            </Link>

            {/* User Profile + Logout */}
            <div className={cn(
              'flex items-center gap-3 px-4 py-3 mt-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5',
              collapsed && 'justify-center'
            )}>
              <Avatar className="h-9 w-9 border-2 border-primary/30">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                  {user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'U' : '?'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user ? `${user.first_name} ${user.last_name}`.trim() || user.email : 'Loading...'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email ?? ''}</p>
                </div>
              )}
              {/* Logout Button */}
              <button
                id="logout-btn"
                onClick={() => logout()}
                title="Sign out"
                className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Collapse Toggle (Desktop Only) */}
          <button
            onClick={onToggle}
            className="hidden md:flex absolute -right-3 top-20 items-center justify-center w-6 h-6 rounded-full bg-card border-2 border-border shadow-md hover:bg-accent/10 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
