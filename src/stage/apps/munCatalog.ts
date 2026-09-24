/**
 * MŪN's real model catalog, fetched from its production backend's public
 * /models endpoint (458 models from 63 labs), grouped and ordered exactly as
 * ModelLibraryPage does: known labs first, then by number of models.
 */

export interface VendorGroup {
  slug: string;
  label: string;
  count: number;
  color: string | null;
  blurb: string;
  logo: string | null;
}

export interface CatalogModel {
  id: string;
  name: string;
  ctx: number;
  vision: boolean;
  free: boolean;
}

/** The two models the demo switches on: Claude Opus 5.5 and Claude Sonnet 5. */
export const MUN_PICKS = [18, 26];

export const CATALOG_SIZE = 458;

export const VENDOR_GROUPS: VendorGroup[] = [
  {
    "slug": "openai",
    "label": "OpenAI",
    "count": 100,
    "color": "#4ade80",
    "blurb": "GPT: versatile generalists with strong tool use.",
    "logo": "openai.svg"
  },
  {
    "slug": "qwen",
    "label": "Qwen",
    "count": 54,
    "color": "#a78bfa",
    "blurb": "Alibaba's multilingual family, strong at code and math.",
    "logo": "qwen-color.svg"
  },
  {
    "slug": "google",
    "label": "Google",
    "count": 41,
    "color": "#60a5fa",
    "blurb": "Gemini: fast multimodal models with huge context.",
    "logo": "google-color.svg"
  },
  {
    "slug": "anthropic",
    "label": "Anthropic",
    "count": 28,
    "color": "#e8855a",
    "blurb": "Claude: deep reasoning, long context, careful answers.",
    "logo": "anthropic.svg"
  },
  {
    "slug": "mistralai",
    "label": "Mistral",
    "count": 23,
    "color": "#fb923c",
    "blurb": "Efficient open-weight and frontier models from Europe.",
    "logo": "mistral-color.svg"
  },
  {
    "slug": "deepseek",
    "label": "DeepSeek",
    "count": 16,
    "color": "#38bdf8",
    "blurb": "Frontier-grade reasoning at open-source prices.",
    "logo": "deepseek-color.svg"
  },
  {
    "slug": "nvidia",
    "label": "NVIDIA",
    "count": 10,
    "color": "#a3e635",
    "blurb": "Nemotron: open models tuned for helpfulness.",
    "logo": "nvidia-color.svg"
  },
  {
    "slug": "meta-llama",
    "label": "Meta",
    "count": 8,
    "color": "#c084fc",
    "blurb": "Llama: open-weight workhorses at every size.",
    "logo": "meta-color.svg"
  },
  {
    "slug": "moonshotai",
    "label": "Moonshot",
    "count": 8,
    "color": "#e879f9",
    "blurb": "Kimi: long-context models from Moonshot AI.",
    "logo": "moonshot.svg"
  },
  {
    "slug": "x-ai",
    "label": "xAI",
    "count": 8,
    "color": "#e2e8f0",
    "blurb": "Grok: real-time knowledge with an edge.",
    "logo": "xai.svg"
  },
  {
    "slug": "cohere",
    "label": "Cohere",
    "count": 6,
    "color": "#f472b6",
    "blurb": "Command: enterprise retrieval and RAG specialists.",
    "logo": "cohere-color.svg"
  },
  {
    "slug": "amazon",
    "label": "Amazon",
    "count": 5,
    "color": "#fbbf24",
    "blurb": "Nova: fast, low-cost models built for AWS.",
    "logo": "bedrock-color.svg"
  },
  {
    "slug": "perplexity",
    "label": "Perplexity",
    "count": 5,
    "color": "#2dd4bf",
    "blurb": "Sonar: search-grounded answers with citations.",
    "logo": "perplexity-color.svg"
  },
  {
    "slug": "microsoft",
    "label": "Microsoft",
    "count": 2,
    "color": "#93c5fd",
    "blurb": "Phi: small models that punch above their weight.",
    "logo": "microsoft-color.svg"
  },
  {
    "slug": "z-ai",
    "label": "Z Ai",
    "count": 19,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "minimax",
    "label": "Minimax",
    "count": 8,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "tencent",
    "label": "Tencent",
    "count": 7,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "aion-labs",
    "label": "Aion Labs",
    "count": 6,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "bytedance-seed",
    "label": "Bytedance Seed",
    "count": 6,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "meta",
    "label": "Meta",
    "count": 6,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "openrouter",
    "label": "Openrouter",
    "count": 6,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "inclusionai",
    "label": "Inclusionai",
    "count": 5,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "xiaomi",
    "label": "Xiaomi",
    "count": 5,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "~openai",
    "label": "~openai",
    "count": 5,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "poolside",
    "label": "Poolside",
    "count": 4,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "sakana",
    "label": "Sakana",
    "count": 4,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "thinkingmachines",
    "label": "Thinkingmachines",
    "count": 4,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "~anthropic",
    "label": "~anthropic",
    "count": 4,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "nousresearch",
    "label": "Nousresearch",
    "count": 3,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "sao10k",
    "label": "Sao10k",
    "count": 3,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "thedrummer",
    "label": "Thedrummer",
    "count": 3,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "upstage",
    "label": "Upstage",
    "count": 3,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "~deepseek",
    "label": "~deepseek",
    "count": 3,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "ibm-granite",
    "label": "Ibm Granite",
    "count": 2,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "inception",
    "label": "Inception",
    "count": 2,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "inference-net",
    "label": "Inference Net",
    "count": 2,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "morph",
    "label": "Morph",
    "count": 2,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "nex-agi",
    "label": "Nex Agi",
    "count": 2,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "rekaai",
    "label": "Rekaai",
    "count": 2,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "relace",
    "label": "Relace",
    "count": 2,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "stepfun",
    "label": "Stepfun",
    "count": 2,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "~google",
    "label": "~google",
    "count": 2,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "~z-ai",
    "label": "~z Ai",
    "count": 2,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "anthracite-org",
    "label": "Anthracite Org",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "arcee-ai",
    "label": "Arcee Ai",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "baidu",
    "label": "Baidu",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "bytedance",
    "label": "Bytedance",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "cognitivecomputations",
    "label": "Cognitivecomputations",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "dots-studio",
    "label": "Dots Studio",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "fireworks",
    "label": "Fireworks",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "gryphe",
    "label": "Gryphe",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "kwaipilot",
    "label": "Kwaipilot",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "liquid",
    "label": "Liquid",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "mancer",
    "label": "Mancer",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "meituan",
    "label": "Meituan",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "perceptron",
    "label": "Perceptron",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "prism-ml",
    "label": "Prism Ml",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "stealth",
    "label": "Stealth",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "unbiased",
    "label": "Unbiased",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "undi95",
    "label": "Undi95",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "writer",
    "label": "Writer",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "~moonshotai",
    "label": "~moonshotai",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  },
  {
    "slug": "~x-ai",
    "label": "~x Ai",
    "count": 1,
    "color": null,
    "blurb": "Community and specialist models.",
    "logo": null
  }
];

