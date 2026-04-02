/**
 * HermessBridge Proxy Edge Function
 *
 * This Edge Function acts as a secure gateway between the Dashboard and the local Node.js bridge.
 * It forwards HTTP requests from the Dashboard to the local bridge, optionally syncing data to Supabase
 * using the service role secret (available via Deno.env).
 *
 * Architecture:
 *   Dashboard → Edge Function (Cloud) → Local Bridge (localhost:3000) → Hermes CLI
 */

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

// Configuration
const LOCAL_BRIDGE_URL = Deno.env.get('LOCAL_BRIDGE_URL') || 'http://localhost:3000';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';

// Request/Response types
interface BridgeResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: string;
}

/**
 * Forward request to local bridge
 */
async function forwardToBridge(
  path: string,
  method: string,
  headers: Headers,
  body?: any
): Promise<BridgeResponse> {
  try {
    const bridgeUrl = new URL(path, LOCAL_BRIDGE_URL);
    const requestHeaders = new Headers();

    // Copy relevant headers
    const allowedHeaders = ['content-type', 'accept', 'origin'];
    for (const header of allowedHeaders) {
      const value = headers.get(header);
      if (value) {
        requestHeaders.set(header, value);
      }
    }

    const response = await fetch(`${bridgeUrl}`, {
      method: method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error forwarding to bridge:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to local bridge',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check if response contains data that should be synced to Supabase
 */
function shouldSyncToSupabase(path: string, response: BridgeResponse): boolean {
  // Only sync successful responses from specific endpoints
  const syncablePaths = ['/api/cron/jobs', '/api/sessions', '/api/status'];
  return response.success && syncablePaths.some(p => path.startsWith(p));
}

/**
 * Sync data to Supabase (optional - can be enabled later)
 */
async function syncToSupabase(
  path: string,
  data: any
): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Supabase credentials not configured, skipping sync');
    return;
  }

  try {
    // For now, just log - implementing full sync later
    console.log(`[Sync] Would sync ${path} data to Supabase`, {
      dataSubtype: Array.isArray(data) ? 'array' : typeof data,
      size: JSON.stringify(data).length,
    });

    // TODO: Implement actual Supabase sync when needed
    // Example:
    // if (path === '/api/cron/jobs' && Array.isArray(data)) {
    //   await syncCronJobsToSupabase(data);
    // }
  } catch (error) {
    console.error('Error syncing to Supabase:', error);
    // Don't fail the request if sync fails - log and continue
  }
}

/**
 * Main request handler
 */
serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  console.log(`[Proxy] ${method} ${path}`);

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Parse request body if present
    let body: any = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      const contentType = req.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = await req.json();
      }
    }

    // Forward request to local bridge
    const bridgeResponse = await forwardToBridge(path, method, req.headers, body);

    // Optional: Sync to Supabase if configured
    if (shouldSyncToSupabase(path, bridgeResponse)) {
      await syncToSupabase(path, bridgeResponse.data);
    }

    // Return response with CORS headers
    return new Response(JSON.stringify(bridgeResponse), {
      status: bridgeResponse.success ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);

    const errorResponse: BridgeResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}, {
  port: 9000, // Default port for Edge Functions
  onListen({ hostname, port }) {
    console.log(`HermessBridge Proxy listening on http://${hostname}:${port}`);
    console.log(`Forwarding to local bridge: ${LOCAL_BRIDGE_URL}`);
    console.log(`Supabase sync enabled: ${!!SUPABASE_URL && !!SUPABASE_SERVICE_ROLE_KEY}`);
  },
});

export default serve;