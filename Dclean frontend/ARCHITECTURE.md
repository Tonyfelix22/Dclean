# Dclean Frontend - Architecture

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
├─────────────────────────────────────────────────────────┤
│ Dashboard (/) → Rules (/rules) → History (/history)    │
│                ↓                                         │
│              Settings (/settings)                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              REACT COMPONENTS LAYER                      │
├─────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐    │
│  │  Dashboard │  │   Results   │  │ Clean Config │    │
│  └────────────┘  └─────────────┘  └──────────────┘    │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐    │
│  │   Rules    │  │   History   │  │  Settings    │    │
│  └────────────┘  └─────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│            CUSTOM HOOKS LAYER                           │
├─────────────────────────────────────────────────────────┤
│  useJobPolling() → Polls /scan/{id}                    │
│  useScanResults() → Fetches /scan/{id}/results        │
│  useRules() → Manages /rules CRUD                      │
│  useUser() → Fetches /user preferences                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              API CLIENT LAYER                           │
├─────────────────────────────────────────────────────────┤
│  apiClient.startScan()       → POST /scan/start        │
│  apiClient.getScanStatus()   → GET /scan/{id}          │
│  apiClient.getScanResults()  → GET /scan/{id}/results  │
│  apiClient.startClean()      → POST /clean/start       │
│  apiClient.listRules()       → GET /rules              │
│  apiClient.createRule()      → POST /rules             │
│  apiClient.getJobHistory()   → GET /history            │
│  apiClient.getCurrentUser()  → GET /user               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND API (REST)                         │
├─────────────────────────────────────────────────────────┤
│  POST   /api/scan/start         ← Start scan job       │
│  GET    /api/scan/{id}          ← Poll status          │
│  GET    /api/scan/{id}/results  ← Get results          │
│  POST   /api/clean/start        ← Start clean          │
│  GET    /api/rules              ← List rules           │
│  POST   /api/rules              ← Create rule          │
│  PUT    /api/rules/{id}         ← Update rule          │
│  DELETE /api/rules/{id}         ← Delete rule          │
│  GET    /api/history            ← Get job history      │
│  GET    /api/user               ← Get user profile     │
└─────────────────────────────────────────────────────────┘
```

## Data Flow: Scan Operation

```
User clicks "Start Scan"
        ↓
ScanForm component validates input
        ↓
Calls apiClient.startScan(config)
        ↓
POST /scan/start (backend)
        ↓
Returns ScanJob with id & status='queued'
        ↓
useJobPolling hook begins polling GET /scan/{id}
        ↓
ScanStatus component displays progress
        ↓
Every 2 seconds: GET /scan/{id}
   - Updates progress bar
   - Shows file count, size, directories
   - Stops polling when status='completed'
        ↓
User clicks "Review Results"
        ↓
Navigate to /results?jobId={id}
        ↓
useScanResults fetches GET /scan/{id}/results?skip=0&limit=50
        ↓
ResultsTable displays results with:
   - Filtering by risk level
   - Sorting by name/size/risk
   - Pagination on demand
   - Checkbox selection
        ↓
User selects files and clicks "Proceed to Clean"
        ↓
Navigate to /clean?jobId={id}&fileIds={...}
```

## Data Flow: Clean Operation

```
CleanConfirmation component displays:
   - Files to delete count
   - Total size to free
   - Risk assessment
        ↓
Step 1: Review & acknowledge risks
   - Show high-risk warning
   - Display file details
        ↓
Step 2: Confirm deletion
   - Type "delete files"
   - Check "I understand permanent"
        ↓
User clicks "Confirm Delete"
        ↓
Calls apiClient.startClean(jobId, fileIds, 'delete')
        ↓
POST /clean/start (backend)
        ↓
Returns CleanJob with status='scanning'
        ↓
useJobPolling begins polling GET /clean/{id}
        ↓
CleanCompletePage displays:
   - Progress bar
   - Files deleted count
   - Space freed
        ↓
Polling stops when status='completed'
        ↓
Show completion summary:
   - ✓ Successfully deleted X files
   - ✓ Freed Y MB
   - Buttons: Back to Dashboard / View History
