# Hermes Agent Bridge

Backend service connecting Hermes CLI to the Dashboard UI.

## Architecture

```
Dashboard (React) ←→ Express API ←→ Hermes CLI Commands ←→ Supabase ←→ Real-time WebSocket
```

The bridge:
1. Wraps Hermes CLI commands (cron, sessions, chat, etc.)
2. Exposes REST API for dashboard to call
3. Syncs all data to Supabase for persistence
4. Enables real-time updates via Supabase subscriptions
5. Authentication via JWT tokens from Supabase auth

## Features

- ✅ List/create/edit/delete cron jobs
- ✅ List/resume/delete sessions
- ✅ Initiate new chat sessions
- ✅ Pause/resume scheduled jobs
- ✅ Real-time status updates
- ✅ Session browsing and search
- ✅ Task monitoring
- ✅ Memory management

## API Endpoints

### Cron Jobs
- GET `/api/cron/jobs` - List all cron jobs
- POST `/api/cron/jobs` - Create new cron job
- PUT `/api/cron/jobs/:id` - Edit cron job
- DELETE `/api/cron/jobs/:id` - Delete cron job
- POST `/api/cron/jobs/:id/pause` - Pause job
- POST `/api/cron/jobs/:id/resume` - Resume job
- POST `/api/cron/jobs/:id/run` - Run job immediately

### Sessions
- GET `/api/sessions` - List all sessions
- GET `/api/sessions/:id` - Get session details
- DELETE `/api/sessions/:id` - Delete session
- POST `/api/sessions/:id/resume` - Resume session
- POST `/api/sessions/new` - Start new session
- GET `/api/sessions/search` - Search sessions

### Chat
- POST `/api/chat/new` - Start new chat session
- POST `/api/chat/message` - Send message in session
- GET `/api/chat/:id/messages` - Get chat history

### Tasks
- GET `/api/tasks` - List all active tasks
- POST `/api/tasks/new` - Create new task
- DELETE `/api/tasks/:id` - Cancel task

### Memory
- GET `/api/memory` - Get agent memory
- POST `/api/memory` - Add memory entry
- DELETE `/api/memory/:id` - Delete memory entry

### Gateway Status
- GET `/api/status` - Get current Hermes status
- GET `/api/status/gateway` - Gateway service status
- GET `/api/status/sessions` - Session statistics
- GET `/api/status/cron` - Cron job statistics

## Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Hermes CLI Configuration
HERMES_HOME=/home/mm/.hermes/hermes-agent
HERMES_CLI=/home/mm/.local/bin/hermes

# API Configuration
PORT=3000
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

## Setup

1. Install dependencies:
```bash
cd hermes-bridge
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Start the bridge:
```bash
npm start
```

The bridge will be available at `http://localhost:3000`

## Development

Run in development mode with hot reload:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

## License

MIT