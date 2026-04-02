# HermessBridge Setup Guide

Complete setup instructions for the Hermes Agent Bridge backend.

## Prerequisites

- Node.js 18+ and npm
- Hermes Agent CLI installed and configured
- Supabase account and project set up
- Cloudflare account (if using Cloudflare Tunnel)

## Installation

### 1. Install Dependencies

```bash
cd ~/joyful-testing-ground/hermes-bridge
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Hermes CLI Configuration
HERMES_HOME=/home/mm/.hermes/hermes-agent
HERMES_CLI=/home/mm/.local/bin/hermes

# API Configuration
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=your-jwt-secret-change-this-in-production
TOKEN_EXPIRY=24h

# CORS Settings
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173
```

### 3. Verify Hermes CLI Setup

```bash
# Check if Hermes CLI is accessible
hermes status

# Should see output like:
# ◆ Environment
#   Model:        zai-org-glm-4.7
#   Provider:     Custom endpoint
# ...
```

### 4. Create Supabase Tables

Either run the database setup script or manually create these tables:

```sql
-- Hermes status table
CREATE TABLE IF NOT EXISTS hermes_status (
  user_id TEXT PRIMARY KEY,
  environment JSONB,
  gateway_status JSONB,
  messaging_platforms JSONB,
  scheduled_jobs_count JSONB,
  sessions_count JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cron jobs table
CREATE TABLE IF NOT EXISTS hermes_cron_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  schedule TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  repeat INTEGER,
  next_run TIMESTAMPTZ,
  deliver TEXT DEFAULT 'origin',
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS hermes_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  last_active TIMESTAMPTZ,
  source TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS hermes_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hermes_cron_jobs_user_id ON hermes_cron_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_hermes_sessions_user_id ON hermes_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_hermes_events_user_id ON hermes_events(user_id);
create index if not exists idx_hermes_events_created_at on hermes_events(created_at desc);
```

Or apply the schema from your existing Supabase schema file:
```bash
# From ~/joyful-testing-ground directory
supabase db reset
```

### 5. Start the Bridge

#### Development Mode

```bash
npm run dev
```

This will:
- Start the Express server on port 3000
- Watch for file changes and automatically restart
- Enable verbose logging

#### Production Mode

```bash
npm start
```

## Testing the Bridge

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-02T02:00:00.000Z",
  "service": "hermes-bridge",
  "version": "1.0.0"
}
```

### 2. Test Status Endpoint (Requires Auth Token)

You'll need to first get a Supabase auth token, then:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/status
```

### 3. Test Cron Jobs Endpoint

```bash
# List cron jobs
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/cron/jobs

# Create a new cron job
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Job",
    "schedule": "0 9 * * *",
    "prompt": "Run test",
    "deliver": "telegram"
  }' \
  http://localhost:3000/api/cron/jobs
```

### 4. Test Sessions Endpoint

```bash
# List sessions
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/sessions

# Start a new session
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello Hermes",
    "options": {}
  }' \
  http://localhost:3000/api/sessions/new
```

## API Endpoints

### Cron Jobs
- `GET /api/cron/jobs` - List all cron jobs
- `POST /api/cron/jobs` - Create new cron job
- `PUT /api/cron/jobs/:id` - Edit cron job
- `DELETE /api/cron/jobs/:id` - Delete cron job
- `POST /api/cron/jobs/:id/pause` - Pause job
- `POST /api/cron/jobs/:id/resume` - Resume job
- `POST /api/cron/jobs/:id/run` - Run job immediately

### Sessions
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/:id` - Get session details
- `DELETE /api/sessions/:id` - Delete session
- `PUT /api/sessions/:id/rename` - Rename session
- `POST /api/sessions/new` - Start new session
- `POST /api/sessions/:id/resume` - Resume session

### Chat
- `POST /api/chat/new` - Start new chat
- `POST /api/chat/message` - Send message
- `GET /api/chat/:id/messages` - Get chat history

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks/new` - Create task
- `DELETE /api/tasks/:id` - Cancel task

### Memory
- `GET /api/memory` - Get memory
- `POST /api/memory` - Add memory
- `DELETE /api/memory/:id` - Delete memory

### Status
- `GET /api/status` - Hermes status
- `GET /api/status/gateway` - Gateway status
- `GET /api/status/sessions` - Session stats
- `GET /api/status/cron` - Cron stats

## Integration with Dashboard

### 1. Update Dashboard Environment Variables

In the dashboard frontend (`~/joyful-testing-ground/.env.local`):

```env
VITE_API_BASE_URL=http://localhost:3000
```

Or for Cloudflare Tunnel:
```env
VITE_API_BASE_URL=https://hermes-portal.yourdomain.com
```

### 2. Update Dashboard API Calls

The dashboard needs to call the bridge endpoints:

```typescript
// Example: Fetch cron jobs
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cron/jobs`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Troubleshooting

### Bridge won't start

**Problem:**
```
Error: Cannot find module './routes/cron'
```

**Solution:**
```bash
cd ~/joyful-testing-ground/hermes-bridge
npm install
```

### Hermes CLI not accessible

**Problem:**
```
Error: Command failed: hermes status
```

**Solution:**
```bash
# Check if Hermes CLI is accessible
which hermes

# Check if it's in your PATH
echo $PATH

# Update .env with correct path
HERMES_CLI=/full/path/to/hermes
```

### Supabase connection error

**Problem:**
```
Error: Invalid API key
```

**Solution:**
```bash
# Verify Supabase URL and keys
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Make sure you're using the SERVICE ROLE key, not the anon key
```

### Port already in use

**Problem:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=3001
```

## Next Steps

1. ✅ Install and configure HermessBridge
2. ⏭️ Set up Cloudflare Tunnel (if needed)
3. ⏭️ Update Dashboard to connect to bridge
4. ⏭️ Test end-to-end integration
5. ⏭️ Deploy to production

## Support

For issues or questions:
1. Check the logs in the bridge terminal
2. Verify environment variables are set correctly
3. Check Supabase table schema matches expectations
4. Verify Hermes CLI is working independently
5. Review API endpoint documentation

## Architecture

```
Dashboard (React/Vite)
    ↓ HTTPS requests
HermessBridge (Express/Node)
    ↓ Hermes CLI commands
Hermes Agent (Python CLI)
    ↓
Supabase (Real-time Database)
    ↓ Real-time subscriptions
Dashboard (Live Updates)
```