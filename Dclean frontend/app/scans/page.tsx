'use client';

import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Shield, 
  AlertTriangle, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  User,
  Zap,
  CheckCircle2,
  Plus,
  X,
  Settings,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const identityFields = [
  { label: 'Full Name', value: 'name', icon: User, description: 'Search for your full name' },
  { label: 'Email Addresses', value: 'email', icon: Mail, description: 'Search for your email addresses' },
  { label: 'Phone Numbers', value: 'phone', icon: Phone, description: 'Search for your phone numbers' },
  { label: 'Physical Addresses', value: 'address', icon: MapPin, description: 'Search for your addresses' },
  { label: 'Username Aliases', value: 'username', icon: User, description: 'Search for usernames you use' },
  { label: 'Date of Birth', value: 'dob', icon: User, description: 'Search using your date of birth' },
];

const riskColors = {
  low: 'bg-success text-success-foreground',
  medium: 'bg-warning text-warning-foreground',
  high: 'bg-destructive text-destructive-foreground',
  critical: 'bg-destructive text-destructive-foreground',
};

const riskColorsBorder = {
  low: 'border-success/30',
  medium: 'border-warning/30',
  high: 'border-destructive/30',
  critical: 'border-destructive/30',
};

export default function ScansPage() {
  // Sources
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);

  // Identity fields
  const [selectedFields, setSelectedFields] = useState<string[]>(['name', 'email']);
  const [aliases, setAliases] = useState<string[]>([]);
  const [aliasInput, setAliasInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [phones, setPhones] = useState<string[]>([]);
  const [phoneInput, setPhoneInput] = useState('');
  const [fullNames, setFullNames] = useState<string[]>([]);
  const [nameInput, setNameInput] = useState('');

  // Scan settings
  const [scanType, setScanType] = useState<'quick' | 'full' | 'custom'>('full');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScan, setCurrentScan] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Fetch sources
  const fetchSources = useCallback(async () => {
    try {
      setSourcesLoading(true);
      const response = await apiClient.listSources({ page_size: 100 });
      setSources(response.results || []);
    } catch (err) {
      console.error('Failed to fetch sources:', err);
      // Set empty array if fetch fails
      setSources([]);
    } finally {
      setSourcesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const toggleSource = (id: string) => {
    setSelectedSources(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedSources(sources.map(s => s.id));
  };

  const deselectAll = () => {
    setSelectedSources([]);
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const addAlias = () => {
    const trimmed = aliasInput.trim();
    if (trimmed && !aliases.includes(trimmed)) {
      setAliases([...aliases, trimmed]);
      setAliasInput('');
    }
  };

  const removeAlias = (alias: string) => {
    setAliases(aliases.filter(a => a !== alias));
  };

  const addEmail = () => {
    const trimmed = emailInput.trim();
    if (trimmed && !emails.includes(trimmed)) {
      setEmails([...emails, trimmed]);
      setEmailInput('');
    }
  };

  const removeEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
  };

  const addPhone = () => {
    const trimmed = phoneInput.trim();
    if (trimmed && !phones.includes(trimmed)) {
      setPhones([...phones, trimmed]);
      setPhoneInput('');
    }
  };

  const removePhone = (phone: string) => {
    setPhones(phones.filter(p => p !== phone));
  };

  const addName = () => {
    const trimmed = nameInput.trim();
    if (trimmed && !fullNames.includes(trimmed)) {
      setFullNames([...fullNames, trimmed]);
      setNameInput('');
    }
  };

  const removeName = (name: string) => {
    setFullNames(fullNames.filter(n => n !== name));
  };

  const startScan = async () => {
    if (selectedSources.length === 0) {
      setScanError('Please select at least one data source');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setScanError(null);

    try {
      // Build the scan payload
      const scanPayload: any = {
        source_ids: selectedSources,
        scan_type: scanType,
      };

      // Include identity data if any fields are selected
      if (selectedFields.length > 0) {
        scanPayload.identity_data = {
          fields: selectedFields,
          ...(fullNames.length > 0 && { full_names: fullNames }),
          ...(aliases.length > 0 && { aliases }),
          ...(emails.length > 0 && { emails }),
          ...(phones.length > 0 && { phones }),
        };
      }

      // Call the API to start scan
      const scan = await apiClient.createScan(scanPayload);
      setCurrentScan(scan);

      // Poll for scan progress
      const pollInterval = setInterval(async () => {
        try {
          const updatedScan = await apiClient.getScan(scan.id);
          setScanProgress(updatedScan.progress || 0);
          
          if (updatedScan.status === 'completed' || updatedScan.status === 'failed') {
            clearInterval(pollInterval);
            setIsScanning(false);
            setCurrentScan(updatedScan);
          }
        } catch (err) {
          console.error('Failed to poll scan status:', err);
        }
      }, 2000);

    } catch (err: any) {
      console.error('Failed to start scan:', err);
      setScanError(err.message || 'Failed to start scan. Please try again.');
      setIsScanning(false);
    }
  };

  return (
    <MainLayout
      pageTitle="Scans"
      pageSubtitle="Discover your personal data across the web"
    >
      <div className="space-y-8">
        {/* Scan Configuration */}
        <Tabs defaultValue="sources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="identity">Identity Fields</TabsTrigger>
            <TabsTrigger value="settings">Scan Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="sources">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Select Data Sources</CardTitle>
                    <CardDescription className="mt-1">
                      Choose which sites to scan for your personal information ({sources.length} available)
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll} disabled={sourcesLoading}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAll}>
                      Deselect All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sourcesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-3 text-muted-foreground">Loading data sources...</p>
                  </div>
                ) : sources.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Data Sources Available</h3>
                    <p className="text-muted-foreground">
                      Contact your administrator to add data sources.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sources.map((source) => {
                      const isSelected = selectedSources.includes(source.id);
                      const riskLevel = source.risk_level?.toLowerCase() || 'medium';
                      
                      return (
                        <Card
                          key={source.id}
                          className={cn(
                            'cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
                            isSelected
                              ? cn('border-2', riskColorsBorder[riskLevel as keyof typeof riskColorsBorder])
                              : 'border-border/50 hover:border-primary/30'
                          )}
                          onClick={() => toggleSource(source.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Checkbox checked={isSelected} />
                                <div className={cn(
                                  'p-2 rounded-lg',
                                  isSelected
                                    ? cn('bg-gradient-to-br', riskLevel === 'high' || riskLevel === 'critical' ? 'from-destructive to-red-400' : riskLevel === 'medium' ? 'from-warning to-amber-400' : 'from-success to-emerald-400')
                                    : 'bg-muted'
                                )}>
                                  <Globe className={cn(
                                    'h-5 w-5',
                                    isSelected ? 'text-white' : 'text-muted-foreground'
                                  )} />
                                </div>
                              </div>
                              <Badge className={cn('text-xs', riskColors[riskLevel as keyof typeof riskColors])}>
                                {riskLevel} risk
                              </Badge>
                            </div>
                            <h3 className="font-semibold mb-1">{source.name}</h3>
                            <p className="text-xs text-muted-foreground">{source.domain || source.url}</p>
                            {source.description && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{source.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="identity">
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl">Identity Fields</CardTitle>
                  <CardDescription>
                    Select which personal information to search for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {identityFields.map((field) => {
                      const Icon = field.icon;
                      const isChecked = selectedFields.includes(field.value);
                      
                      return (
                        <Card
                          key={field.value}
                          className={cn(
                            'transition-all duration-300',
                            isChecked
                              ? 'border-primary/30 bg-gradient-to-r from-primary/5 to-transparent'
                              : 'border-border/50'
                          )}
                        >
                          <CardContent className="flex items-start gap-4 p-4">
                            <Checkbox 
                              checked={isChecked}
                              onCheckedChange={() => toggleField(field.value)}
                              className="mt-1"
                            />
                            <div className={cn(
                              'p-3 rounded-xl',
                              isChecked
                                ? 'bg-gradient-to-br from-primary to-secondary'
                                : 'bg-muted'
                            )}>
                              <Icon className={cn(
                                'h-5 w-5',
                                isChecked ? 'text-white' : 'text-muted-foreground'
                              )} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{field.label}</p>
                              <p className="text-xs text-muted-foreground">{field.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Dynamic Input Fields based on selected identity fields */}
              {selectedFields.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl">Enter Your Information</CardTitle>
                    <CardDescription>
                      Provide the specific details for the fields you selected
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Full Names */}
                    {selectedFields.includes('name') && (
                      <div className="space-y-3">
                        <Label>Full Names to Search</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., John Doe"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addName())}
                          />
                          <Button onClick={addName} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {fullNames.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {fullNames.map((name) => (
                              <Badge key={name} variant="secondary" className="gap-2">
                                {name}
                                <button onClick={() => removeName(name)} className="hover:text-destructive">
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Aliases */}
                    {selectedFields.includes('username') && (
                      <div className="space-y-3">
                        <Label>Username Aliases</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., johndoe123"
                            value={aliasInput}
                            onChange={(e) => setAliasInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAlias())}
                          />
                          <Button onClick={addAlias} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {aliases.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {aliases.map((alias) => (
                              <Badge key={alias} variant="secondary" className="gap-2">
                                {alias}
                                <button onClick={() => removeAlias(alias)} className="hover:text-destructive">
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Emails */}
                    {selectedFields.includes('email') && (
                      <div className="space-y-3">
                        <Label>Email Addresses</Label>
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="e.g., john@example.com"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                          />
                          <Button onClick={addEmail} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {emails.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {emails.map((email) => (
                              <Badge key={email} variant="secondary" className="gap-2">
                                {email}
                                <button onClick={() => removeEmail(email)} className="hover:text-destructive">
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Phones */}
                    {selectedFields.includes('phone') && (
                      <div className="space-y-3">
                        <Label>Phone Numbers</Label>
                        <div className="flex gap-2">
                          <Input
                            type="tel"
                            placeholder="e.g., +1 (555) 123-4567"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhone())}
                          />
                          <Button onClick={addPhone} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {phones.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {phones.map((phone) => (
                              <Badge key={phone} variant="secondary" className="gap-2">
                                {phone}
                                <button onClick={() => removePhone(phone)} className="hover:text-destructive">
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Scan Settings</CardTitle>
                <CardDescription>
                  Configure your scan type and options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        type: 'quick' as const,
                        label: 'Quick Scan',
                        description: 'Top 10 high-risk sources',
                        time: '~5 minutes',
                        gradient: 'from-primary to-cyan-400',
                      },
                      {
                        type: 'full' as const,
                        label: 'Full Scan',
                        description: 'All available sources',
                        time: '~15 minutes',
                        gradient: 'from-secondary to-purple-400',
                      },
                      {
                        type: 'custom' as const,
                        label: 'Custom Scan',
                        description: 'Select specific sources',
                        time: 'Varies',
                        gradient: 'from-accent to-pink-400',
                      },
                    ].map((option) => (
                      <Card
                        key={option.type}
                        className={cn(
                          'cursor-pointer transition-all duration-300 hover:shadow-lg',
                          scanType === option.type
                            ? 'border-primary shadow-lg'
                            : 'border-border/50'
                        )}
                        onClick={() => setScanType(option.type)}
                      >
                        <CardContent className="p-6 text-center">
                          <div className={cn(
                            'w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center',
                            option.gradient
                          )}>
                            <Zap className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="font-bold mb-2">{option.label}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                          <p className="text-xs text-muted-foreground">{option.time}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Separator />

                  {/* Advanced Options */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Advanced Options</h3>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">Include Deep Web Sources</p>
                        <p className="text-sm text-muted-foreground">Scan less common data brokers</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">Historical Data Search</p>
                        <p className="text-sm text-muted-foreground">Look for archived versions of your data</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">Auto-submit Removals</p>
                        <p className="text-sm text-muted-foreground">Automatically request removal for high-risk matches</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Scan Progress */}
        {isScanning && (
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary animate-pulse">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Scan in Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Scanning {selectedSources.length} sources...
                    </p>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  {scanProgress}%
                </Badge>
              </div>
              <Progress value={scanProgress} className="h-3 mb-4" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {scanProgress < 30 ? 'Initializing scan...' :
                   scanProgress < 60 ? 'Searching data brokers...' :
                   scanProgress < 90 ? 'Analyzing results...' :
                   'Finalizing scan...'}
                </span>
                {scanProgress === 100 && <CheckCircle2 className="h-4 w-4 text-success" />}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {scanError && (
          <Card className="border-destructive/30">
            <CardContent className="p-6">
              <p className="text-destructive">{scanError}</p>
            </CardContent>
          </Card>
        )}

        {/* Start Scan Button */}
        {!isScanning && (
          <div className="flex justify-center">
            <Button
              size="lg"
              className="px-12 py-6 text-lg bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              onClick={startScan}
              disabled={selectedSources.length === 0}
            >
              <Play className="h-5 w-5 mr-2" />
              Start Scan ({selectedSources.length} sources)
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
