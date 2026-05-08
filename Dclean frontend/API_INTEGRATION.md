# Dclean Frontend - API Integration Guide

## Quick Start

### 1. Set API Base URL

Add to `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://your-backend-url/api
```

### 2. Check API Client

The API client is in `lib/api-client.ts`. All methods are ready to use:

```typescript
import { apiClient } from '@/lib/api-client';

// Start a scan
const job = await apiClient.startScan({
  ruleIds: ['rule-1', 'rule-2'],
  includeHiddenFiles: true,
  maxDepth: 10,
});

// Get scan status
const status = await apiClient.getScanStatus(jobId);

// Get results
const results = await apiClient.getScanResults(jobId, 0, 50);
```

## API Endpoints Reference

### Scan Operations

#### POST /scan/start
Start a new scan job.

**Request:**
```json
{
  "ruleIds": ["uuid-1", "uuid-2"],
  "includeHiddenFiles": true,
  "excludePaths": ["/System", "/Library"],
  "maxDepth": 10
}
```

**Response:**
```json
{
  "id": "scan-uuid",
  "status": "queued",
  "progress": 0,
  "createdAt": "2024-04-05T12:00:00Z",
  "filesFound": 0,
  "directoriesScanned": 0,
  "sizeFound": 0
}
```

#### GET /scan/{jobId}
Get current scan status and progress.

**Response:**
```json
{
  "id": "scan-uuid",
  "status": "scanning",
  "progress": 45,
  "createdAt": "2024-04-05T12:00:00Z",
  "filesFound": 1250,
  "directoriesScanned": 340,
  "sizeFound": 536870912
}
```

#### GET /scan/{jobId}/results?skip=0&limit=50
Get paginated results from scan.

**Response:**
```json
[
  {
    "id": "file-1",
    "path": "/Users/user/Downloads/temp.tmp",
    "name": "temp.tmp",
    "size": 1048576,
    "type": "file",
    "extension": ".tmp",
    "riskLevel": "low",
    "reason": "Matches temp file pattern",
    "matchedRules": ["rule-uuid-1"],
    "selected": false
  }
]
```

#### POST /scan/{jobId}/cancel
Cancel an in-progress scan.

**Response:**
```json
{}
```

### Clean Operations

#### POST /clean/start
Start a cleaning operation.

**Request:**
```json
{
  "jobId": "scan-uuid",
  "fileIds": ["file-1", "file-2", "file-3"],
  "action": "delete"
}
```

**Response:**
```json
{
  "id": "clean-uuid",
  "status": "scanning",
  "progress": 0,
  "createdAt": "2024-04-05T12:10:00Z",
  "filesFound": 0,
  "directoriesScanned": 0,
  "sizeFound": 0,
  "filesDeleted": 0,
  "sizeCleaned": 0,
  "deletedPaths": []
}
```

#### GET /clean/{jobId}
Get clean job status.

**Response:**
```json
{
  "id": "clean-uuid",
  "status": "completed",
  "progress": 100,
  "createdAt": "2024-04-05T12:10:00Z",
  "completedAt": "2024-04-05T12:15:00Z",
  "filesFound": 0,
  "directoriesScanned": 0,
  "sizeFound": 0,
  "filesDeleted": 3,
  "sizeCleaned": 536870912,
  "deletedPaths": [
    "/Users/user/Downloads/temp.tmp",
    "/Users/user/Downloads/cache.dat",
    "/Users/user/Downloads/old.bak"
  ]
}
```

### Rules Management

#### GET /rules
List all rules.

**Response:**
```json
[
  {
    "id": "rule-uuid-1",
    "name": "Temporary Files",
    "description": "Clean .tmp and .temp files",
    "enabled": true,
    "pattern": "*.tmp",
    "patternType": "glob",
    "matchType": "extension",
    "action": "delete",
    "riskLevel": "low",
    "createdAt": "2024-04-01T00:00:00Z",
    "updatedAt": "2024-04-01T00:00:00Z"
  }
]
```

#### POST /rules
Create a new rule.

**Request:**
```json
{
  "name": "Cache Files",
  "description": "Remove application cache",
  "enabled": true,
  "pattern": "*.cache",
  "patternType": "glob",
  "matchType": "extension",
  "action": "delete",
  "riskLevel": "medium"
}
```

**Response:**
```json
{
  "id": "rule-uuid-2",
  "name": "Cache Files",
  "description": "Remove application cache",
  "enabled": true,
  "pattern": "*.cache",
  "patternType": "glob",
  "matchType": "extension",
  "action": "delete",
  "riskLevel": "medium",
  "createdAt": "2024-04-05T12:00:00Z",
  "updatedAt": "2024-04-05T12:00:00Z"
}
```

