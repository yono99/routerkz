export default {
  id: "opencode",
  priority: 40,
  hasFree: true,
  alias: "oc",
  uiAlias: "oc",
  display: {
    name: "OpenCode Free",
    icon: "terminal",
    color: "#E87040",
    textIcon: "OC",
  },
  category: "free",
  noAuth: true,
  transport: {
    baseUrl: "https://opencode.ai",
    headers: {
      "x-opencode-client": "desktop",
    },
    noAuth: true,
  },
  // Free tier dipatok statis supaya tidak bergantung pada modelsFetcher saat
  // startup (fetch yang gagal = provider tak menyajikan satu model pun).
  // Muse Spark dilayani /zen/v1/responses; sisanya /chat/completions.
  models: [
    { id: "muse-spark-1.2-contributor-free", name: "Muse Spark 1.2 Contributor Free", targetFormat: "openai-responses" },
    { id: "muse-spark-1.3-contributor-free", name: "Muse Spark 1.3 Contributor Free", targetFormat: "openai-responses" },
    { id: "big-pickle", name: "Big Pickle" },
    { id: "deepseek-v4-flash-free", name: "DeepSeek V4 Flash Free" },
    { id: "fledge-alpha-free", name: "Fledge Alpha Free" },
    { id: "jev-1.13-free", name: "Jev 1.13 Free" },
    { id: "ling-3.0-flash-fin-free", name: "Ling 3.0 Flash Fin Free" },
    { id: "ling-3.1-flash-free", name: "Ling 3.1 Flash Free" },
    { id: "longcat-2.5-preview-free", name: "LongCat 2.5 Preview Free" },
    { id: "mimo-v2.5-free", name: "MiMo V2.5 Free" },
    { id: "mimo-v2.6-flash-free", name: "MiMo V2.6 Flash Free" },
    { id: "nemotron-3-ultra-free", name: "Nemotron 3 Ultra Free" },
    { id: "nemotron-3.5-lightning-free", name: "Nemotron 3.5 Lightning Free" },
    { id: "space-bunny-free", name: "Space Bunny Free" },
  ],
  modelsFetcher: { url: "https://opencode.ai/zen/v1/models", type: "opencode-free" },
  passthroughModels: true,
};
