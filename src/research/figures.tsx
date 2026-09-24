import { useMemo, useState } from "react";
import {
  BY_DATASET,
  COHORTS,
  CONF_TOTAL,
  DEV_TOTAL,
  FRONTIER,
  OVERHEAD,
  OVERHEAD_BY_DATASET,
  RESULTS,
  SYSTEMS,
  TRANSPORT,
  type SystemId,
} from "./data";
import { SYSTEM_COLOR, scale } from "./chart";

/* ── shared helpers ─────────────────────────────────────────────────────── */

const fmt = (v: number, d = 3) => v.toFixed(d);
const pp = (v: number, d = 3) => `${v > 0 ? "+" : ""}${v.toFixed(d)}`;


function Toggle<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="p-toggle" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

export function Figure({ n, caption, children, controls, wide = false, id }: { n: string; caption: React.ReactNode; children: React.ReactNode; controls?: React.ReactNode; wide?: boolean; id?: string }) {
  return (
    <figure className={`p-fig ${wide ? "wide" : ""}`} id={id}>
      {controls && <div className="p-fig-controls">{controls}</div>}
      <div className="p-fig-body">{children}</div>
      <figcaption>
        <b>{n}.</b> {caption}
      </figcaption>
    </figure>
  );
}

/* ── Fig. 1: the frozen routing pipeline, and the gate rule to try ─────── */

const STAGES = [
  { k: "Incoming query prompt", d: "Only the prompt text. Dataset identity, model outputs, realized correctness and realized cost never enter the router." },
  { k: "BAAI/bge-m3 embedding", d: "Each prompt becomes a 1,024-dimensional float32 vector, with application-level normalization disabled." },
  { k: "GPT-5-relative heads", d: "Per alternative model: an L2-regularized multinomial logistic head predicts rescue / break / tie, giving D̂ = P̂(rescue) − P̂(break); a Ridge head (α = 1) predicts the dollar saving Ŝ." },
  { k: "Eligibility gate", d: "A model is eligible only when D̂ ≥ −τ and Ŝ > 0. The risk budget τ was selected on development data only." },
  { k: "Selection", d: "Choose the eligible model with the largest Ŝ (ties: larger D̂, then canonical name). If none qualifies, use GPT-5." },
];

export function PipelineFig() {
  const [active, setActive] = useState(3);
  return (
    <div className="p-pipeline">
      <ol>
        {STAGES.map((s, i) => (
          <li key={s.k}>
            <button type="button" className={active === i ? "on" : ""} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}>
              <span className="p-pipe-n">{String(i + 1).padStart(2, "0")}</span>
              {s.k}
            </button>
          </li>
        ))}
      </ol>
      <p className="p-pipe-detail" aria-live="polite">
        {STAGES[active].d}
      </p>
    </div>
  );
}

export function GateExplorer() {
  const [d, setD] = useState(-0.002);
  const [s, setS] = useState(0.0004);
  const [tauKey, setTauKey] = useState<"frozen" | "zero">("frozen");
  const tau = tauKey === "frozen" ? FRONTIER.tau : 0;
  const riskOk = d >= -tau;
  const saveOk = s > 0;
  const eligible = riskOk && saveOk;
  return (
    <div className="p-gate">
      <div className="p-gate-head">
        <span className="p-eyebrow">Try the rule (Eq. 7)</span>
        <Toggle
          label="Risk budget"
          value={tauKey}
          onChange={setTauKey}
          options={[
            ["frozen", `τ = ${FRONTIER.tau} (frozen)`],
            ["zero", "τ = 0"],
          ]}
        />
      </div>
      <p className="p-note">Hypothetical head outputs for one alternative model. Drag to see how the gate decides.</p>
      <label className="p-slider">
        <span>
          D̂ (rescue − break) <b>{pp(d, 4)}</b>
        </span>
        <input type="range" min={-0.02} max={0.02} step={0.0005} value={d} onChange={(e) => setD(+e.target.value)} />
      </label>
      <label className="p-slider">
        <span>
          Ŝ (predicted saving) <b>{s < 0 ? "−" : ""}${Math.abs(s).toFixed(4)}</b>
        </span>
        <input type="range" min={-0.002} max={0.002} step={0.0001} value={s} onChange={(e) => setS(+e.target.value)} />
      </label>
      <div className="p-gate-checks">
        <span className={riskOk ? "ok" : "no"}>
          D̂ ≥ −τ <i>{riskOk ? "✓" : "✕"}</i>
        </span>
        <span className={saveOk ? "ok" : "no"}>
          Ŝ &gt; 0 <i>{saveOk ? "✓" : "✕"}</i>
        </span>
      </div>
      <p className={`p-gate-out ${eligible ? "ok" : ""}`} aria-live="polite">
        {eligible ? "Eligible to offload. It competes on the largest Ŝ." : "Not eligible. The query stays on GPT-5."}
      </p>
    </div>
  );
}

