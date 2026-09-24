/**
 * The guided tour of the paper that plays during the research chapter.
 * Coordinates are PDF points on a 612 × 792 page, taken from the PDF's own
 * text and drawing positions, so every zoom and highlight lands on the real
 * passage. Pages are rendered to public/research/pages/p{n}.webp.
 */

export type Box = [number, number, number, number]; // x0, y0, x1, y1 in pt

export interface TourStep {
  /** Area the camera frames while this step is read. */
  region: Box;
  /** Lines swept with the highlighter, in reading order. */
  lines: Box[];
  title: string;
  body: string;
}

export interface TourPage {
  n: number;
  steps: TourStep[];
}

export const PAGE_W = 612;
export const PAGE_H = 792;
export const pageSrc = (n: number) => `/research/pages/p${n}.webp`;

export const TOUR: TourPage[] = [
  {
    n: 1,
    steps: [
      {
        region: [45, 344, 305, 436],
        lines: [
          [237.4, 352.9, 300, 361.9],
          [49, 362.9, 300, 371.8],
          [49, 372.8, 248.3, 381.8],
          [265.8, 412.7, 300, 421.6],
          [49, 422.6, 191.2, 431.6],
        ],
        title: "The headline.",
        body: "On 7,104 fresh queries the router scores 39.428% to GPT-5's 39.626%, while recorded cost falls 1.034%.",
      },
      {
        region: [308, 300, 566, 372],
        lines: [
          [321.9, 326.5, 539.4, 336.4],
          [312, 338.4, 447.2, 348.4],
        ],
        title: "Protocol is part of the problem.",
        body: "Small effects are easy to fake by accident, so the evaluation is designed as carefully as the router.",
      },
    ],
  },
  {
    n: 2,
    steps: [
      {
        region: [58, 46, 292, 182],
        lines: [[64.2, 167.2, 284.8, 175.2]],
        title: "Two cohorts, never mixed.",
        body: "3,450 development queries to build the router, and 7,853 fresh ones from five unused benchmarks to test it once.",
      },
      {
        region: [45, 616, 305, 690],
        lines: [
          [178.3, 648.9, 300, 658.8],
          [49, 660.8, 193.7, 670.8],
          [200.5, 660.8, 300, 670.8],
          [49, 672.8, 257.5, 682.7],
        ],
        title: "Sealed before opened.",
        body: "Queries, embeddings and every router's choices were hashed before any fresh outcome was seen. Nothing changed afterwards.",
      },
      {
        region: [308, 240, 566, 336],
        lines: [[312, 281.4, 560.5, 291.3]],
        title: "The bar, set in advance.",
        body: "The router passes only if its accuracy interval stays above −0.569 points, a margin derived from development data alone.",
      },
    ],
  },
  {
    n: 3,
    steps: [
      {
        region: [49, 50, 300, 262],
        lines: [
          [145.7, 165.9, 203, 175.8],
          [145.7, 176.4, 203, 186],
        ],
        title: "Route only when it's safe and cheaper.",
        body: "Each prompt is embedded and scored against GPT-5 for 12 models. One is used only if predicted risk stays within τ and the saving is positive.",
      },
      {
        region: [45, 392, 305, 474],
        lines: [
          [58.9, 399.6, 300, 409.6],
          [49, 411.6, 296.7, 421.5],
          [49, 423.5, 129.6, 433.5],
          [49, 459.2, 241.3, 469.3],
        ],
        title: "Chosen on development only.",
        body: "10,067 operating points and a 349-point Pareto frontier. The cheapest point that passes the accuracy rule sets τ = 0.00537.",
      },
    ],
  },
  {
    n: 4,
    steps: [
      {
        region: [45, 46, 305, 160],
        lines: [[53.9, 91.9, 300, 98.9]],
        title: "Confirmed, narrowly.",
        body: "−0.197 points of accuracy, inside the margin, for a 1.034% saving whose interval stays above zero.",
      },
      {
        region: [45, 168, 305, 384],
        lines: [],
        title: "Where each router lands.",
        body: "RouteLLM saves a little more but loses more accuracy. Avengers-Pro cuts 43% of cost and loses 10 points.",
      },
      {
        region: [308, 424, 566, 500],
        lines: [
          [476, 469.7, 563, 479.7],
          [312, 481.7, 489.6, 491.6],
        ],
        title: "Least accuracy lost per dollar.",
        body: "0.191 points lost per point of cost saved, against 0.340 for RouteLLM and 0.234 for Avengers-Pro.",
      },
      {
        region: [45, 626, 305, 700],
        lines: [
          [233.2, 661.1, 300, 671],
          [49, 673, 207.4, 683],
        ],
        title: "It didn't travel well.",
        body: "Offloads fell from 10.4% on development to 1.9% on fresh data, which makes distribution shift a central result.",
      },
    ],
  },
  {
    n: 5,
    steps: [
      {
        region: [45, 146, 305, 424],
        lines: [
          [49, 360.2, 297.5, 370.2],
          [113.2, 408, 260.8, 418],
        ],
        title: "Routing isn't free.",
        body: "Median router overhead is 46.7 ms, but long SWE-Bench prompts take about 4.4 s, and the router never offloads them.",
      },
      {
        region: [45, 500, 305, 566],
        lines: [
          [49, 535, 300, 544.9],
          [49, 546.9, 298.2, 556.9],
        ],
        title: "When routing pays off.",
        body: "A routed query only saves time when the cheaper model answers more than 46.7 ms faster at the median.",
      },
      {
        region: [308, 612, 566, 690],
        lines: [
          [321.9, 649.1, 455, 659.1],
          [459.5, 649.1, 563, 659.1],
          [312, 661.1, 559.7, 671],
        ],
        title: "Intentionally narrow.",
        body: "No accuracy-equivalence claim and no latency claim: a small, real saving next to a small, real loss.",
      },
    ],
  },
];

