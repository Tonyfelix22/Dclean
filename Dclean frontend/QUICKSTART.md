# Dclean Frontend - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ and pnpm installed
- Your backend API URL (or use mock server for testing)

## Installation

```bash
# Install dependencies
pnpm install

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
EOF

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure at a Glance

```
app/                  # Pages (routes)
components/           # React components
lib/                  # API client and hooks
cypress/             # Tests
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `lib/api-client.ts` | All API calls go through here |
| `lib/api.types.ts` | TypeScript types for API responses |
| `lib/hooks.ts` | Custom hooks (useJobPolling, useRules, etc.) |
| `app/page.tsx` | Dashboard - main entry point |
| `components/layout/header.tsx` | Navigation |

## Main Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard with scan form |
| `/results` | View and select files to clean |
| `/clean` | Confirm deletion with safety checks |
| `/rules` | Create and manage rules |
| `/history` | View past scans and cleanups |
| `/settings` | User preferences |

## Common Tasks

### Add a New API Method

1. Add type in `lib/api.types.ts`
2. Add method in `lib/api-client.ts`
3. Create hook in `lib/hooks.ts` if needed
4. Use hook in component

```typescript
// 1. Type
export interface MyData {
  id: string;
  name: string;
}

// 2. API Client
async getMyData(): Promise<MyData> {
  return this.request<MyData>('GET', '/my-endpoint');
}

// 3. Hook
export function useMyData() {
  const [data, setData] = useState<MyData | null>(null);
  const fetch = useCallback(async () => {
    setData(await apiClient.getMyData());
  }, []);
  return { data, fetch };
}

// 4. Component
const { data, fetch } = useMyData();
```

### Create a New Page

1. Create `app/newpage/page.tsx`
2. Import Header component
3. Use custom hooks for data
4. Add route to header navigation

```typescript
'use client';

import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';

export default function NewPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Your content */}
      </main>
    </div>
  );
}
```

### Create a New Component

1. Create file in `components/feature/component.tsx`
2. Use `'use client'` directive if it has interactivity
3. Import shadcn/ui components as needed
4. Export the component

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function MyComponent() {
  return (
    <Card className="p-6">
      <Button>Click me</Button>
    </Card>
  );
}
```

## Testing Locally

### Without Backend

API calls will fail, but you can see the UI. Update `lib/api-client.ts` to return mock data:

```typescript
async startScan(request: ScanRequest): Promise<ScanJob> {
  // Mock data for testing
  return {
    id: 'test-job-' + Date.now(),
    status: 'completed',
    progress: 100,
    createdAt: new Date().toISOString(),
    filesFound: 42,
    directoriesScanned: 5,
    sizeFound: 1024 * 1024,
  };
}
```

### With Backend

1. Update `.env.local` with your backend URL
2. Ensure backend is running
3. Test an API endpoint with curl:

```bash
curl -X POST http://localhost:3001/api/scan/start \
  -H "Content-Type: application/json" \
  -d '{"ruleIds":[]}'
```

## Styling Guide

### Theme Colors

- Primary button: `bg-primary text-primary-foreground`
- Secondary: `bg-secondary text-secondary-foreground`
- Danger: `bg-destructive text-destructive-foreground`
- Muted: `text-muted-foreground`

### Spacing

- Use `gap-` for spacing between flex items
- Use `p-` for padding
- Use `my-`, `mx-` for margins
- Use `space-y-` for vertical stacks

```tsx
<div className="flex gap-4 p-6">
  <Card className="space-y-4">
    <h2>Title</h2>
    <p>Content</p>
  </Card>
</div>
```

### Common Patterns

**Grid Layout:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Items */}
</div>
```

**Error Message:**
```tsx
<div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
  <p className="text-sm text-destructive">Error message</p>
</div>
```

**Loading State:**
```tsx
<div className="flex items-center gap-2">
  <Spinner className="h-4 w-4" />
  <p>Loading...</p>
</div>
```

## Debugging

### Check Browser Console
Most errors will be logged here.

### Check Network Tab
View API requests and responses.

### TypeScript Errors
```bash
pnpm tsc --noEmit
```

### ESLint Errors
```bash
pnpm lint
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add `NEXT_PUBLIC_API_URL` environment variable
4. Deploy!

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
CMD ["pnpm", "start"]
```

### Manual

```bash
pnpm build
pnpm start
```

## Troubleshooting

**Styles not loading?**
- Check Tailwind CSS in `globals.css`
- Clear `.next` folder: `rm -rf .next`

**API calls failing?**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running
- Check CORS headers in browser DevTools

**Components not found?**
- Check import paths are absolute: `@/components/...`
- Verify file exists in correct location

**TypeScript errors?**
- Hover over error in editor for details
- Run `pnpm tsc --noEmit` to see all errors

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **Lucide Icons**: https://lucide.dev

## Getting Help

1. Check the browser console for error messages
2. Look at similar components for patterns
3. Review `API_INTEGRATION.md` for backend info
4. Check `IMPLEMENTATION_GUIDE.md` for architecture details

## Next Steps

1. Connect your backend API
2. Test the scan workflow
3. Create sample rules
4. Deploy to production
5. Monitor user feedback

Good luck! 🚀