```

## Component Hierarchy

```
RootLayout
├── Header
│   ├── Logo
│   ├── Navigation Menu
│   └── Mobile Menu Toggle
│
├── Dashboard Page (/)
│   ├── ScanForm
│   │   ├── Rule Selection (Checkboxes)
│   │   ├── Hidden Files Toggle
│   │   └── Max Depth Input
│   └── ScanStatus (if scanning)
│       ├── Progress Bar
│       ├── Statistics Grid
│       └── Cancel Button
│
├── Results Page (/results)
│   ├── ResultsTable
│   │   ├── Filter Buttons (Risk Level)
│   │   ├── Table Header (Sort Controls)
│   │   ├── Table Body (Virtual Scroll)
│   │   └── Pagination
│   └── Action Card
│       └── Proceed to Clean Button
│
├── Clean Page (/clean)
│   └── CleanConfirmation
│       ├── Step 1: Warning
│       │   ├── Risk Assessment
│       │   ├── Statistics
│       │   └── Proceed Button
│       └── Step 2: Confirmation
│           ├── Type Confirmation Input
│           ├── Acknowledge Checkbox
│           └── Confirm Button
│
├── Clean Complete Page (/clean-complete)
│   └── Success/Error Card
│       ├── Statistics
│       ├── Deleted Files List
│       └── Navigation Buttons
│
├── Rules Page (/rules)
│   ├── RulesList
│   │   └── RuleItem[]
│   │       ├── Toggle
│   │       ├── Edit Button
│   │       ├── Test Button
│   │       └── Delete Button
│   ├── RuleForm (if creating/editing)
│   │   ├── Name Input
│   │   ├── Pattern Input
│   │   ├── Type Selects
│   │   └── Submit Button
│   └── RuleTester (if testing)
│       ├── Test Input
│       └── Results List
│
├── History Page (/history)
│   └── JobTimeline
│       └── JobItem[]
│           ├── Type Badge
│           ├── Status Badge
│           ├── Statistics
│           ├── Restore Button
│           └── Delete Button
│
└── Settings Page (/settings)
    ├── Account Section
    ├── Appearance Section
    │   └── Theme Select
    ├── Behavior Section
    │   ├── Auto Confirm Toggle
    │   └── Advanced Options Toggle
    ├── About Section
    └── Save Button
```

## State Management

### Client-Side State (React Hooks)

**Component Local State:**
```typescript
// Dashboard
const [selectedRules, setSelectedRules] = useState<string[]>([])
const [activeScanId, setActiveScanId] = useState<string | null>(null)

// Results
const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>()
const [filterRisk, setFilterRisk] = useState<string | null>(null)

// Rules
const [editingRule, setEditingRule] = useState<CleaningRule | null>(null)
const [testingRule, setTestingRule] = useState<CleaningRule | null>(null)
```

**Server State via Hooks:**
```typescript
// Auto-updates from polling
const { job, loading, error } = useJobPolling(jobId, 'scan')

// Paginated results
const { results, fetchResults } = useScanResults(jobId, 50)

// Rules CRUD
const { rules, createRule, updateRule, deleteRule } = useRules()

// User preferences
const { user, updatePreferences } = useUser()
```

### Server State (Backend)

- Job status and progress
- Scan results database
- Rules definitions
- User profiles
- Job history

## Data Types

```
ScanJob (Server → Client)
├── id: string (UUID)
├── status: 'queued' | 'scanning' | 'completed' | 'error'
├── progress: number (0-100)
├── filesFound: number
├── sizeFound: number
└── directoriesScanned: number

FileResult (Server → Client)
├── id: string
├── path: string
├── name: string
├── size: number
├── riskLevel: 'low' | 'medium' | 'high'
├── matchedRules: string[]
└── selected: boolean

CleaningRule (Bidirectional)
├── id: string (UUID)
├── name: string
├── pattern: string
├── patternType: 'glob' | 'regex'
├── matchType: 'name' | 'extension' | 'path'
├── action: 'delete' | 'archive'
├── riskLevel: 'low' | 'medium' | 'high'
└── enabled: boolean

User (Server → Client)
├── id: string
├── email: string
├── name: string
└── preferences: {
    theme: 'light' | 'dark' | 'system'
    autoConfirm: boolean
    showAdvanced: boolean
}
```

## Performance Optimizations

### 1. Virtualized Table
- Only renders visible rows
- Handles 10k+ items efficiently
- Smooth scrolling

### 2. Pagination
- Server-side pagination
- Load more button
- Only fetches needed data

### 3. Polling Strategy
- 2-second interval during active job
- Stops when job completes
- Can be cancelled manually

### 4. Code Splitting
- Next.js automatic route-based splitting
- Lazy component imports possible
- Tree-shaking for unused code

### 5. Memoization
- useCallback for event handlers
- useMemo for expensive computations
- Prevents unnecessary re-renders

## Error Handling Strategy

```
┌─ API Request
│
├─ HTTP Error
│  └─ Caught in apiClient
│     └─ Throw ApiError
│
├─ Network Error
│  └─ Caught in try/catch
│     └─ Display error message
│
└─ Validation Error
   └─ Caught in component
      └─ Show form error
```

Each page has:
- Error state display (destructive background)
- Retry logic
- Fallback UI
- User-friendly messages

## Testing Strategy

### Unit Tests (ready to add)
- Custom hooks
- Utility functions
- Component logic

### Integration Tests (via Cypress)
- Navigation flow
- Form submission
- API integration
- Error handling

### E2E Tests (in cypress/e2e/)
- Complete scan workflow
- Rules CRUD
- Settings update
- Navigation

## Scalability Considerations

1. **Large Result Sets**: Virtualized table + pagination
2. **Many Rules**: Searchable rule list
3. **Deep Nesting**: API-controlled max depth
4. **User Concurrency**: JWT tokens per user
5. **File Operations**: Batching via IDs
6. **History Size**: Pagination on history

## Security Layers

1. **API**: Bearer token auth support
2. **UI**: Two-step confirmation for destructive ops
3. **Validation**: Client-side + server-side
4. **CORS**: Configured backend required
5. **CSP**: Headers from backend

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

Requires:
- ES2020+ (see tsconfig.json)
- CSS Grid & Flexbox
- Fetch API
- localStorage
