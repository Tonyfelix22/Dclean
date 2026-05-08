'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Moon, Sun, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'U'
    : '?';

  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim() || user.email
    : 'Loading…';

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Title Section */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search anything..."
                className="pl-10 bg-muted/50 border-border focus:bg-background transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative"
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative" asChild aria-label="Notifications">
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User avatar dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="user-menu-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-muted/50 transition-colors"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8 border-2 border-primary/30">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform duration-200',
                  dropdownOpen && 'rotate-180'
                )} />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <p className="text-sm font-semibold truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email ?? ''}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Profile & Settings
                    </Link>
                    <Link
                      href="/notifications"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      Notifications
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto text-xs h-5 px-1.5">{unreadCount > 99 ? '99+' : unreadCount}</Badge>
                      )}
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Account Settings
                    </Link>
                  </div>

                  <div className="border-t border-border/50 py-1">
                    <button
                      id="header-logout-btn"
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
