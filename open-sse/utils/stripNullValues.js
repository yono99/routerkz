// Strip null-valued properties from a request payload, recursively.
//
// Several OpenAI-compatible backends deserialize their request schema with
// Rust serde, where numeric fields are typed as non-nullable u32/f64. Any
// explicit JSON null in one of those positions — a top-level param, an echoed
// tool_calls[].index, a tool-schema keyword, anywhere — fails the request
// with `invalid type: null, expected u32` even when the field is
// semantically optional. Absent and null are equivalent for all of them, so
// the whole class of failures is removed by dropping null-valued properties.
//
// Array ELEMENTS are left untouched (a null inside e.g. a JSON-schema enum is
// schema content for the model, not a request field value), and the
// `content` key is preserved because assistant tool-call messages use
// `content: null` by OpenAI wire convention and backends accept it.
const NULL_PRESERVED_KEY = "content";

export function stripNullValues(node) {
  if (Array.isArray(node)) {
    for (const item of node) {
      if (item && typeof item === "object") stripNullValues(item);
    }
    return node;
  }
  if (node && typeof node === "object") {
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (value === null) {
        if (key !== NULL_PRESERVED_KEY) delete node[key];
      } else if (typeof value === "object") {
        stripNullValues(value);
      }
    }
  }
  return node;
}
