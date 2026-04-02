

## Plan: Fix hermes-proxy Path Forwarding and CORS

**Problem**: The edge function forwards the full URL path (e.g., `/hermes-proxy/health`) to the bridge, but the bridge expects paths without the prefix (e.g., `/health`). This causes "Endpoint not found" errors.

### Changes

**File: `supabase/functions/hermes-proxy/index.ts`**

1. **Strip `/hermes-proxy` prefix** from the path before forwarding to the bridge (around line 110)
2. **Add direct health check** — when path is `/hermes-proxy` with no sub-path, return a direct health response so the function itself can be tested
3. **Fix CORS headers** — update `Access-Control-Allow-Headers` to include `x-client-info` and other headers the Supabase JS client sends
4. **Remove `deno.json` and `deno.lock`** — these can cause deploy issues and aren't needed

### Expected Result

- `curl /hermes-proxy/health` → strips prefix → forwards `/health` to bridge → returns bridge health response
- `curl /hermes-proxy/api/cron/jobs` → strips prefix → forwards `/api/cron/jobs` to bridge
- Dashboard can call the function via `supabase.functions.invoke('hermes-proxy', ...)` with proper CORS

