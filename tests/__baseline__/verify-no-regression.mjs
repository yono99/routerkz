// Gate: so kết quả test hiện tại với baseline known-fails.
// PASS nếu KHÔNG có test nào pass(baseline) → fail(now). Test mới được phép.
// Usage: node tests/__baseline__/verify-no-regression.mjs <current-results.json>
import { readFileSync } from "fs";

const knownFails = new Set(
  readFileSync(new URL("./known-fails.txt", import.meta.url), "utf8")
    .split("\n").map(s => s.trim()).filter(Boolean)
);

const resultsPath = process.argv[2];
if (!resultsPath) { console.error("Missing results.json path"); process.exit(2); }

const r = JSON.parse(readFileSync(resultsPath, "utf8"));
// CI reports files as "/app/tests/..."; on dev machines the path is absolute
// (e.g. "C:/.../routerkz/tests/..."). Normalize both to "tests/..." so the
// known-fails comparison works everywhere.
const relativeFile = (name) => {
  if (name.includes("/tests/") || name.includes("\\tests\\")) {
    return "tests/" + name.split("/tests/").pop().split("\\tests\\").pop();
  }
  return name.split("/app/")[1] ?? name;
};
const nowFails = r.testResults.flatMap(f =>
  f.assertionResults.filter(a => a.status === "failed")
    .map(a => relativeFile(f.name) + " :: " + a.fullName)
);

// Regression = fail bây giờ NHƯNG không có trong baseline known-fails
const regressions = nowFails.filter(f => !knownFails.has(f));

if (regressions.length) {
  console.error(`\n❌ REGRESSION: ${regressions.length} test pass→fail:\n`);
  regressions.forEach(f => console.error("  - " + f));
  process.exit(1);
}
console.log(`✅ No regression. (now fails=${nowFails.length}, baseline known=${knownFails.size}, all known)`);