export const ANTHROPIC_MODELS: CatalogModel[] = [
  {
    "id": "anthropic/claude-3-haiku",
    "name": "Claude 3 Haiku",
    "ctx": 200000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-fable-5",
    "name": "Claude Fable 5",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-fable-5.1",
    "name": "Claude Fable 5.1",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-fable-5.1:batch",
    "name": "Claude Fable 5.1 (batch)",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-fable-5:batch",
    "name": "Claude Fable 5 (batch)",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-haiku-4.5",
    "name": "Claude Haiku 4.5",
    "ctx": 200000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-haiku-4.5:batch",
    "name": "Claude Haiku 4.5 (batch)",
    "ctx": 200000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-4.1",
    "name": "Claude Opus 4.1",
    "ctx": 200000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-4.1:batch",
    "name": "Claude Opus 4.1 (batch)",
    "ctx": 200000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-4.5",
    "name": "Claude Opus 4.5",
    "ctx": 200000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-4.5:batch",
    "name": "Claude Opus 4.5 (batch)",
    "ctx": 200000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-4.6",
    "name": "Claude Opus 4.6",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-4.6:batch",
    "name": "Claude Opus 4.6 (batch)",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-4.7",
    "name": "Claude Opus 4.7",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-4.7:batch",
    "name": "Claude Opus 4.7 (batch)",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-4.8",
    "name": "Claude Opus 4.8",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-4.8:batch",
    "name": "Claude Opus 4.8 (batch)",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-5",
    "name": "Claude Opus 5",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-5.5",
    "name": "Claude Opus 5.5",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-5.5:batch",
    "name": "Claude Opus 5.5 (batch)",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-opus-5:batch",
    "name": "Claude Opus 5 (batch)",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-sonnet-4",
    "name": "Claude Sonnet 4",
    "ctx": 200000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-sonnet-4.5",
    "name": "Claude Sonnet 4.5",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-sonnet-4.5:batch",
    "name": "Claude Sonnet 4.5 (batch)",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-sonnet-4.6",
    "name": "Claude Sonnet 4.6",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-sonnet-4.6:batch",
    "name": "Claude Sonnet 4.6 (batch)",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-sonnet-5",
    "name": "Claude Sonnet 5",
    "ctx": 1000000,
    "vision": true,
    "free": false
  },
  {
    "id": "anthropic/claude-sonnet-5:batch",
    "name": "Claude Sonnet 5 (batch)",
    "ctx": 1000000,
    "vision": true,
    "free": false
  }
];
