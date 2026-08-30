import { describe, it, expect } from "vitest";
import { stripNullValues } from "../../open-sse/utils/stripNullValues.js";

describe("stripNullValues", () => {
  it("removes null-valued properties at every nesting level", () => {
    const body = {
      model: "m",
      max_tokens: null,
      metadata: { nullable: null, keep: 1 },
      tools: [
        {
          type: "function",
          function: {
            name: "bash",
            parameters: { type: "object", properties: { x: { type: "string", maxLength: null } } },
          },
        },
      ],
      messages: [
        { role: "assistant", content: null, tool_calls: [{ id: "c1", index: null, function: { name: "f" } }] },
      ],
    };
    const out = stripNullValues(body);

    expect(out).not.toHaveProperty("max_tokens");
    expect(out.metadata).toEqual({ keep: 1 });
    expect(out.tools[0].function.parameters.properties.x).not.toHaveProperty("maxLength");
    expect(out.messages[0].tool_calls[0]).not.toHaveProperty("index");
    // assistant tool-call messages keep their null content (OpenAI convention)
    expect(out.messages[0].content).toBeNull();
    // untouched siblings survive
    expect(out.tools[0].function.name).toBe("bash");
    expect(out.messages[0].tool_calls[0].id).toBe("c1");
  });

  it("keeps null array elements (schema content) while stripping object properties", () => {
    const body = {
      tools: [{ function: { parameters: { properties: { v: { enum: ["a", null] } } } } }],
    };
    const out = stripNullValues(body);
    expect(out.tools[0].function.parameters.properties.v.enum).toEqual(["a", null]);
  });

  it("returns primitives untouched", () => {
    expect(stripNullValues(null)).toBeNull();
    expect(stripNullValues("x")).toBe("x");
    expect(stripNullValues(5)).toBe(5);
  });
});
