'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Shield } from 'lucide-react';

const data = [
  { month: 'Jan', found: 45, removed: 38 },
  { month: 'Feb', found: 52, removed: 47 },
  { month: 'Mar', found: 38, removed: 35 },
  { month: 'Apr', found: 61, removed: 55 },
  { month: 'May', found: 48, removed: 44 },
  { month: 'Jun', found: 55, removed: 50 },
];

export function RiskChart() {
  return (
    <Card className="border-border/50 hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Privacy Score Trend</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Matches found vs removed over time</p>
          </div>
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Shield className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend />
            <Bar 
              dataKey="found" 
              fill="url(#colorFound)" 
              radius={[8, 8, 0, 0]}
              name="Matches Found"
            />
            <Bar 
              dataKey="removed" 
              fill="url(#colorRemoved)" 
              radius={[8, 8, 0, 0]}
              name="Data Removed"
            />
            <defs>
              <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="colorRemoved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