#### PUT /rules/{ruleId}
Update an existing rule.

**Request:**
```json
{
  "enabled": false
}
```

**Response:** Updated rule object

#### DELETE /rules/{ruleId}
Delete a rule.

**Response:**
```json
{}
```

#### POST /rules/test
Test a rule pattern against sample file names.

**Request:**
```json
{
  "pattern": "*.tmp",
  "patternType": "glob",
  "matchType": "extension",
  "testCases": ["file.tmp", "document.txt", "cache.tmp"]
}
```

**Response:**
```json
{
  "matches": [
    { "testCase": "file.tmp", "matched": true },
    { "testCase": "document.txt", "matched": false },
    { "testCase": "cache.tmp", "matched": true }
  ]
}
```

### History

#### GET /history?skip=0&limit=50
Get job history.

**Response:**
```json
[
  {
    "id": "history-uuid-1",
    "type": "scan",
    "job": { /* ScanJob object */ },
    "resultsCount": 1250,
    "canRestore": true,
    "createdAt": "2024-04-05T12:00:00Z"
  }
]
```

#### POST /history/{jobId}/restore
Restore files from a previous clean job.

**Response:**
```json
{
  "id": "restore-uuid",
  "status": "queued",
  /* CleanJob object for restore operation */
}
```

### User

#### GET /user
Get current user profile.

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "preferences": {
    "theme": "dark",
    "autoConfirm": false,
    "showAdvanced": false
  }
}
```

#### PUT /user/preferences
Update user preferences.

**Request:**
```json
{
  "theme": "light",
  "autoConfirm": true,
  "showAdvanced": true
}
```

**Response:** Updated User object

## Error Handling

All API errors should follow this format:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid rule pattern",
  "details": {
    "field": "pattern",
    "value": "invalid[regex"
  }
}
```

The frontend catches these and displays user-friendly error messages.

## Job Status Values

Possible status values:
- `queued` - Job is waiting to start
- `scanning` - Job is in progress
- `completed` - Job finished successfully
- `error` - Job failed with error
- `cancelled` - Job was cancelled by user

## Data Types Summary

### CleaningRule
- `id`: string (UUID)
- `name`: string
- `description`: string
- `enabled`: boolean
- `pattern`: string
- `patternType`: "glob" | "regex"
- `matchType`: "name" | "extension" | "path"
- `action`: "delete" | "archive"
- `riskLevel`: "low" | "medium" | "high"
- `createdAt`: ISO string
- `updatedAt`: ISO string

### FileResult
- `id`: string
- `path`: string (full file path)
- `name`: string (filename only)
- `size`: number (bytes)
- `type`: "file" | "directory"
- `extension`: string (optional, e.g., ".txt")
- `riskLevel`: "low" | "medium" | "high"
- `reason`: string (why file matched)
- `matchedRules`: string[] (rule IDs)
- `selected`: boolean

### ScanJob / CleanJob
- `id`: string (UUID)
- `status`: "queued" | "scanning" | "completed" | "error" | "cancelled"
- `progress`: number (0-100)
- `createdAt`: ISO string
- `completedAt`: ISO string (optional)
- `filesFound`: number
- `directoriesScanned`: number
- `sizeFound`: number (bytes)
- `error`: string (optional, on error status)
- CleanJob adds: `filesDeleted`, `sizeCleaned`, `deletedPaths[]`

## Testing the API

Use the provided custom hooks to test API connectivity:

```typescript
// In a component
const { job, loading, error } = useJobPolling(jobId, 'scan');
const { rules } = useRules();
const { user } = useUser();
```

Or test directly with curl:

```bash
curl -X POST http://localhost:3001/api/scan/start \
  -H "Content-Type: application/json" \
  -d '{"ruleIds":[],"maxDepth":10}'
```

## Authentication

If your backend requires authentication:

```typescript
import { apiClient } from '@/lib/api-client';

// Set auth token
apiClient.setAuthToken('your-jwt-token-here');

// All subsequent requests will include: Authorization: Bearer your-jwt-token-here
```

## Troubleshooting

### CORS Errors
Ensure your backend allows requests from the frontend origin and includes:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 404 Errors
Check that endpoints match exactly. The frontend expects exact paths as documented above.

### Timeout Issues
Increase polling interval or add retry logic in `lib/hooks.ts` if needed.
