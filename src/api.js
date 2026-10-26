// Minimal Messages API client for prototype slides. Calls go through the Reonic prototype's
// claude-proxy Edge Function (same Supabase project), which holds the Anthropic key, so no key is
// ever in the page. Usage counts toward that proxy's daily limit in reonic_api_usage. The proxy only
// accepts https://ahadwen.github.io, so these calls don't work from a local server.

import { CLAUDE_PROXY_URL, SUPABASE_ANON_KEY } from './config.js';

export const DEFAULT_MODEL = 'claude-sonnet-5-5';

export async function callClaude(req) {
  const res = await fetch(CLAUDE_PROXY_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    body: JSON.stringify({ model: DEFAULT_MODEL, ...req }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`API error ${res.status}: ${body?.error?.message ?? res.statusText}`);
  return body;
}
