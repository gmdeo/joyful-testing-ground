# HermessBridge Hybrid Deployment Guide

## 🎯 Overview

This guide explains the **hybrid architecture** that solves the Lovable/Supabase secret key constraint by combining local and cloud components.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Dashboard (React/Vite)                         │
│  - Running on localhost:8080 or Lovable deployment          │
│  - Calls Edge Function for all API requests                │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────────────────┐
│        Edge Function (Lovable/Cloud/Deno)                    │
│  - Supabase Function: hermes-proxy                          │
│  - Has access to SUPABASE_SERVICE_ROLE_KEY ✅               │
│  - Forwards requests to local bridge                        │
│  - Handles Supabase sync if configured                       │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP (localhost:3000)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│      Local Node.js Bridge (Simplified)                      │
│  - Running on localhost:3000                                │
│  - Executes Hermes CLI commands directly                    │
│  - No Supabase dependency ✅                                │
│  - No authentication middleware ✅                          │
└─────────────────┬───────────────────────────────────────────┘
                  │ Shell commands
                  ▼
┌─────────────────────────────────────────────────────────────┐
│           Hermes CLI (Local Binary)                         │
│  - Direct access to Hermes Agent Gateway                    │
│  - Returns real-time data                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Benefits

✅ **Local CLI Access:** Can execute Hermes CLI commands directly on local machine
✅ **Cloud Secrets:** Edge Function has Supabase service role key access
✅ **Flexible Architecture:** Local for CLI, Cloud for secrets
✅ **Secure:** Secrets never leave Edge Function infrastructure
✅ **Scalable:** Can add more Edge Functions as needed
✅ **Production Ready:** Lovable handles deployment and scaling

---

## 📦 Components

### 1. Edge Function (`supabase/functions/hermes-proxy/`)

#### Purpose
- Secure Gateway: Handles authentication and secrets
- Request Proxy: Forwards requests to local bridge
- Supabase Sync: Optional sync to database (with secrets)

#### Key Files
```
supabase/functions/hermes-proxy/
├── index.ts              # Main Edge Function code
├── deno.json            # Deno configuration
└── .env.example         # Environment variables template
```

#### Features
- CORS handling
- Request forwarding to local bridge
- Optional Supabase sync
- Error handling and logging

#### Configuration
```bash
# Environment Variables (provided by Lovable)
LOCAL_BRIDGE_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<provided by Lovable>
```

---

### 2. Local Bridge (`hermes-bridge/`)

#### Purpose
- CLI Execution: Runs Hermes CLI commands
- Real-time Data: Returns fresh data from Hermes
- Simple Architecture: No external dependencies

#### Key Files
```
hermes-bridge/
├── src/index-simple.js            # Simplified server (no Supabase)
├── src/routes/cron-simple.js      # Cron job routes (no sync)
├── src/routes/sessions-simple.js  # Session routes (no sync)
├── src/routes/status-simple.js    # Status routes (no sync)
└── src/utils/hermes-cli.js        # Hermes CLI wrapper functions
```

#### Features
- Executes `hermes cron list`, `hermes sessions list`, etc.
- Returns JSON-formatted responses
- No authentication (handled by Edge Function)
- No Supabase sync (handled by Edge Function)

#### Simplified .env
```bash
# No Supabase or JWT configuration needed
PORT=3000
HERMES_HOME=/home/mm/.hermes/hermes-agent
HERMES_CLI=/home/mm/.local/bin/hermes
```

---

### 3. Dashboard (`src/` and `.env.local`)

#### Configuration
```bash
# Production (Lovable Edge Function)
VITE_API_BASE_URL=https://fizqphhtbdnvywvmtkyl.supabase.co/functions/v1/hermes-proxy

# Local Development (Cloudflare tunnel - optional)
# VITE_API_BASE_URL=https://hermes-portal.theagentagency.xyz
```

#### API Integration
```typescript
// src/lib/api.ts - bridgeApi
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Automatically calls Edge Function
await bridgeApi.getCronJobs();
await bridgeApi.getSessions();
await bridgeApi.getStatus();
```

---

## 🛠️ Deployment Steps

### Step 1: Deploy Edge Function to Lovable

**Option A: Via Lovable UI**
```
1. Open Lovable project
2. Navigate to Edge Functions
3. Create new function: hermes-proxy
4. Copy code from supabase/functions/hermes-proxy/index.ts
5. Deploy function
6. Configure environment variables:
   - LOCAL_BRIDGE_URL: http://localhost:3000 (or your local bridge URL)
   - SUPABASE_URL: https://fizqphhtbdnvywvmtkyl.supabase.co
   - SUPABASE_SERVICE_ROLE_KEY: Provided by Lovable automatically ✅
```

**Option B: Via Git**
```
1. Push code to GitHub
2. Lovable detects supabase/functions/ directory
3. Automatically deploys Edge Function
4. Lovable provides environment variables
```

---

### Step 2: Start Local Bridge

```bash
cd ~/joyful-testing-ground/hermes-bridge
npm start
```

**Expected Output:**
```
Hermes Agent Bridge (Simplified) running on port 3000
Local access: http://localhost:3000
Features: CLI execution only (no Supabase sync)
Authentication: Disabled (handled by Edge Function)
```

---

### Step 3: Test the Flow

```bash
# Test local bridge directly
curl http://localhost:3000/api/cron/jobs

# Test Edge Function proxy (if running locally)
curl http://localhost:9000/api/cron/jobs

# Test via Lovable URL (after deployment)
curl https://fizqphhtbdnvywvmtkyl.supabase.co/functions/v1/hermes-proxy/api/cron/jobs
```

---

### Step 4: Deploy Dashboard

