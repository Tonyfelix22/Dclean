'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Bell,
  Shield,
  Palette,
  Mail,
  Phone,
  MapPin,
  Camera,
  Lock,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Globe,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, USA',
    avatar: '/placeholder-user.jpg',
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark' as 'light' | 'dark' | 'system',
    emailNotifications: true,
    twoFactorAuth: false,
    dataSharing: false,
    analyticsTracking: true,
  });

  return (
    <MainLayout
      pageTitle="Settings"
      pageSubtitle="Manage your account and preferences"
    >
      <div className="space-y-6">
        {/* Profile Overview */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary p-1">
                  <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 rounded-lg bg-primary hover:bg-primary/80 transition-colors shadow-lg">
                  <Camera className="h-4 w-4 text-white" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold">{profile.name}</h3>
                  <Badge className="bg-success text-success-foreground">Verified</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{profile.email}</p>
                <p className="text-sm text-muted-foreground">{profile.phone}</p>
                
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    Edit Profile
                  </Button>
                  <Button size="sm" variant="outline">
                    Change Avatar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Identity Verification
                  </CardTitle>
                  <CardDescription>Verify your identity for enhanced features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 rounded-xl bg-gradient-to-r from-success/10 to-success/5 border border-success/20 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="h-6 w-6 text-success" />
                      <div>
                        <p className="font-semibold">Identity Verified</p>
                        <p className="text-sm text-muted-foreground">All verification checks passed</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Email Verified</span>
                        <CheckCircle className="h-4 w-4 text-success" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Phone Verified</span>
                        <CheckCircle className="h-4 w-4 text-success" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">ID Document Verified</span>
                        <CheckCircle className="h-4 w-4 text-success" />
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    Update Verification Documents
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Password
                  </CardTitle>
                  <CardDescription>Change your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        className="bg-muted/50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className="bg-muted/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      className="bg-muted/50"
                    />
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    Update Password
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>Add an extra layer of security</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">2FA Status</p>
                        <p className="text-sm text-muted-foreground">
                          {preferences.twoFactorAuth ? 'Enabled' : 'Not enabled'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.twoFactorAuth}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, twoFactorAuth: checked })
                      }
                    />
                  </div>
                  
                  {!preferences.twoFactorAuth && (
                    <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-warning">Enable 2FA for Better Security</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Two-factor authentication helps protect your account from unauthorized access
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setPreferences({ ...preferences, twoFactorAuth: !preferences.twoFactorAuth })}
                  >
                    {preferences.twoFactorAuth ? 'Disable 2FA' : 'Enable 2FA'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Control how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive alerts via email', icon: Mail },
                  { key: 'inAppNotifications', label: 'In-App Notifications', desc: 'Show alerts in dashboard', icon: Bell },
                  { key: 'scanAlerts', label: 'Scan Complete Alerts', desc: 'Notify when scans finish', icon: Shield },
                  { key: 'removalUpdates', label: 'Removal Updates', desc: 'Track removal request status', icon: Shield },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences[item.key as keyof typeof preferences] || true}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, [item.key]: checked })
                        }
                      />
                    </div>
                  );
                })}
                
                <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize how Dclean looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', icon: Sun, label: 'Light' },
                        { value: 'dark', icon: Moon, label: 'Dark' },
                        { value: 'system', icon: Monitor, label: 'System' },
                      ].map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <button
                            key={theme.value}
                            onClick={() => setPreferences({ ...preferences, theme: theme.value as any })}
                            className={cn(
                              'p-4 rounded-xl border-2 transition-all',
                              preferences.theme === theme.value
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-muted/30 hover:border-primary/30'
                            )}
                          >
                            <Icon className={cn(
                              'h-6 w-6 mx-auto mb-2',
                              preferences.theme === theme.value ? 'text-primary' : 'text-muted-foreground'
                            )} />
                            <p className={cn(
                              'text-sm font-medium',
                              preferences.theme === theme.value ? 'text-primary' : 'text-muted-foreground'
                            )}>
                              {theme.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Privacy & Data
                  </CardTitle>
                  <CardDescription>Manage your data preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">Data Sharing</p>
                      <p className="text-sm text-muted-foreground">Allow anonymous usage data collection</p>
                    </div>
                    <Switch
                      checked={preferences.dataSharing}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, dataSharing: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">Analytics Tracking</p>
                      <p className="text-sm text-muted-foreground">Help improve Dclean with anonymous analytics</p>
                    </div>
                    <Switch
                      checked={preferences.analyticsTracking}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, analyticsTracking: checked })
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <Button variant="destructive" className="w-full">
                    Delete All My Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