/* ── Eq. 3: the retention test on a number line ─────────────────────────── */

export function RetentionFig({ compact = false }: { compact?: boolean }) {
  const [view, setView] = useState<"binary" | "macro">("binary");
  const [showRoute, setShowRoute] = useState(false);
  const W = 640;
  const H = compact ? 130 : 150;
  const x = scale(-0.7, 0.1, 40, W - 20);
  const ci = view === "binary" ? RESULTS.dAccCI : RESULTS.macroCI;
  const est = view === "binary" ? RESULTS.dAcc : RESULTS.macroDiff;
  const ticks = [-0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1, 0, 0.1];
  const y = 70;
  return (
    <Figure
      n="Eq. 3"
      caption={
        <>
          The retention test. The router passes when the lower end of the 95% paired, dataset-stratified bootstrap interval
          stays above −δ = −{RESULTS.margin} pp. The interval also excludes zero on the unfavourable side: a small, real
          accuracy loss, not equivalence.
        </>
      }
      controls={
        <>
          <Toggle
            label="Accuracy statistic"
            value={view}
            onChange={setView}
            options={[
              ["binary", "Binary (primary)"],
              ["macro", "Macro (secondary)"],
            ]}
          />
          <label className="p-check">
            <input type="checkbox" checked={showRoute} onChange={(e) => setShowRoute(e.target.checked)} /> RouteLLM point estimate
          </label>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="p-svg" role="img" aria-label={`Accuracy difference ${est} pp, 95% interval ${ci[0]} to ${ci[1]}, margin −${RESULTS.margin}`}>
        <rect x={40} y={y - 26} width={x(-RESULTS.margin) - 40} height={52} className="p-fail-zone" />
        <line x1={40} x2={W - 20} y1={y + 34} y2={y + 34} className="p-axis" />
        {ticks.map((t) => (
          <g key={t} transform={`translate(${x(t)},${y + 34})`}>
            <line y2={5} className="p-axis" />
            <text y={20} textAnchor="middle" className="p-tick">
              {t.toFixed(1)}
            </text>
          </g>
        ))}
        <line x1={x(0)} x2={x(0)} y1={y - 34} y2={y + 34} className="p-zero" />
        <text x={x(0) + 6} y={y - 24} className="p-lbl">
          no change
        </text>
        <line x1={x(-RESULTS.margin)} x2={x(-RESULTS.margin)} y1={y - 34} y2={y + 34} className="p-boundary" />
        <text x={x(-RESULTS.margin) + 6} y={y - 24} className="p-lbl">
          −δ = −{RESULTS.margin}
        </text>
        <g className="p-ci">
          <line x1={x(ci[0])} x2={x(ci[1])} y1={y} y2={y} />
          <line x1={x(ci[0])} x2={x(ci[0])} y1={y - 9} y2={y + 9} />
          <line x1={x(ci[1])} x2={x(ci[1])} y1={y - 9} y2={y + 9} />
          <circle cx={x(est)} cy={y} r={6} />
          <text x={x(est)} y={y + 24} textAnchor="middle" className="p-val">
            {pp(est)} [{ci[0]}, {ci[1]}]
          </text>
        </g>
        {showRoute && (
          <g className="p-route-pt">
            <rect x={x(-0.535) - 5} y={y - 5} width={10} height={10} />
            <text x={x(-0.535)} y={y - 14} textAnchor="middle" className="p-lbl">
              RouteLLM −0.535 (point only)
            </text>
          </g>
        )}
        <text x={W - 20} y={H - 4} textAnchor="end" className="p-axis-title">
          Δ binary accuracy vs GPT-5 (pp)
        </text>
      </svg>
      {showRoute && (
        <p className="p-note">
          RouteLLM's point estimate sits 0.034 pp inside the boundary, but no retention test was pre-specified for baselines,
          so the point alone does not establish that it passes.
        </p>
      )}
    </Figure>
  );
}

/* ── Fig. 2: cost reduction and its interval ───────────────────────────── */

export function CostFig() {
  const W = 640;
  const H = 120;
  const x = scale(-0.25, 1.75, 30, W - 20);
  const y = 50;
  const [lo, hi] = RESULTS.costRedCI;
  return (
    <Figure
      n="Fig. 2"
      caption={
        <>
          Observed recorded cost reduction and its 95% paired percentile-bootstrap interval on the fresh confirmation cohort.
          GPT-5 costs ${RESULTS.gpt5Cost.toFixed(2)}, the router ${RESULTS.v2Cost.toFixed(2)}, a ${RESULTS.saving.toFixed(2)} saving. The
          interval lies entirely above zero.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="p-svg" role="img" aria-label={`Cost reduction ${RESULTS.costRed}%, 95% interval ${lo} to ${hi}`}>
        <line x1={30} x2={W - 20} y1={y + 32} y2={y + 32} className="p-axis" />
        {[-0.25, 0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75].map((t) => (
          <g key={t} transform={`translate(${x(t)},${y + 32})`}>
            <line y2={5} className="p-axis" />
            <text y={19} textAnchor="middle" className="p-tick">
              {t.toFixed(2)}
            </text>
          </g>
        ))}
        <line x1={x(0)} x2={x(0)} y1={y - 30} y2={y + 32} className="p-zero" />
        <text x={x(0) - 6} y={y - 20} textAnchor="end" className="p-lbl">
          no improvement
        </text>
        <rect x={x(lo)} y={y - 14} width={x(hi) - x(lo)} height={28} rx={4} className="p-ci-band" />
        <line x1={x(RESULTS.costRed)} x2={x(RESULTS.costRed)} y1={y - 18} y2={y + 18} className="p-ci-mid" />
        <text x={x(RESULTS.costRed)} y={y - 24} textAnchor="middle" className="p-val">
          {RESULTS.costRed}% [{lo}, {hi}]
        </text>
        <text x={W - 20} y={H - 2} textAnchor="end" className="p-axis-title">
          recorded cost reduction vs GPT-5 (%)
        </text>
      </svg>
    </Figure>
  );
}

/* ── Fig. 3 + Table II: the accuracy–cost trade-off, linked ─────────────── */

export function TradeoffFig({ active, onActive }: { active: SystemId | null; onActive: (s: SystemId | null) => void }) {
  const [zoom, setZoom] = useState<"all" | "zoom">("all");
  const W = 640;
  const H = 360;
  const dom = zoom === "all" ? { x: [-1, 45], y: [-11, 1] } : { x: [-0.1, 2], y: [-0.7, 0.1] };
  const x = scale(dom.x[0], dom.x[1], 56, W - 20);
  const y = scale(dom.y[0], dom.y[1], H - 44, 16);
  const xt = zoom === "all" ? [0, 10, 20, 30, 40] : [0, 0.5, 1, 1.5, 2];
  const yt = zoom === "all" ? [-10, -8, -6, -4, -2, 0] : [-0.6, -0.4, -0.2, 0];
  const pts = SYSTEMS.filter((s) => zoom === "all" || s.costRed <= 2);
  return (
    <Figure
      n="Fig. 3"
      wide
      caption={
        <>
          Fresh accuracy-cost trade-off. The dashed line is the router's pre-frozen accuracy-retention boundary. Hover a
          system (or a row of Table II) to link them.
        </>
      }
      controls={
        <Toggle
          label="Zoom"
          value={zoom}
          onChange={setZoom}
          options={[
            ["all", "All systems"],
            ["zoom", "Zoom 0-2%"],
          ]}
        />
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="p-svg" role="img" aria-label="Scatter of binary accuracy change against cost reduction for four systems">
        {yt.map((t) => (
          <g key={t}>
            <line x1={56} x2={W - 20} y1={y(t)} y2={y(t)} className="p-grid" />
            <text x={48} y={y(t) + 4} textAnchor="end" className="p-tick">
              {t}
            </text>
          </g>
        ))}
        {xt.map((t) => (
          <text key={t} x={x(t)} y={H - 26} textAnchor="middle" className="p-tick">
            {t}
          </text>
        ))}
        <line x1={56} x2={W - 20} y1={y(-RESULTS.margin)} y2={y(-RESULTS.margin)} className="p-boundary" />
        <text x={W - 24} y={y(-RESULTS.margin) - 6} textAnchor="end" className="p-lbl">
          retention boundary
        </text>
        {pts.map((s) => {
          const on = active === s.id;
          return (
            <g
              key={s.id}
              className={`p-pt ${on ? "on" : ""} ${active && !on ? "dim" : ""}`}
              transform={`translate(${x(s.costRed)},${y(s.dAcc)})`}
              onMouseEnter={() => onActive(s.id)}
              onMouseLeave={() => onActive(null)}
              onFocus={() => onActive(s.id)}
              onBlur={() => onActive(null)}
              tabIndex={0}
              style={{ color: SYSTEM_COLOR[s.id] }}
            >
              <circle r={on ? 9 : 7} />
              <text x={12} y={-10} className="p-pt-lbl">
                {s.name}
              </text>
              {on && (
                <g className="p-tip" transform={`translate(${s.costRed > (zoom === "all" ? 30 : 1.4) ? -196 : 14},8)`}>
                  <rect width={182} height={70} rx={8} />
                  <text x={12} y={22}>
                    Δ acc {pp(s.dAcc)} pp
                  </text>
                  <text x={12} y={40}>
                    cost −{fmt(s.costRed)}% (${s.cost.toFixed(2)})
                  </text>
                  <text x={12} y={58}>
                    loss/save {s.lossPerSave ?? "n/a"}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        <text x={(56 + W - 20) / 2} y={H - 6} textAnchor="middle" className="p-axis-title">
          recorded cost reduction vs GPT-5 (%)
        </text>
        <text transform={`translate(14,${H / 2}) rotate(-90)`} textAnchor="middle" className="p-axis-title">
          Δ binary accuracy (pp)
        </text>
      </svg>
    </Figure>
  );
}

type SortKey = "acc" | "dAcc" | "arena" | "cost" | "costRed" | "lossPerSave";

export function ResultsTable({ active, onActive }: { active: SystemId | null; onActive: (s: SystemId | null) => void }) {
  const [sort, setSort] = useState<{ k: SortKey | null; dir: 1 | -1 }>({ k: null, dir: -1 });
  const rows = useMemo(() => {
    if (!sort.k) return SYSTEMS;
    const k = sort.k;
    return [...SYSTEMS].sort((a, b) => ((a[k] ?? -1) - (b[k] ?? -1)) * sort.dir);
  }, [sort]);
  const head: [SortKey, string][] = [
    ["acc", "Bin. acc. %"],
    ["dAcc", "Δ acc. pp"],
    ["arena", "Arena"],
    ["cost", "Cost $"],
    ["costRed", "Cost red. %"],
    ["lossPerSave", "Loss / save"],
  ];
  return (
    <div className="p-table-wrap">
      <p className="p-table-title">
        <b>Table II.</b> Fresh common-protocol results. Click a column to sort.
      </p>
      <table className="p-table">
        <thead>
          <tr>
            <th>System</th>
            {head.map(([k, label]) => (
              <th key={k}>
                <button type="button" onClick={() => setSort((s) => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : -1 }))}>
                  {label}
                  {sort.k === k ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} className={active === s.id ? "on" : ""} onMouseEnter={() => onActive(s.id)} onMouseLeave={() => onActive(null)}>
              <td>
                <i className="p-swatch" style={{ background: SYSTEM_COLOR[s.id] }} />
                {s.name}
              </td>
              <td>{fmt(s.acc)}</td>
              <td>{fmt(s.dAcc)}</td>
              <td>{s.arena.toFixed(4)}</td>
              <td>{s.cost.toFixed(4)}</td>
              <td>{fmt(s.costRed)}</td>
              <td>{s.lossPerSave ?? "n/a"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="p-note">
        Binary accuracy uses 7,104 queries from LiveMathBench, SWE-Bench, HLE and SimpleQA. Arena is the mean native
        Arena-Hard score on 749 queries. Cost covers all 7,853 confirmation queries. Loss/save is the absolute accuracy loss
        per percentage point of cost reduction. It is descriptive, not confirmatory.
      </p>
    </div>
  );
}

/* ── Fig. 4: where the router offloads ─────────────────────────────────── */

export function DatasetFig() {
  const [metric, setMetric] = useState<"costRed" | "offloads">("costRed");
  const W = 640;
  const H = 250;
  const max = metric === "costRed" ? 2.2 : 110;
  const x = scale(0, max, 130, W - 70);
  return (
    <Figure
      n="Fig. 4"
      caption="The router's recorded cost reduction and frozen offload counts by fresh confirmation dataset. SWE-Bench receives no offloads at all."
      controls={
        <Toggle
          label="Metric"
          value={metric}
          onChange={setMetric}
          options={[
            ["costRed", "Cost reduction %"],
            ["offloads", "Offloads"],
          ]}
        />
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="p-svg" role="img" aria-label="Bars by dataset">
        {BY_DATASET.map((d, i) => {
          const v = d[metric];
          const y0 = 18 + i * 44;
          return (
            <g key={d.dataset} className="p-bar">
              <text x={120} y={y0 + 20} textAnchor="end" className="p-tick strong">
                {d.dataset}
              </text>
              <rect x={130} y={y0} width={Math.max(0, x(v) - 130)} height={30} rx={4} />
              <text x={x(v) + 8} y={y0 + 20} className="p-val">
                {metric === "costRed" ? `${v.toFixed(3)}%` : `${v} offloads`}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

/* ── Section VI-C: transport shift ─────────────────────────────────────── */

export function TransportFig() {
  const W = 640;
  const H = 230;
  const x = scale(0, 11, 150, W - 40);
  const rows = [
    { label: "Offload rate", dev: TRANSPORT.dev.rate, conf: TRANSPORT.conf.rate, unit: "%", ci: null as null | [[number, number], [number, number]] },
    { label: "Cost reduction", dev: TRANSPORT.dev.costRed, conf: TRANSPORT.conf.costRed, unit: "%", ci: [TRANSPORT.dev.ci, TRANSPORT.conf.ci] as [[number, number], [number, number]] },
  ];
  return (
    <Figure
      n="Transport shift"
      caption={
        <>
          The same frozen operating point on development ({TRANSPORT.dev.offloads} of {DEV_TOTAL.toLocaleString()} offloaded) versus fresh confirmation (
          {TRANSPORT.conf.offloads} of {CONF_TOTAL.toLocaleString()}). The offload rate falls more than fivefold and the cost effect roughly fourfold; the
          development interval is selection-affected, so this is not a formal paired cross-cohort test.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="p-svg" role="img" aria-label="Development versus confirmation offload rate and cost reduction">
        {[0, 2, 4, 6, 8, 10].map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={12} y2={H - 30} className="p-grid" />
            <text x={x(t)} y={H - 12} textAnchor="middle" className="p-tick">
              {t}%
            </text>
          </g>
        ))}
        {rows.map((r, i) => {
          const y0 = 20 + i * 96;
          return (
            <g key={r.label}>
              <text x={140} y={y0 + 36} textAnchor="end" className="p-tick strong">
                {r.label}
              </text>
              {(["dev", "conf"] as const).map((k, j) => {
                const v = r[k];
                const yy = y0 + j * 36;
                return (
                  <g key={k} className={`p-tbar ${k}`}>
                    <rect x={150} y={yy} width={x(v) - 150} height={26} rx={4} />
                    {r.ci && (
                      <g className="p-whisker">
                        <line x1={x(r.ci[j][0])} x2={x(r.ci[j][1])} y1={yy + 13} y2={yy + 13} />
                        <line x1={x(r.ci[j][0])} x2={x(r.ci[j][0])} y1={yy + 6} y2={yy + 20} />
                        <line x1={x(r.ci[j][1])} x2={x(r.ci[j][1])} y1={yy + 6} y2={yy + 20} />
                      </g>
                    )}
                    <text x={Math.max(x(v), r.ci ? x(r.ci[j][1]) : 0) + 8} y={yy + 18} className="p-val">
                      {k === "dev" ? "development" : "confirmation"} {v}
                      {r.unit}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

/* ── Fig. 5 + Eq. 8: router overhead and when routing pays for itself ──── */

export function OverheadFig() {
  const [hover, setHover] = useState<string | null>(null);
  const W = 640;
  const H = 280;
  const ly = (v: number) => Math.log10(v);
  const y = scale(ly(15), ly(8000), H - 50, 14);
  const x = (i: number) => 110 + i * ((W - 150) / 4);
  return (
    <Figure
      n="Fig. 5"
      caption={
        <>
          Median and p95 local router overhead by dataset (log scale). Values are read from the published figure; SWE-Bench's
          median of 4.39 s is stated in the text. Long SWE-Bench prompts exceed BGE-M3's 8,192-token maximum, and the router
          never offloads them.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="p-svg" role="img" aria-label="Router overhead per dataset, log scale">
        {[10, 100, 1000].map((t) => (
          <g key={t}>
            <line x1={70} x2={W - 20} y1={y(ly(t))} y2={y(ly(t))} className="p-grid" />
            <text x={62} y={y(ly(t)) + 4} textAnchor="end" className="p-tick">
              {t >= 1000 ? `${t / 1000} s` : `${t} ms`}
            </text>
          </g>
        ))}
        {OVERHEAD_BY_DATASET.map((d, i) => {
          const on = hover === d.dataset;
          return (
            <g key={d.dataset} className={`p-lat ${on ? "on" : ""}`} onMouseEnter={() => setHover(d.dataset)} onMouseLeave={() => setHover(null)} tabIndex={0} onFocus={() => setHover(d.dataset)} onBlur={() => setHover(null)}>
              <rect x={x(i) - 40} y={10} width={80} height={H - 60} className="p-hit" />
              <line x1={x(i)} x2={x(i)} y1={y(ly(d.median))} y2={y(ly(d.p95))} />
              <circle cx={x(i)} cy={y(ly(d.median))} r={6} className="med" />
              <path d={`M${x(i) - 5} ${y(ly(d.p95)) - 5}l10 10m0 -10l-10 10`} className="p95" />
              <text x={x(i)} y={H - 28} textAnchor="middle" className="p-tick strong">
                {d.dataset}
              </text>
              {on && (
                <text x={x(i)} y={y(ly(d.p95)) - 12} textAnchor="middle" className="p-val">
                  ≈{d.median >= 1000 ? `${(d.median / 1000).toFixed(2)} s` : `${d.median.toFixed(0)} ms`} · p95 ≈
                  {d.p95 >= 1000 ? `${(d.p95 / 1000).toFixed(2)} s` : `${d.p95.toFixed(0)} ms`}
                </text>
              )}
            </g>
          );
        })}
        <g className="p-legend" transform={`translate(${W - 150},24)`}>
          <circle cx={6} cy={0} r={5} className="med" />
          <text x={18} y={4}>
            median
          </text>
          <path d="M60 -5l10 10m0 -10l-10 10" className="p95" />
          <text x={78} y={4}>
            p95
          </text>
        </g>
      </svg>
    </Figure>
  );
}

export function OverheadTable() {
  return (
    <div className="p-table-wrap">
      <p className="p-table-title">
        <b>Table III.</b> Local batch-1 router overhead on 256 queries (milliseconds).
      </p>
      <table className="p-table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Median</th>
            <th>P95</th>
            <th>Mean</th>
          </tr>
        </thead>
        <tbody>
          {OVERHEAD.map((r) => (
            <tr key={r.component}>
              <td>{r.component}</td>
              <td>{r.median.toFixed(3)}</td>
              <td>{r.p95.toFixed(3)}</td>
              <td>{r.mean.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BreakEven() {
  const [src, setSrc] = useState("overall");
  const [saved, setSaved] = useState(60);
  const [compute, setCompute] = useState(0.0002);
  const overhead = src === "overall" ? OVERHEAD[2].median : OVERHEAD_BY_DATASET.find((d) => d.dataset === src)!.median;
  const latencyOk = saved > overhead;
  const costOk = compute < RESULTS.savingPerQuery;
  return (
    <div className="p-break">
      <div className="p-gate-head">
        <span className="p-eyebrow">Break-even (Eq. 8)</span>
        <select value={src} onChange={(e) => setSrc(e.target.value)} aria-label="Router overhead source">
          <option value="overall">Median, all queries (46.7 ms)</option>
          {OVERHEAD_BY_DATASET.map((d) => (
            <option key={d.dataset} value={d.dataset}>
              {d.dataset} median (≈{d.median >= 1000 ? `${(d.median / 1000).toFixed(2)} s` : `${d.median.toFixed(0)} ms`})
            </option>
          ))}
        </select>
      </div>
      <label className="p-slider">
        <span>
          Generation time saved by the selected model, L<sub>GPT5</sub> − L<sub>selected</sub> <b>{saved} ms</b>
        </span>
        <input type="range" min={0} max={5000} step={5} value={saved} onChange={(e) => setSaved(+e.target.value)} />
      </label>
      <p className={`p-gate-out ${latencyOk ? "ok" : ""}`} aria-live="polite">
        {latencyOk
          ? `Routing pays for itself: ${saved} ms saved > ${overhead.toFixed(1)} ms of routing.`
          : `Routing costs more time than it saves: needs > ${overhead.toFixed(1)} ms.`}
      </p>
      <label className="p-slider">
        <span>
          Monetized local routing compute per query <b>${compute.toFixed(5)}</b>
        </span>
        <input type="range" min={0} max={0.0008} step={0.00001} value={compute} onChange={(e) => setCompute(+e.target.value)} />
      </label>
      <p className={`p-gate-out ${costOk ? "ok" : ""}`} aria-live="polite">
        {costOk
          ? `Model-cost advantage preserved (below $${RESULTS.savingPerQuery} saved per query).`
          : `Routing compute would erase the $${RESULTS.savingPerQuery} per-query saving.`}
      </p>
      <p className="p-note">These are the paper's break-even conditions, not deployment measurements.</p>
    </div>
  );
}

/* ── Table I as a composition bar ──────────────────────────────────────── */

export function CohortFig() {
  const [hover, setHover] = useState<string | null>(null);
  const groups = [
    { role: "Development", total: DEV_TOTAL, rows: COHORTS.filter((c) => c.role === "Development") },
    { role: "Confirmation", total: CONF_TOTAL, rows: COHORTS.filter((c) => c.role === "Confirmation") },
  ];
  const W = 640;
  const x = scale(0, CONF_TOTAL, 0, W - 150);
  const shown = hover ? COHORTS.find((c) => c.dataset === hover) : null;
  return (
    <Figure
      n="Table I"
      caption="Development (fit / select) and fresh confirmation (one-time test) cohorts. Hover a segment for its size. The confirmation cohort is dominated by HLE, SimpleQA and SWE-Bench, and is much harder than development."
    >
      <svg viewBox={`0 0 ${W} 130`} className="p-svg" role="img" aria-label="Cohort composition">
        {groups.map((g, gi) => {
          let acc = 0;
          return (
            <g key={g.role} transform={`translate(0,${10 + gi * 56})`}>
              <text x={0} y={22} className="p-tick strong">
                {g.role}
              </text>
              <g transform="translate(130,0)">
                {g.rows.map((r, i) => {
                  const x0 = x(acc);
                  acc += r.queries;
                  return (
                    <rect
                      key={r.dataset}
                      x={x0}
                      y={4}
                      width={Math.max(1, x(r.queries) - 1)}
                      height={30}
                      className={`p-seg s${i} ${hover === r.dataset ? "on" : ""}`}
                      onMouseEnter={() => setHover(r.dataset)}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
                <text x={x(g.total) + 8} y={24} className="p-val">
                  {g.total.toLocaleString()}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      <p className="p-note" aria-live="polite">
        {shown ? `${shown.dataset}: ${shown.queries.toLocaleString()} queries (${shown.role.toLowerCase()})` : "13 aligned models per query: GPT-5 plus 12 alternatives."}
      </p>
    </Figure>
  );
}
