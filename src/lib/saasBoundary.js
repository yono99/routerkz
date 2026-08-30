import { getApiKeyByValue } from "@/lib/localDb";
import { extractApiKey } from "@/sse/services/auth.js";
import { runWithApiRequestContext } from "@/lib/apiRequestContext.js";

export function isSaaSBoundaryConfigured() {
  return process.env.SAAS_API_KEY_REQUIRED === "true" || Boolean(process.env.SUPABASE_URL || process.env.REDIS_URL);
}

export async function authenticateApiRequest(request) {
  const key = extractApiKey(request);
  const record = key ? await getApiKeyByValue(key) : null;
  const required = process.env.SAAS_API_KEY_REQUIRED === "true";
  if (required && !record?.isActive) {
    return { ok: false, response: new Response(JSON.stringify({ error: { message: "Invalid API key", type: "authentication_error" } }), { status: 401, headers: { "content-type": "application/json", "www-authenticate": "Bearer" } }) };
  }
  return { ok: true, keyId: record?.id || null, tenantId: record?.tenantId || null };
}

export async function withApiRequestContext(request, handler) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) return auth.response;
  return runWithApiRequestContext(request, { keyId: auth.keyId, tenantId: auth.tenantId }, () => handler(auth));
}
