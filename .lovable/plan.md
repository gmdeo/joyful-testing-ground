

## Plan: Add Provider API Key to Model Configuration

**What**: Add an API key input field to the Model Configuration section in Settings. The key is stored in localStorage and sent to the bridge with every request, so the local Hermes CLI can authenticate with the selected provider (Venice AI, OpenAI, etc.).

### Changes

**1. `src/pages/Settings.tsx` — ModelConfig component (~lines 135-261)**
- Add `apiKey` and `showApiKey` to state
- Load/save API key from `localStorage` keyed by provider (e.g. `hermes_apikey_venice`)
- Add a new `SettingsItem` after the Provider selector with a password input + eye toggle button
- When provider changes, load the saved key for that provider
- Add a Save button that persists both config and API key

**2. `src/lib/api.ts` — bridgeRequest function (~line 23)**
- Read the current provider from `localStorage` (`hermes_provider`)
- Look up the API key from `localStorage` (`hermes_apikey_{provider}`)
- If present, include it as an `x-api-key` header in the request

**3. `supabase/functions/hermes-proxy/index.ts`**
- Forward the `x-api-key` header from the incoming request to the bridge

**4. Local bridge (informational — user must update manually)**
- `hermes-bridge/src/utils/hermes-cli.js`: read `x-api-key` from request headers and set it as the appropriate env var (e.g. `VENICE_API_KEY`) when spawning the CLI process

### Security
- Keys stay in the user's browser localStorage and only travel through their own edge function to their own local bridge — never stored in the cloud database.

