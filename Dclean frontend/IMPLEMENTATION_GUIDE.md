# Dclean Frontend - Implementation Guide

## Overview

This is a fully-functional Next.js 16 frontend for Dclean, a file cleaning automation system. The application provides a professional interface for scanning, previewing, and safely removing files based on customizable rules.

## Architecture

### Frontend Structure

```
app/                          # Next.js App Router pages
├── page.tsx                  # Dashboard with scan form
├── results/page.tsx          # Scan results with filtering & selection
├── clean/page.tsx            # Clean confirmation workflow
├── clean-complete/page.tsx   # Completion status
├── rules/page.tsx            # Rules management (CRUD)
├── history/page.tsx          # Job history timeline
└── settings/page.tsx         # User preferences

components/                   # React components organized by feature
├── layout/
│   └── header.tsx            # Main navigation header
├── dashboard/
│   ├── scan-form.tsx         # Scan configuration
│   └── scan-status.tsx       # Progress tracking
├── results/
│   └── results-table.tsx     # Virtualized results table
├── clean/
│   └── clean-confirmation.tsx # Two-step confirmation
├── rules/
│   ├── rules-list.tsx        # Rule management UI
│   ├── rule-form.tsx         # Create/edit rules
│   └── rule-tester.tsx       # Pattern testing
├── history/
│   └── job-timeline.tsx      # Job history display
└── ui/                       # shadcn/ui components

lib/                          # Core utilities and hooks
├── api-client.ts            # Typed API client
├── api.types.ts             # TypeScript interfaces
├── hooks.ts                 # Custom React hooks
└── utils.ts                 # Helper functions

cypress/                      # E2E tests
├── e2e/
│   └── scan-workflow.cy.ts   # Test suite
└── support/
    └── e2e.ts               # Custom commands
```

## API Integration

### Setting the API Base URL

The API client is configured to use `NEXT_PUBLIC_API_URL` environment variable:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

If not set, it defaults to `http://localhost:3001/api`.

### API Endpoints Expected

The frontend expects these API endpoints:

```
POST   /scan/start                    - Start a scan job
GET    /scan/{jobId}                  - Get scan status
GET    /scan/{jobId}/results          - Get paginated results
POST   /scan/{jobId}/cancel           - Cancel scan

POST   /clean/start                   - Start cleaning job
GET    /clean/{jobId}                 - Get clean status

GET    /rules                         - List all rules
GET    /rules/{ruleId}                - Get single rule
POST   /rules                         - Create rule
PUT    /rules/{ruleId}                - Update rule
DELETE /rules/{ruleId}                - Delete rule
POST   /rules/test                    - Test rule pattern

GET    /history                       - Get job history
POST   /history/{jobId}/restore       - Restore from job

GET    /user                          - Get current user
PUT    /user/preferences              - Update preferences
```

### Response Types

All responses follow the TypeScript types defined in `lib/api.types.ts`:

- `ScanJob` - Scan status and progress
- `CleanJob` - Clean operation details
- `FileResult` - Individual file in scan results
- `CleaningRule` - Rule definition
- `JobHistory` - Historical job record
- `User` - User profile and preferences

## Key Features

### 1. Dashboard & Scanning
- Start new scan jobs with rule selection
- Real-time progress tracking with polling
- Display scan statistics (files found, size, directories)
- Cancel in-progress scans

### 2. Results Management
- Virtualized table handling 10k+ results efficiently
- Filter by risk level (low/medium/high)
- Sort by name, size, or risk level
- Paginated loading with server synchronization
- Bulk select for cleaning

### 3. Two-Step Clean Confirmation
- Risk assessment with colored indicators
- Safety warnings for high-risk files
- Type confirmation ("delete files") requirement
- Explicit checkbox acknowledgment
- No accidental deletions

### 4. Rules Management
- Create/edit/delete cleaning rules
- Pattern testing interface with instant feedback
- Rule statistics dashboard
- Risk level assignment
- Pattern type support (glob & regex)
- Match type options (name, extension, path)

### 5. Job History
- Timeline view of all scan/clean operations
- Quick restore from previous jobs
- Deletion from history
- Job statistics and metadata

### 6. Settings & Preferences
- Theme selection (light/dark/system)
- Auto-confirm for low-risk operations
- Advanced options toggle
- User account information

## Development Setup

### Install Dependencies

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Custom Hooks

### `useJobPolling(jobId, type)`
Polls job status every 2 seconds until completion.

```tsx
const { job, loading, error, cancel } = useJobPolling(jobId, 'scan');
```

### `useScanResults(jobId, pageSize)`
Fetches paginated scan results.

```tsx
const { results, loading, fetchResults } = useScanResults(jobId, 50);
fetchResults(skip); // Load next page
```

### `useRules()`
Manages rule CRUD operations.

```tsx
const { rules, createRule, updateRule, deleteRule } = useRules();
```

### `useUser()`
Manages user profile and preferences.

```tsx
const { user, updatePreferences } = useUser();
```

## Testing

### Run E2E Tests

```bash
pnpm cypress open
```

Test suites cover:
- Navigation and routing
- Dashboard functionality
- Rules CRUD operations
- Settings management
- Form validation

## Design System

### Color Palette

- **Primary**: Blue/Purple (`oklch(0.55 0.19 263)`)
- **Background**: Very Dark (`oklch(0.12 0 0)`)
- **Card**: Dark (`oklch(0.16 0 0)`)
- **Border**: Medium Dark (`oklch(0.22 0 0)`)
- **Foreground**: Light (`oklch(0.95 0 0)`)

### Typography

- **Sans**: Geist (body text and UI)
- **Mono**: Geist Mono (code and patterns)

### Spacing & Layout

- Uses Tailwind CSS spacing scale
- Flexbox for layouts with gap utilities
- Mobile-first responsive design

## Performance Optimizations

1. **Virtualized Tables**: Results table handles large datasets efficiently
2. **Pagination**: Server-side pagination for scalability
3. **Polling**: Smart polling with exponential backoff for job status
4. **Lazy Loading**: Code splitting via Next.js dynamic imports
5. **Caching**: API responses cached where appropriate

## Security Considerations

1. **Auth Token**: API client supports Bearer token authentication
2. **CORS**: Frontend makes requests to configured API base URL
3. **Input Validation**: Form validation before API calls
4. **Error Handling**: Graceful error recovery and user feedback
5. **Confirmation**: Two-step process for destructive operations

## Deployment

### Build for Production

```bash
pnpm build
pnpm start
```

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

## Next Steps

1. **Connect Backend**: Update `NEXT_PUBLIC_API_URL` to your backend
2. **Implement Authentication**: Add auth flow and token management
3. **Add Error Recovery**: Implement retry logic for failed requests
4. **Analytics**: Add tracking for user actions
5. **Accessibility**: Run axe/lighthouse audits
6. **Performance**: Monitor Core Web Vitals

## Troubleshooting

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS headers from backend
- Ensure API server is running

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Check TypeScript errors: `pnpm tsc --noEmit`

### UI Not Loading
- Check browser console for errors
- Verify all UI components are imported correctly
- Check Tailwind CSS is working

## Support

For issues or questions about the frontend implementation, check the source code comments or review the API type definitions in `lib/api.types.ts` for reference.