/* ── layout ─────────────────────────────────────────────────────────────── */

/** Once zoomed in, the pages sit in one column so the camera can pan straight through. */
export const PAGE_GAP = 28;
export const pageTop = (n: number) => (n - 1) * (PAGE_H + PAGE_GAP);

/** Where the later pages rest, tucked behind page 1, in the opening overview. */
const TUCK = [
  { x: -8, y: 5, r: -2.4 },
  { x: -22, y: 14, r: -6 },
  { x: -12, y: 22, r: -3.6 },
  { x: -30, y: 18, r: -8.5 },
];
export const tuck = (i: number) => TUCK[(i - 1) % TUCK.length];

/** The box the overview frames: page 1 plus the fanned stack behind it. */
export const STACK_BOX: Box = [-90, -40, PAGE_W + 30, PAGE_H + 80];

/* ── schedule, in beats ─────────────────────────────────────────────────── */

export const TOUR_TIMING = {
  enter: 0.45, // laptop slides aside, page 1 settles
  stack: 0.5, // the other pages slide in behind it, one after another
  overview: 0.2, // the whole stack, before zooming
  zoomIn: 0.36, // into the first passage; the stack opens into a column meanwhile
  move: 0.22, // camera travel between passages on a page
  pageMove: 0.32, // camera travel onto the next page
  hold: 0.42, // reading time, highlighter included
  exit: 0.45, // paper leaves, laptop returns
};

export interface ScheduledStep extends TourStep {
  page: number;
  id: string;
  moveAt: number;
  holdAt: number;
  holdEnd: number;
}

export interface TourSchedule {
  start: number;
  /** Page 1 has settled; the stack starts sliding in. */
  stackAt: number;
  /** The camera leaves the overview. */
  zoomAt: number;
  steps: ScheduledStep[];
  exitAt: number;
  end: number;
}

export function tourSchedule(start: number): TourSchedule {
  const T = TOUR_TIMING;
  const stackAt = start + T.enter;
  const zoomAt = stackAt + T.stack + T.overview;
  let t = zoomAt;
  const steps: ScheduledStep[] = [];
  TOUR.forEach((pg) =>
    pg.steps.forEach((s, si) => {
      const travel = steps.length === 0 ? T.zoomIn : si === 0 ? T.pageMove : T.move;
      const moveAt = t;
      const holdAt = t + travel;
      const holdEnd = holdAt + T.hold;
      steps.push({ ...s, page: pg.n, id: `tour-${pg.n}-${si}`, moveAt, holdAt, holdEnd });
      t = holdEnd;
    }),
  );
  return { start, stackAt, zoomAt, steps, exitAt: t, end: t + T.exit };
}
