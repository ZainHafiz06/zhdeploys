/**
 * Every number here is taken from "Beyond Best-Single: Empirical Multi-Model
 * Routing Across Accuracy, Cost, and Routing Overhead" (Z. Hafiz), as
 * submitted to IEEE BigData 2026. Values marked `fromFigure` are read off the
 * vector geometry of Fig. 5 (log axis), not stated in the text.
 */

export const PAPER = {
  slug: "beyond-best-single",
  title: "Beyond Best-Single: Empirical Multi-Model Routing Across Accuracy, Cost, and Routing Overhead",
  short: "Beyond Best-Single",
  author: "Zain Hafiz",
  affiliation: "College of Engineering, The University of North Texas, Denton, TX, USA",
  email: "ZainHafiz@my.unt.edu",
  venue: "IEEE BigData 2026",
  status: "Submitted",
  pdf: "/research/beyond-best-single.pdf",
  indexTerms: [
    "large language models",
    "model routing",
    "inference optimization",
    "cost-aware inference",
    "leakage control",
    "paired evaluation",
  ],
} as const;

/** Table I — development and fresh confirmation cohorts. */
export const COHORTS = [
  { dataset: "AIME", queries: 48, role: "Development" },
  { dataset: "GPQA", queries: 158, role: "Development" },
  { dataset: "LiveCodeBench", queries: 844, role: "Development" },
  { dataset: "MMLU-Pro", queries: 2400, role: "Development" },
  { dataset: "LiveMathBench", queries: 121, role: "Confirmation" },
  { dataset: "SWE-Bench Verified", queries: 500, role: "Confirmation" },
  { dataset: "HLE", queries: 2157, role: "Confirmation" },
  { dataset: "SimpleQA", queries: 4326, role: "Confirmation" },
  { dataset: "Arena-Hard", queries: 749, role: "Confirmation" },
] as const;
export const DEV_TOTAL = 3450;
export const CONF_TOTAL = 7853;

export type SystemId = "gpt5" | "proposed" | "routellm" | "avengers";

/** Table II — fresh common-protocol results. */
export const SYSTEMS: {
  id: SystemId;
  name: string;
  acc: number;
  dAcc: number;
  arena: number;
  cost: number;
  costRed: number;
  lossPerSave: number | null;
}[] = [
  { id: "gpt5", name: "GPT-5", acc: 39.626, dAcc: 0.0, arena: 0.6976, cost: 250.9594, costRed: 0.0, lossPerSave: null },
  { id: "proposed", name: "Proposed (V2)", acc: 39.428, dAcc: -0.197, arena: 0.6983, cost: 248.3636, costRed: 1.034, lossPerSave: 0.191 },
  { id: "routellm", name: "RouteLLM", acc: 39.091, dAcc: -0.535, arena: 0.6896, cost: 247.0085, costRed: 1.574, lossPerSave: 0.34 },
  { id: "avengers", name: "Avengers-Pro", acc: 29.575, dAcc: -10.051, arena: 0.6909, cost: 143.0427, costRed: 43.002, lossPerSave: 0.234 },
];

/** Primary confirmation statistics. */
export const RESULTS = {
  binaryQueries: 7104,
  gpt5Correct: 2815,
  v2Correct: 2801,
  dAcc: -0.197,
  dAccCI: [-0.38, -0.014] as [number, number],
  margin: 0.568656, // δ in percentage points
  rescued: 14,
  broken: 28,
  mcnemarP: 0.0436,
  gpt5Cost: 250.959431,
  v2Cost: 248.363575,
  saving: 2.595857,
  costRed: 1.034,
  costRedCI: [0.642, 1.498] as [number, number],
  savingPerQuery: 0.0003306,
  macroGpt5: 42.342,
  macroV2: 42.226,
  macroDiff: -0.116,
  macroCI: [-0.209, -0.029] as [number, number],
  arenaGpt5: 0.697597,
  arenaV2: 0.698264,
  arenaDiff: 0.000668,
  arenaCI: [-0.003338, 0.00534] as [number, number],
  offloads: 148,
  offloadRate: 1.885,
  retained: 7705,
  bootstrapReplicates: 20000,
};

/** Fig. 4 — recorded cost reduction and offloads by confirmation dataset. */
export const BY_DATASET = [
  { dataset: "SimpleQA", costRed: 1.957, offloads: 96 },
  { dataset: "HLE", costRed: 0.919, offloads: 37 },
  { dataset: "Arena-Hard", costRed: 0.662, offloads: 11 },
  { dataset: "LiveMathBench", costRed: 0.669, offloads: 4 },
  { dataset: "SWE-Bench", costRed: 0, offloads: 0 },
];

/** Section VI-C — the same router on development vs fresh confirmation. */
export const TRANSPORT = {
  dev: { offloads: 359, of: 3450, rate: 10.41, costRed: 4.41, ci: [3.155, 5.741] as [number, number], dAcc: -0.203, dAccCI: [-0.522, 0.087] as [number, number] },
  conf: { offloads: 148, of: 7853, rate: 1.885, costRed: 1.034, ci: [0.642, 1.498] as [number, number], dAcc: -0.197, dAccCI: [-0.38, -0.014] as [number, number] },
};

/** Section IV-B — development frontier and frozen operating point. */
export const FRONTIER = {
  realized: 10067,
  pareto: 349,
  passing: 7,
  tauZero: { costRed: 2.31, dAcc: -0.029 },
  tau: 0.00537,
};

/** Table III — local batch-1 router overhead on 256 queries (ms). */
export const OVERHEAD = [
  { component: "Prompt embedding", median: 45.291, p95: 4175.691, mean: 343.836 },
  { component: "Scoring + selection", median: 1.348, p95: 1.755, mean: 1.435 },
  { component: "Total router", median: 46.734, p95: 4178.167, mean: 345.27 },
];

