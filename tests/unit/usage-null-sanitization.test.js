import { describe, it, expect } from "vitest";
import {
  addBufferToUsage,
  extractUsage,
  filterUsageForFormat,
  mergeUsage,
  normalizeUsage,
  sanitizeUsageForClient,
} from "../../open-sse/utils/usageTracking.js";

// Strict clients (Rust serde — Codex, Zed, …) deserialize usage counters as
// integers. Upstreams such as vLLM/SGLang emit "prompt_tokens_details":
// {"cached_tokens": null} — forwarding that null fails the turn with
// "serialization error: invalid type: null, expected u32". Usage must never
// serialize a null (or NaN) token value to a client.
describe("usage null sanitization", () => {
  it("filterUsageForFormat coerces null detail fields to 0 (vLLM-style upstream)", () => {
    const out = filterUsageForFormat(
      {
        prompt_tokens: 2150,
        completion_tokens: 87,
        total_tokens: 2237,
        prompt_tokens_details: { cached_tokens: null, text_tokens: null, audio_tokens: null, image_tokens: null },
        completion_tokens_details: { reasoning_tokens: null },
      },
      "openai"
    );
    expect(JSON.stringify(out)).not.toContain("null");
    expect(out.prompt_tokens_details.cached_tokens).toBe(0);
    expect(out.completion_tokens_details.reasoning_tokens).toBe(0);
  });

  it("filterUsageForFormat drops null top-level counters but keeps numbers and the estimated flag", () => {
    const out = filterUsageForFormat(
      { prompt_tokens: 12, completion_tokens: null, total_tokens: NaN, cached_tokens: null, estimated: true },
      "openai"
    );
    expect(out.prompt_tokens).toBe(12);
    expect(out.estimated).toBe(true);
    expect(out.completion_tokens).toBeUndefined();
    expect(out.cached_tokens).toBeUndefined();
    expect(JSON.stringify(out)).not.toContain("null");
  });

  it("sanitizeUsageForClient coerces numeric strings and drops NaN", () => {
    const out = sanitizeUsageForClient({ prompt_tokens: "123", completion_tokens: Number.NaN, estimated: true });
    expect(out.prompt_tokens).toBe(123);
    expect(out.completion_tokens).toBeUndefined();
    expect(out.estimated).toBe(true);
  });

  it("sanitizeUsageForClient drops detail objects that contain no usable values", () => {
    const out = sanitizeUsageForClient({ prompt_tokens: 5, prompt_tokens_details: { unknown_field: null } });
    expect(out.prompt_tokens).toBe(5);
    expect(out.prompt_tokens_details).toBeUndefined();
  });

  it("normalizeUsage no longer forwards raw provider details with nulls", () => {
    const out = normalizeUsage({
      prompt_tokens: 100,
      completion_tokens: 10,
      prompt_tokens_details: { cached_tokens: null },
      completion_tokens_details: { reasoning_tokens: null },
    });
    expect(out.prompt_tokens_details.cached_tokens).toBe(0);
    expect(out.completion_tokens_details.reasoning_tokens).toBe(0);
  });

  it("addBufferToUsage never invents tokens from null (null + 2000 used to yield 2000)", () => {
    const out = addBufferToUsage({ prompt_tokens: null, completion_tokens: 5 });
    expect(out.prompt_tokens).toBe(null);
    expect(out.total_tokens).toBeUndefined();
  });

  it("full streaming pipeline (extract → merge → buffer → filter) emits no nulls", () => {
    const finalChunk = {
      choices: [{ finish_reason: "stop" }],
      usage: {
        prompt_tokens: 2150,
        completion_tokens: 87,
        total_tokens: 2237,
        prompt_tokens_details: { cached_tokens: null },
        completion_tokens_details: { reasoning_tokens: null },
      },
    };
    let usage = null;
    const extracted = extractUsage(finalChunk);
    if (extracted) usage = mergeUsage(usage, extracted);
    const out = filterUsageForFormat(addBufferToUsage(usage), "openai");
    expect(JSON.stringify(out)).not.toContain("null");
    expect(out.prompt_tokens).toBeGreaterThan(0);
    expect(out.completion_tokens).toBe(87);
  });

  it("valid cache numbers survive sanitization", () => {
    const out = filterUsageForFormat(
      { prompt_tokens: 330, completion_tokens: 50, total_tokens: 380, prompt_tokens_details: { cached_tokens: 200 } },
      "openai"
    );
    expect(out.prompt_tokens_details.cached_tokens).toBe(200);
  });

  it("claude-format usage passes through with numbers, nulls dropped", () => {
    const out = filterUsageForFormat(
      { input_tokens: 12, output_tokens: 3, cache_read_input_tokens: null, estimated: true },
      "claude"
    );
    expect(out.input_tokens).toBe(12);
    expect(out.output_tokens).toBe(3);
    expect(out.estimated).toBe(true);
    expect(out.cache_read_input_tokens).toBeUndefined();
  });
});
