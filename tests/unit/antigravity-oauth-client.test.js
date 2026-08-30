// Guards the deduped Antigravity/Google OAuth clients: credentials are
// deployment-supplied via env (never committed) and every source mirrors the
// shared constants in open-sse/providers/shared.js.
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

const ENV = {
  ANTIGRAVITY_CLIENT_ID: "ag-test-client-id.apps.googleusercontent.com",
  ANTIGRAVITY_CLIENT_SECRET: "ag-test-secret",
  GOOGLE_CLIENT_ID: "google-test-client-id.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "google-test-secret",
};

beforeAll(() => Object.assign(process.env, ENV));
afterAll(() => {
  for (const key of Object.keys(ENV)) delete process.env[key];
});

describe("antigravity oauth client (deduped, env-supplied)", () => {
  it("shared source reads credentials from env", async () => {
    const { ANTIGRAVITY_OAUTH_CLIENT, GOOGLE_OAUTH_CLIENT } = await import("../../open-sse/providers/shared.js");
    expect(ANTIGRAVITY_OAUTH_CLIENT).toEqual({
      clientId: ENV.ANTIGRAVITY_CLIENT_ID,
      clientSecret: ENV.ANTIGRAVITY_CLIENT_SECRET,
    });
    expect(GOOGLE_OAUTH_CLIENT).toEqual({
      clientId: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
    });
  });

  it("shared source defaults to blank when env is unset", async () => {
    const saved = { ...process.env };
    for (const key of Object.keys(ENV)) delete process.env[key];
    try {
      vi.resetModules(); // shared.js reads env at import time — force re-evaluation
      const mod = await import("../../open-sse/providers/shared.js");
      expect(mod.ANTIGRAVITY_OAUTH_CLIENT).toEqual({ clientId: "", clientSecret: "" });
      expect(mod.GOOGLE_OAUTH_CLIENT).toEqual({ clientId: "", clientSecret: "" });
    } finally {
      Object.assign(process.env, saved);
    }
  });

  it("registry transport mirrors the shared clients", async () => {
    const { ANTIGRAVITY_OAUTH_CLIENT, GOOGLE_OAUTH_CLIENT } = await import("../../open-sse/providers/shared.js");
    const ag = (await import("../../open-sse/providers/registry/antigravity.js")).default;
    const gemini = (await import("../../open-sse/providers/registry/gemini.js")).default;
    const gc = (await import("../../open-sse/providers/registry/gemini-cli.js")).default;
    expect(ag.transport.clientId).toBe(ANTIGRAVITY_OAUTH_CLIENT.clientId);
    expect(ag.transport.clientSecret).toBe(ANTIGRAVITY_OAUTH_CLIENT.clientSecret);
    expect(gemini.transport.clientId).toBe(GOOGLE_OAUTH_CLIENT.clientId);
    expect(gemini.transport.clientSecret).toBe(GOOGLE_OAUTH_CLIENT.clientSecret);
    expect(gc.transport.clientId).toBe(GOOGLE_OAUTH_CLIENT.clientId);
    expect(gc.transport.clientSecret).toBe(GOOGLE_OAUTH_CLIENT.clientSecret);
  });

  // Guard: oauth.js must spread shared clients + derive from registry (PROVIDER_OAUTH).
  it("src oauth.js imports shared client + keeps full shape", async () => {
    const { readFileSync } = await import("node:fs");
    const { fileURLToPath } = await import("node:url");
    const { dirname, join } = await import("node:path");
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(here, "../../src/lib/oauth/constants/oauth.js"), "utf8");
    expect(src).toContain('import { ANTIGRAVITY_OAUTH_CLIENT, GOOGLE_OAUTH_CLIENT } from "open-sse/providers/shared.js"');
    expect(src).toContain("...ANTIGRAVITY_OAUTH_CLIENT");
    expect(src).toContain("...GOOGLE_OAUTH_CLIENT");
    // authorizeUrl now lives in registry; oauth.js derives via PROVIDER_OAUTH spread
    expect(src).toContain('PROVIDER_OAUTH["antigravity"]');
    expect(src).toContain('PROVIDER_OAUTH["gemini-cli"]');
    // No literal client secrets may be hardcoded in src/lib/oauth.
    expect(src).not.toMatch(/GOCSPX-/);
  });
});
