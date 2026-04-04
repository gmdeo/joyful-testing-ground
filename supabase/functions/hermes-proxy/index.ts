const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LOCAL_BRIDGE_URL = Deno.env.get('LOCAL_BRIDGE_URL') || 'https://hermes-portal.theagentagency.xyz';

interface BridgeResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: string;
}

async function forwardToBridge(
  path: string,
  method: string,
  headers: Headers,
  body?: any
): Promise<BridgeResponse> {
  try {
    const bridgeUrl = new URL(path, LOCAL_BRIDGE_URL);
    const requestHeaders = new Headers();
    const allowedHeaders = ['content-type', 'accept', 'origin', 'authorization', 'x-api-key'];
    for (const header of allowedHeaders) {
      const value = headers.get(header);
      if (value) requestHeaders.set(header, value);
    }

    const response = await fetch(bridgeUrl.toString(), {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Bridge returned non-JSON response:', text.substring(0, 200));
      return {
        success: false,
        error: 'Local bridge returned a non-JSON response. Is your Cloudflare tunnel running and the bridge started?',
        timestamp: new Date().toISOString(),
      };
    }
    if (typeof data.success === 'undefined') {
      data.success = response.ok;
    }
    return data;
  } catch (error) {
    console.error('Error forwarding to bridge:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to local bridge',
      timestamp: new Date().toISOString(),
    };
  }
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const rawPath = url.pathname;

  // Strip the /hermes-proxy prefix
  const path = rawPath.replace(/^\/hermes-proxy/, '') || '/';

  console.log(`[Proxy] ${req.method} ${rawPath} → ${path}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Direct proxy health check (no sub-path)
  if (path === '/' || path === '') {
    return new Response(JSON.stringify({
      success: true,
      service: 'hermes-proxy',
      bridge_url: LOCAL_BRIDGE_URL,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    let body: any = undefined;
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      const contentType = req.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = await req.json();
      }
    }

    const bridgeResponse = await forwardToBridge(path, req.method, req.headers, body);

    return new Response(JSON.stringify(bridgeResponse), {
      status: bridgeResponse.success ? 200 : 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