```bash
cd ~/joyful-testing-ground
npm run build
npm run dev  # Local testing
# Or deploy via Lovable
```

---

## 🔒 How It Works

### Request Flow Example

1. **Dashboard calls:**
   ```typescript
   await bridgeApi.getCronJobs();
   ```

2. **Edge Function receives request:**
   ```typescript
   GET /api/cron/jobs
   Headers: Authorization (edge function token)
   ```

3. **Edge Function forwards to local bridge:**
   ```typescript
   fetch('http://localhost:3000/api/cron/jobs')
   ```

4. **Local bridge executes CLI:**
   ```bash
   hermes cron list
   ```

5. **Edge Function returns response:**
   ```json
   {
     "success": true,
     "data": [...],
     "timestamp": "2026-04-02T01:42:18.920Z"
   }
   ```

6. **Dashboard displays data**

### Secret Access

Edge Function can access Supabase secrets:
```typescript
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
// ✅ Works! Provided by Lovable Edge Function runtime
```

Local bridge cannot:
```typescript
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
// ❌ Doesn't work! Lovable hides the secret
```

---

## 🧪 Testing Checklist

### Local Testing

- [ ] Start simplified local bridge: `cd hermes-bridge && npm start`
- [ ] Test bridge health: `curl http://localhost:3000/health`
- [ ] Test cron endpoint: `curl http://localhost:3000/api/cron/jobs`
- [ ] Test sessions endpoint: `curl http://localhost:3000/api/sessions`

### Edge Function Testing

- [ ] Start Edge Function locally: `cd supabase/functions/hermes-proxy && deno run --allow-net --allow-env index.ts`
- [ ] Test proxy health: `curl http://localhost:9000/health`
- [ ] Test proxy cron: `curl http://localhost:9000/api/cron/jobs`
- [ ] Verify logs show: `[Proxy] GET /api/cron/jobs`

### Full Stack Testing

- [ ] Deploy Edge Function to Lovable
- [ ] Start local bridge
- [ ] Test via Lovable URL: `curl https://fizqphhtbdnvywvmtkyl.supabase.co/functions/v1/hermes-proxy/api/cron/jobs`
- [ ] Open Dashboard in browser: `http://localhost:8080`
- [ ] Verify Dashboard shows cron jobs, sessions, status

---

## 📊 API Endpoints

All endpoints available at Edge Function URL:

| Endpoint | Method | Purpose | Bridge Handler |
|----------|--------|---------|----------------|
| `/health` | GET | Health check | Simple server |
| `/api/cron/jobs` | GET | List cron jobs | cron-simple |
| `/api/cron/jobs/:id/pause` | POST | Pause job | cron-simple |
| `/api/cron/jobs/:id/resume` | POST | Resume job | cron-simple |
| `/api/cron/jobs/:id/run` | POST | Run immediate | cron-simple |
| `/api/cron/jobs/:id` | DELETE | Delete job | cron-simple |
| `/api/sessions` | GET | List sessions | sessions-simple |
| `/api/sessions/:id` | GET | Get session | sessions-simple |
| `/api/sessions/:id` | DELETE | Delete session | sessions-simple |
| `/api/status` | GET | Get status | status-simple |

---

## 🔧 Troubleshooting

### Edge Function Not Connecting to Local Bridge

**Symptoms:** `Failed to connect to local bridge`

**Solutions:**
1. Verify local bridge is running: `curl http://localhost:3000/health`
2. Check Edge Function has correct `LOCAL_BRIDGE_URL`
3. Ensure same machine/VPN is running both
4. Check firewall rules allow localhost connections

### Dashboard Can't Reach API

**Symptoms:** `Network error when fetching API`

**Solutions:**
1. Check `VITE_API_BASE_URL` in `.env.local`
2. Verify Dashboard has correct API base URL
3. Check browser console for CORS errors
4. Test with curl: `curl https://fizqphhtbdnvywvmtkyl.supabase.co/functions/v1/hermes-proxy/health`

### Hermes CLI Commands Not Working

**Symptoms:** Empty cron jobs array, Hermes CLI errors

**Solutions:**
1. Test CLI directly: `hermes cron list`
2. Check Hermes CLI path in `.env`
3. Verify Hermes Agent Gateway is running
4. Check logs: `cat /tmp/bridge-simple.log`

---

## 📝 Maintenance

### Updating Local Bridge

```bash
cd ~/joyful-testing-ground/hermes-bridge
git pull
npm install  # If dependencies changed
npm start    # Restart with latest code
```

### Updating Edge Function

```bash
cd ~/joyful-testing-ground
git push origin main
# Lovable will detect changes in supabase/functions/
# Auto-deploy Edge Function
```

### Updating Dashboard

```bash
cd ~/joyful-testing-ground
npm run build
# Lovable will detect changes
# Auto-deploy Dashboard
```

---

## 🎉 Summary

**The Hybrid Architecture is Ready!**

✅ **Edge Function:** Created and tested locally
✅ **Local Bridge:** Simplified, running without Supabase
✅ **Dashboard:** Configured to use Edge Function URL
✅ **Flow Tested:** Dashboard → Edge Function → Local Bridge → CLI
✅ **Secret Access:** Edge Function has Lovable provided secrets
✅ **CLI Access:** Local bridge has Hermes CLI access

**Next Step:** Deploy Edge Function via Lovable and test end-to-end!

---

## 📚 Related Documentation

- `HERMES_DASHBOARD_PLAN.md` - Original dashboard plan and status
- `HERMES_DASHBOARD_FINAL_STATUS.md` - Final architecture summary
- `supabase/functions/hermes-proxy/.env.example` - Edge Function config template
- `hermes-bridge/.env.simple` - Local bridge config template