/** Fig. 5 — per-dataset router overhead (ms), read from the figure's log axis. */
export const OVERHEAD_BY_DATASET = [
  { dataset: "LiveMathBench", median: 74.8, p95: 89.9 },
  { dataset: "HLE", median: 82.9, p95: 284.9 },
  { dataset: "SimpleQA", median: 24.8, p95: 109.6 },
  { dataset: "Arena-Hard", median: 56.9, p95: 376.8 },
  { dataset: "SWE-Bench", median: 4389, p95: 4454 },
];

export const REFERENCES = [
  { n: 1, text: 'H. Li et al., "LLMRouterBench: A Massive Benchmark and Unified Framework for LLM Routing," in Findings of the Association for Computational Linguistics: ACL 2026, San Diego, CA, USA, 2026, pp. 37733-37754.', doi: "10.18653/v1/2026.findings-acl.1881" },
  { n: 2, text: 'I. Ong, A. Almahairi, V. Wu, W.-L. Chiang, T. Wu, J. E. Gonzalez, M. W. Kadous, and I. Stoica, "RouteLLM: Learning to Route LLMs from Preference Data," in Proc. 13th Int. Conf. Learn. Representations (ICLR), 2025.' },
  { n: 3, text: 'T. Feng, Y. Shen, and J. You, "GraphRouter: A Graph-Based Router for LLM Selections," in Proc. 13th Int. Conf. Learn. Representations (ICLR), 2025.' },
  { n: 4, text: 'Y. Zhang, H. Li, J. Chen, H. Zhang, P. Ye, L. Bai, and S. Hu, "Beyond GPT-5: Making LLMs Cheaper and Better via Performance-Efficiency Optimized Routing," in Proc. 2025 7th Int. Conf. Distributed Artificial Intelligence (DAI), London, U.K., 2025, pp. 122-129.', doi: "10.1145/3772429.3772445" },
  { n: 5, text: 'S. Chen, W. Jiang, B. Lin, J. T. Kwok, and Y. Zhang, "RouterDC: Query-Based Router by Dual Contrastive Learning for Assembling Large Language Models," in Advances in Neural Information Processing Systems, vol. 37, 2024, pp. 66305-66328.', doi: "10.52202/079017-2120" },
  { n: 6, text: 'J. Chen, S. Xiao, P. Zhang, K. Luo, D. Lian, and Z. Liu, "M3-Embedding: Multi-Linguality, Multi-Functionality, Multi-Granularity Text Embeddings Through Self-Knowledge Distillation," in Findings of ACL 2024, Bangkok, Thailand, 2024, pp. 2318-2335.', doi: "10.18653/v1/2024.findings-acl.137" },
  { n: 7, text: 'D. Rein, B. L. Hou, A. C. Stickland, J. Petty, R. Y. Pang, J. Dirani, J. Michael, and S. R. Bowman, "GPQA: A Graduate-Level Google-Proof Q&A Benchmark," in Proc. 1st Conf. Language Modeling (COLM), 2023.' },
  { n: 8, text: 'N. Jain, K. Han, A. Gu, W.-D. Li, F. Yan, T. Zhang, S. Wang, A. Solar-Lezama, K. Sen, and I. Stoica, "LiveCodeBench: Holistic and Contamination Free Evaluation of Large Language Models for Code," in Proc. 13th Int. Conf. Learn. Representations (ICLR), 2025.' },
  { n: 9, text: 'Y. Wang et al., "MMLU-Pro: A More Robust and Challenging Multi-Task Language Understanding Benchmark," in Advances in Neural Information Processing Systems, vol. 37, 2024, pp. 95266-95290.', doi: "10.52202/079017-3018" },
  { n: 10, text: 'F. Pedregosa et al., "Scikit-learn: Machine Learning in Python," J. Mach. Learn. Res., vol. 12, no. 85, pp. 2825-2830, 2011.' },
  { n: 11, text: 'J. Liu, H. Liu, L. Xiao, Z. Wang, K. Liu, S. Gao, W. Zhang, S. Zhang, and K. Chen, "Are Your LLMs Capable of Stable Reasoning?" in Findings of the Association for Computational Linguistics: ACL 2025, Vienna, Austria, 2025, pp. 17594-17632.', doi: "10.18653/v1/2025.findings-acl.905" },
  { n: 12, text: 'C. E. Jimenez, J. Yang, A. Wettig, S. Yao, K. Pei, O. Press, and K. R. Narasimhan, "SWE-Bench: Can Language Models Resolve Real-World GitHub Issues?" in Proc. 12th Int. Conf. Learn. Representations (ICLR), 2024.' },
  { n: 13, text: 'Center for AI Safety, Scale AI, and HLE Contributors Consortium, "A Benchmark of Expert-Level Academic Questions to Assess AI Capabilities," Nature, vol. 649, pp. 1139-1146, 2026.', doi: "10.1038/s41586-025-09962-4" },
  { n: 14, text: 'J. Wei, K. Nguyen, H. W. Chung, Y. J. Jiao, S. Papay, A. Glaese, J. Schulman, and W. Fedus, "Measuring Short-Form Factuality in Large Language Models," arXiv:2411.04368, 2024.', url: "https://arxiv.org/abs/2411.04368" },
  { n: 15, text: 'T. Li, W.-L. Chiang, E. Frick, L. Dunlap, T. Wu, B. Zhu, J. E. Gonzalez, and I. Stoica, "From Crowdsourced Data to High-Quality Benchmarks: Arena-Hard and BenchBuilder Pipeline," arXiv:2406.11939, 2024.', url: "https://arxiv.org/abs/2406.11939" },
];
