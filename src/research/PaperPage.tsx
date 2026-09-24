import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { setMeta } from "../lib/meta";
import { PAPER, REFERENCES, type SystemId } from "./data";
import {
  BreakEven,
  CohortFig,
  CostFig,
  DatasetFig,
  Figure,
  GateExplorer,
  OverheadFig,
  OverheadTable,
  PipelineFig,
  ResultsTable,
  RetentionFig,
  TradeoffFig,
  TransportFig,
} from "./figures";
import "./paper.css";

/* ── MathML building blocks ─────────────────────────────────────────────── */

const Mi = ({ children }: { children: string }) => <mi>{children}</mi>;
const Sub = ({ b, s }: { b: React.ReactNode; s: string }) => (
  <msub>
    {b}
    <mtext>{s}</mtext>
  </msub>
);
const Hat = ({ children }: { children: React.ReactNode }) => (
  <mover accent="true">
    {children}
    <mo>ˆ</mo>
  </mover>
);

function Eq({ n, children, label }: { n: number; children: React.ReactNode; label: string }) {
  return (
    <div className="p-eq" id={`eq-${n}`}>
      <math display="block" aria-label={label}>
        {children}
      </math>
      <span className="p-eq-n">({n})</span>
    </div>
  );
}

const Cite = ({ n }: { n: number | string }) => (
  <a className="p-cite" href={`#ref-${String(n).split("-")[0]}`}>
    [{n}]
  </a>
);

const SECTIONS = [
  ["abstract", "Abstract"],
  ["intro", "Introduction"],
  ["related", "Related work"],
  ["protocol", "Evaluation protocol"],
  ["router", "The router"],
  ["baselines", "Baselines"],
  ["results", "Confirmation results"],
  ["overhead", "Router overhead"],
  ["threats", "Threats to validity"],
  ["conclusion", "Conclusion"],
  ["references", "References"],
] as const;

const Arrow = () => (
  <svg className="p-arrow" viewBox="0 0 12 12" aria-hidden="true">
    <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function PaperPage() {
  const [active, setActive] = useState<SystemId | null>(null);
  const [section, setSection] = useState("abstract");
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMeta({
      title: `${PAPER.short} | Zain Hafiz`,
      description: `${PAPER.title}. Submitted to ${PAPER.venue}.`,
    });
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setSection(top.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    bodyRef.current?.querySelectorAll("section[id]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const share = () => {
    navigator.clipboard?.writeText(window.location.href).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      },
      () => {},
    );
  };

  return (
    <div className="paper">
      <header className="p-nav">
        <Link to="/" className="p-mark">
          zain hafiz
        </Link>
        <div className="p-nav-end">
          <Link to="/" className="p-pill dark">
            Back to site
          </Link>
          <a className="p-pill light" href={PAPER.pdf} target="_blank" rel="noreferrer">
            Download PDF <Arrow />
          </a>
        </div>
      </header>

      <div className="p-hero">
        <p className="p-meta">
          <span>{PAPER.status} to {PAPER.venue}</span>
          <span className="p-kind">Publication</span>
        </p>
        <h1>{PAPER.short}</h1>
        <p className="p-dek">
          Empirical multi-model routing across accuracy, cost, and routing overhead, confirmed once on 7,853 fresh queries under a
          leakage-controlled protocol.
        </p>
        <a className="p-pill dark p-cta" href={PAPER.pdf} target="_blank" rel="noreferrer">
          Read the paper <Arrow />
        </a>
      </div>

      <div className="p-byline">
        <p>
          {PAPER.author} <span>· University of North Texas</span>
        </p>
        <button type="button" className="p-share" onClick={share}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M6.8 9.2a2.6 2.6 0 0 0 3.7 0l2.2-2.2a2.6 2.6 0 0 0-3.7-3.7l-.9.9M9.2 6.8a2.6 2.6 0 0 0-3.7 0L3.3 9a2.6 2.6 0 0 0 3.7 3.7l.9-.9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          {copied ? "Link copied" : "Share"}
        </button>
      </div>

      <div className="p-layout">
        <nav className="p-toc" aria-label="Sections">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={section === id ? "on" : ""}>
              {label}
            </a>
          ))}
        </nav>

        <article className="p-body" ref={bodyRef}>
          <section id="abstract">
            <h2>Abstract</h2>
            <p className="p-abstract">
              Large language model routing attempts to preserve response quality while reducing inference cost by selecting a
              model for each query. This work evaluates a cost-aware GPT-5-relative router under a leakage-controlled protocol
              built from LLMRouterBench. Router design uses 3,450 development queries from four benchmarks across 13 models. A
              fresh confirmation cohort is frozen from five previously unused benchmark families, yielding 7,853 aligned queries.
              The final router embeds each prompt with BAAI bge-m3, predicts GPT-5-relative correctness and cost signals for 12
              alternatives, and offloads only when estimated accuracy risk remains within a development-frozen tolerance and
              predicted dollar saving is positive. On 7,104 binary-scored confirmation queries, GPT-5 achieves 39.626 percent
              accuracy and the router achieves 39.428 percent. The paired bootstrap interval ranges from −0.380 to −0.014
              percentage points, providing evidence of a small accuracy loss, but its lower bound remains within the
              pre-specified 0.569-point retention margin. Across all 7,853 confirmation queries, recorded inference cost falls by
              1.034 percent, with a 95 percent interval from 0.642 to 1.498 percent. The offload rate falls from 10.4 percent in
              development to 1.885 percent in confirmation, exposing substantial transport shift. RouteLLM saves more cost but
              incurs a larger accuracy loss, while Avengers-Pro trades a large accuracy loss for much larger savings. Local
              routing overhead is 46.7 milliseconds at the median and becomes several seconds on long SWE-Bench prompts. The
              results support a narrow confirmed cost saving, not accuracy equivalence, and show that transport and routing
              overhead are central deployment constraints.
            </p>
            <p className="p-terms">
              <b>Index terms:</b> {PAPER.indexTerms.join(", ")}
            </p>
          </section>

          <section id="intro">
            <h2>Introduction</h2>
            <p>
              LLM systems increasingly face a per-query model-selection problem. Candidate models differ in capability,
              specialization, and price, so a fixed strongest model can waste resources while a fixed cheaper model can lose
              quality. RouteLLM formalizes this quality-cost trade-off for a strong/weak pair <Cite n={2} />; GraphRouter,
              Avengers-Pro, and RouterDC extend routing to richer model sets and representations <Cite n="3-5" />.
              LLMRouterBench provides a common benchmark and reports substantial model complementarity, but it also shows that
              practical routers remain far from hindsight upper bounds <Cite n={1} />.
            </p>
            <p>
              A central empirical difficulty is that router development can easily contaminate evaluation. Thresholds, model
              pools, baseline adaptations, and even metric interpretations may be revised after observing a nominal holdout. This
              is especially problematic when the desired effect is small. A router that saves only a few percent in cost can
              appear favorable or unfavorable because of a handful of discordant queries or because a threshold was implicitly
              tuned against held-out outcomes.
            </p>
            <p>
              This study therefore treats evaluation protocol as a first-class part of the routing problem. An earlier 863-query
              outer partition had already been observed during a proof-of-concept phase, so it is explicitly excluded from all new
              V2 model, threshold, feature, and hyperparameter decisions. V2 is developed only on the original 3,450-query
              development partition. A separate 7,853-query confirmation cohort is constructed from previously unused
              LLMRouterBench datasets, query identities and router assignments are frozen before outcome access, and the primary
              accuracy and cost decision rules are fixed in advance. The fresh cohort is materially different and harder than the
              development corpus: it is dominated by HLE, SimpleQA, and SWE-Bench, and GPT-5 reaches only 39.626 percent binary
              accuracy. Absolute accuracy therefore should not be compared directly with the much higher values reported on the
              development-family benchmarks.
            </p>
            <p>
              The contributions are fourfold. First, the work defines a GPT-5-relative router that jointly estimates correctness
              risk and dollar saving using only pre-inference prompt features. Second, it constructs an out-of-fold accuracy-cost
              frontier and selects a development operating point under a pre-frozen accuracy-retention rule rather than a post-hoc
              point estimate. Third, it performs one fresh common-protocol confirmation against GPT-5, RouteLLM, and Avengers-Pro.
              Fourth, it measures local router overhead separately from model-generation latency, allowing deployment cost and
              routing overhead to be discussed without claiming unmeasured end-to-end speedup.
            </p>
          </section>

          <section id="related">
            <h2>Related work</h2>
            <p>
              RouteLLM learns a router from preference data and selects between a strong and weak model at a configurable
              threshold <Cite n={2} />. GraphRouter represents tasks, queries, and LLMs as a heterogeneous graph and predicts
              query-model edge utility <Cite n={3} />. Avengers-Pro clusters query embeddings and ranks models using a
              performance-efficiency objective <Cite n={4} />. RouterDC learns query and model representations through dual
              contrastive objectives <Cite n={5} />. These systems cover pairwise preference routing, graph prediction, cluster
              routing, and contrastive retrieval.
            </p>
            <p>
              LLMRouterBench unifies multiple routing datasets, model pools, and performance-cost settings <Cite n={1} />. The
              development corpus used here includes AIME, GPQA <Cite n={7} />, LiveCodeBench <Cite n={8} />, and MMLU-Pro{" "}
              <Cite n={9} />. Fresh confirmation uses LiveMathBench <Cite n={11} />, SWE-Bench <Cite n={12} />, Humanity's Last
              Exam (HLE) <Cite n={13} />, SimpleQA <Cite n={14} />, and Arena-Hard <Cite n={15} />. BGE-M3 supplies the
              1,024-dimensional prompt representation <Cite n={6} />. Linear estimators are implemented with scikit-learn{" "}
              <Cite n={10} />.
            </p>
          </section>

          <section id="protocol">
            <h2>Leakage-controlled evaluation protocol</h2>
            <h3>Development and confirmation cohorts</h3>
            <p>
              The model pool contains 13 aligned systems, including GPT-5 and 12 alternatives. The V2 development set contains
              3,450 queries from the previously constructed 4,313-query corpus. The already-observed 863-query V1 outer partition
              is retained only as legacy evidence and is not reused for V2 selection. Five-fold development cross-fitting is
              stratified by dataset with shuffle and seed 42, so each development query is scored by estimators that did not train
              on that query.
            </p>
            <p>
              The fresh confirmation cohort is drawn from five LLMRouterBench datasets that were not used for V2 fitting or
              threshold selection. Common-query intersection filtering is performed before outcome access so every retained query
              has all 13 model observations. HLE contains 2,158 records per model but non-identical query sets, producing a
              2,157-query common intersection; Arena-Hard similarly yields 749 common queries from 750-record model files. The
              final cohort contains 7,853 queries, as summarized in Table I.
            </p>
            <CohortFig />
            <h3>Outcome sealing and metric semantics</h3>
            <p>
              The confirmation query hashes, prompt embeddings, V2 assignments, RouteLLM assignments, Avengers-Pro assignments,
              and final baseline roster were saved and hashed before fresh outcome values were opened. No threshold, estimator,
              assignment, baseline, or margin was changed after confirmation access.
            </p>
            <p>
              Source-code inspection before outcome access established that LiveMathBench, SWE-Bench, HLE, and SimpleQA yield
              binary correctness for the retained protocol. These 7,104 queries form the primary accuracy analysis. Arena-Hard
              instead preserves the benchmark's native comparative score {"{0, 0.5, 1}"}, so its 749 queries are analyzed
              separately rather than post-hoc binarized. Recorded-cost confirmation uses all 7,853 queries.
            </p>
            <p>For binary accuracy, let</p>
            <Eq n={1} label="A equals one over N times the sum over i of z i">
              <Mi>A</Mi>
              <mo>=</mo>
              <mfrac>
                <mn>1</mn>
                <Mi>N</Mi>
              </mfrac>
              <munderover>
                <mo>∑</mo>
                <mrow>
                  <Mi>i</Mi>
                  <mo>=</mo>
                  <mn>1</mn>
                </mrow>
                <Mi>N</Mi>
              </munderover>
              <msub>
                <Mi>z</Mi>
                <Mi>i</Mi>
              </msub>
              <mo>,</mo>
            </Eq>
            <p>
              where z<sub>i</sub> ∈ {"{0, 1}"}. The primary paired accuracy statistic is
            </p>
            <Eq n={2} label="Delta A equals A router minus A GPT-5">
              <mi mathvariant="normal">Δ</mi>
              <Mi>A</Mi>
              <mo>=</mo>
              <Sub b={<Mi>A</Mi>} s="router" />
              <mo>−</mo>
              <Sub b={<Mi>A</Mi>} s="GPT5" />
              <mo>.</mo>
            </Eq>
            <p>
              The accuracy-retention margin is derived before confirmation from development data only. We take the smaller of
              GPT-5's dataset-stratified bootstrap standard error on development (0.568656 percentage points) and the smallest
              adjacent accuracy gap among the top three fixed models (1.101449 points), yielding δ = 0.005686564292 (0.568656
              percentage points). The router passes the pre-frozen retention criterion when the lower endpoint of the two-sided
              95% paired, dataset-stratified bootstrap interval satisfies
            </p>
            <Eq n={3} label="L 95 of Delta A is greater than minus delta">
              <Sub b={<Mi>L</Mi>} s="95" />
              <mo>(</mo>
              <mi mathvariant="normal">Δ</mi>
              <Mi>A</Mi>
              <mo>)</mo>
              <mo>&gt;</mo>
              <mo>−</mo>
              <Mi>δ</Mi>
              <mo>.</mo>
            </Eq>
            <p>The margin is study-specific and should not be interpreted as a universal tolerance for LLM quality loss.</p>
            <p>
              Total recorded cost is C = Σ<sub>i</sub> c<sub>i</sub>, and cost reduction relative to GPT-5 is
            </p>
            <Eq n={4} label="R C equals one minus C router over C GPT-5">
              <msub>
                <Mi>R</Mi>
                <Mi>C</Mi>
              </msub>
              <mo>=</mo>
              <mn>1</mn>
              <mo>−</mo>
              <mfrac>
                <Sub b={<Mi>C</Mi>} s="router" />
                <Sub b={<Mi>C</Mi>} s="GPT5" />
              </mfrac>
              <mo>.</mo>
            </Eq>
            <p>
              A confirmatory positive-saving claim requires L<sub>95</sub>(R<sub>C</sub>) &gt; 0. Both accuracy and cost intervals use
              20,000 paired bootstrap replicates, stratified by confirmation dataset, with seed 42. Exact McNemar testing is
              retained as a diagnostic for binary discordant pairs.
            </p>
          </section>

          <section id="router">
            <h2>Proposed GPT-5-relative router</h2>
            <h3>Representation and relative heads</h3>
            <p>
              Each prompt is encoded with BAAI/bge-m3 into a 1,024-dimensional float32 vector with application-level
              normalization disabled. Dataset identity, model outputs, realized correctness, and realized candidate cost are not
              router inputs. For each alternative model m, an L2-regularized multinomial logistic head predicts three
              GPT-5-relative correctness outcomes: rescue, break, or tie. Define
            </p>
            <Eq n={5} label="D hat of i m equals P hat of rescue minus P hat of break">
              <Hat>
                <Mi>D</Mi>
              </Hat>
              <mo>(</mo>
              <Mi>i</Mi>
              <mo>,</mo>
              <Mi>m</Mi>
              <mo>)</mo>
              <mo>=</mo>
              <Hat>
                <Mi>P</Mi>
              </Hat>
              <mo>(</mo>
              <mtext>rescue</mtext>
              <mo>)</mo>
              <mo>−</mo>
              <Hat>
                <Mi>P</Mi>
              </Hat>
              <mo>(</mo>
              <mtext>break</mtext>
              <mo>)</mo>
              <mo>.</mo>
            </Eq>
            <p>A Ridge head with α = 1 predicts the GPT-5-relative dollar saving</p>
            {/* A wide hat over the whole difference: MathML accents don't stretch
                across an expression in Chromium, so this one is set in HTML. */}
            <div className="p-eq" id="eq-6" role="math" aria-label="S hat of i m equals the predicted difference c GPT-5 of i minus c m of i">
              <span className="p-htm">
                <span className="p-hat">
                  <i>S</i>
                </span>
                (<i>i</i>, <i>m</i>) ={" "}
                <span className="p-widehat">
                  <i>c</i>
                  <sub>GPT5</sub>(<i>i</i>) − <i>c</i>
                  <sub>
                    <i>m</i>
                  </sub>
                  (<i>i</i>)
                </span>
                .
              </span>
              <span className="p-eq-n">(6)</span>
            </div>
            <p>The same estimator family is used in every cross-fit fold and in the final refit.</p>
            <Figure
              n="Fig. 1"
              wide
              caption="Frozen V2 routing pipeline. The risk budget τ is selected using development data only. No fresh outcome enters routing. Hover a stage to read what it does."
            >
              <PipelineFig />
              <GateExplorer />
            </Figure>
            <h3>Accuracy-cost frontier and operating point</h3>
            <p>The V2 family permits alternative m when</p>
            <Eq n={7} label="D hat greater than or equal to minus tau, and S hat greater than zero">
              <Hat>
                <Mi>D</Mi>
              </Hat>
              <mo>(</mo>
              <Mi>i</Mi>
              <mo>,</mo>
              <Mi>m</Mi>
              <mo>)</mo>
              <mo>≥</mo>
              <mo>−</mo>
              <Mi>τ</Mi>
              <mspace width="1em" />
              <mtext>and</mtext>
              <mspace width="1em" />
              <Hat>
                <Mi>S</Mi>
              </Hat>
              <mo>(</mo>
              <Mi>i</Mi>
              <mo>,</mo>
              <Mi>m</Mi>
              <mo>)</mo>
              <mo>&gt;</mo>
              <mn>0</mn>
              <mo>.</mo>
            </Eq>
            <p>
              If no alternative qualifies, GPT-5 is selected. Otherwise the router chooses the eligible model with largest Ŝ,
              breaking ties by larger D̂ and then canonical model name.
            </p>
            <p>
              Five-fold out-of-fold predictions over all 3,450 development queries generate 10,067 realized operating points and a
              349-point Pareto frontier. At τ = 0, the router reduces development cost by 2.31% with a −0.029-point accuracy
              difference. Seven Pareto points satisfy the frozen development accuracy rule. The lowest-cost passing point uses τ =
              0.00537 (full precision is retained in the frozen experimental artifact). It produces 359 development offloads, an
              accuracy difference of −0.203 points with a 95% interval of [−0.522, 0.087] points, and a 4.410% observed cost
              reduction. The paired cost interval is [3.155%, 5.741%]. These development intervals are selection-affected and are
              not treated as confirmation evidence. After selection, the same estimator family is refit on all 3,450 development
              queries and the resulting weights, τ, and routing rule are frozen before fresh outcomes are accessed.
            </p>
          </section>

          <section id="baselines">
            <h2>Baselines</h2>
            <p>
              GPT-5 is the fixed accuracy anchor. RouteLLM uses the frozen matrix-factorization checkpoint for GPT-5 versus Gemini
              2.5 Flash with threshold 0.5. Direct checkpoint reconstruction reproduces all 863 legacy assignments before fresh
              application. Avengers-Pro is reconstructed with BGE-M3 embeddings, 32 clusters, top-k = 1, β = 9, and
              performance/cost weights 0.7/0.3; its reconstruction also exactly reproduces all 863 historical assignments before
              fresh routing. Fresh baseline assignments depend only on the already-frozen query representations and trained state.
            </p>
            <p>
              The common fresh baseline roster is therefore GPT-5, the proposed router, RouteLLM, and Avengers-Pro. GraphRouter
              remains a historical comparison because its frozen implementation uses task-description representations and
              per-dataset cost normalization fit for the four development tasks; applying it to five unseen task identities would
              require a new transport rule after development. RouterDC is not executed because the required local 7B
              artifact/runtime is unavailable. Max Expert remains a fixed historical comparator rather than a fresh query router.
              These exclusions were recorded before fresh outcomes were opened.
            </p>
          </section>

          <section id="results">
            <h2>Fresh confirmation results</h2>
            <h3>Primary accuracy and cost confirmation</h3>
            <p>
              Table II gives the common-protocol results. On the 7,104 binary-scored queries, GPT-5 answers 2,815 correctly and V2
              answers 2,801 correctly. Accuracy therefore changes from 39.626% to 39.428%, or −0.197 percentage points. The paired
              95% interval is [−0.380, −0.014] points. Although the interval is below zero, its lower endpoint remains above the
              pre-frozen −0.569-point boundary, so the accuracy-retention criterion passes. This is not an equivalence claim: 14
              GPT-5 errors are rescued, 28 GPT-5 successes are broken, and exact McNemar p = 0.0436, indicating evidence of a small
              paired accuracy disadvantage.
            </p>
            <RetentionFig />
            <p>
              Across all 7,853 confirmation queries, GPT-5 costs $250.959431 and V2 costs $248.363575. The saving is $2.595857, or
              1.034%, with a paired 95% cost-reduction interval of [0.642%, 1.498%]. Because the lower bound is positive, the cost
              criterion passes. Under the pre-frozen joint rule, V2 therefore satisfies the study's combined accuracy-retention and
              positive-cost-saving confirmation criteria.
            </p>
            <CostFig />
            <ResultsTable active={active} onActive={setActive} />
            <TradeoffFig active={active} onActive={setActive} />
            <h3>Macro, Arena-Hard, and per-dataset behavior</h3>
            <p>
              Across the four binary datasets, GPT-5 macro accuracy is 42.342% and V2 macro accuracy is 42.226%, a −0.116-point
              difference with a 95% interval of [−0.209, −0.029] points. This secondary statistic is consistent with a small
              distributed accuracy cost rather than exact preservation.
            </p>
            <p>
              Arena-Hard is analyzed in its native {"{0, 0.5, 1}"} space. GPT-5 has mean score 0.697597 and V2 has 0.698264. The
              paired mean difference is 0.000668 with a 95% interval of [−0.003338, 0.005340], so no directional Arena-Hard
              improvement is established.
            </p>
            <p>
              V2 makes 148 offloads in the full cohort, only 1.885% of queries. It retains GPT-5 on 7,705 queries (98.115%).
              Offloads are concentrated in SimpleQA (96), HLE (37), Arena-Hard (11), and LiveMathBench (4); SWE-Bench receives no
              offloads. In that same order, the recorded cost reductions are 1.957%, 0.919%, 0.662%, and 0.669%; SWE-Bench remains
              at 0%, as shown in Fig. 4.
            </p>
            <DatasetFig />
            <h3>Transport shift across benchmark families</h3>
            <p>
              The operating point changes sharply when transported away from the development benchmark families. On development,
              V2 offloads 359 of 3,450 queries (10.41%) and reduces recorded cost by 4.410%, with a selection-affected paired
              interval of [3.155%, 5.741%]. On fresh confirmation, it offloads only 148 of 7,853 queries (1.885%) and reduces cost
              by 1.034%, with interval [0.642%, 1.498%]. Thus the offload rate falls by more than a factor of five and the observed
              cost effect by roughly a factor of four; the entire confirmation interval also lies below the development interval.
              Because the cohorts contain different benchmark families, this is not a formal paired cross-cohort test. It is,
              however, direct evidence that the development frontier did not transport quantitatively. This shift is precisely why
              the previously observed 863-query partition was not reused as confirmation evidence.
            </p>
            <TransportFig />
            <h3>Secondary baseline trade-offs</h3>
            <p>
              RouteLLM selects GPT-5 for 7,605 queries and Gemini 2.5 Flash for 248. It saves 1.574% recorded cost but loses 0.535
              binary-accuracy points relative to GPT-5, a larger point loss than V2. Its point estimate lies only 0.034 points
              inside V2's −0.569-point boundary, but no baseline retention test was pre-specified; the point estimate alone
              therefore does not establish that RouteLLM satisfies V2's interval-based criterion. Avengers-Pro offloads 4,106
              queries and reduces cost by 43.002%, but its binary accuracy is 29.575%, 10.051 points below GPT-5. A descriptive
              efficiency ratio further separates the operating points: absolute accuracy loss per percentage point of cost
              reduction is 0.191 for V2, 0.340 for RouteLLM, and 0.234 for Avengers-Pro. V2 therefore has the smallest observed
              accuracy sacrifice per unit of recorded cost saving among the routed systems in Table II. Only the V2 versus GPT-5
              accuracy and cost criteria were pre-frozen as confirmatory hypotheses; these baseline comparisons and ratios are
              secondary.
            </p>
          </section>

          <section id="overhead">
            <h2>Router overhead</h2>
            <p>
              Local routing overhead is measured after confirmation without changing the frozen router. A deterministic 256-query
              sample is allocated proportionally across the five confirmation datasets. Each prompt is embedded batch-1 on Apple
              MPS with the same local BGE-M3 model, followed by the 12 correctness heads, 12 cost heads, and selection rule. Five
              dataset-specific warm-up queries are excluded. Batch-1 inference reproduces all 256 frozen assignments, with maximum
              absolute embedding difference 8.23 × 10<sup>−7</sup> from the original frozen embeddings.
            </p>
            <OverheadTable />
            <p>
              Table III shows that scoring and selection are inexpensive: the median is 1.35 ms and p95 is 1.76 ms. Prompt
              embedding dominates, producing a 46.73 ms median total router overhead. The overall p95 is 4.18 s because SWE-Bench
              prompts are extremely long: its sampled median is 19,741 raw tokens, 12 of 16 sampled prompts exceed BGE-M3's
              8,192-token maximum, and its median router overhead is 4.39 s. Because only 16 SWE-Bench prompts enter the
              proportional latency sample, extreme-tail quantiles are not stable; p99 is therefore omitted. More importantly, the
              frozen router makes zero SWE-Bench offloads, so on that workload the current policy pays several seconds of routing
              latency to select GPT-5 anyway.
            </p>
            <OverheadFig />
            <p>
              The benchmark measures L<sub>router</sub> only. A routed query improves end-to-end latency only when
            </p>
            <Eq n={8} label="L GPT-5 minus L selected is greater than L router">
              <Sub b={<Mi>L</Mi>} s="GPT5" />
              <mo>−</mo>
              <Sub b={<Mi>L</Mi>} s="selected" />
              <mo>&gt;</mo>
              <Sub b={<Mi>L</Mi>} s="router" />
              <mo>,</mo>
            </Eq>
            <p>
              so a median case requires more than 46.7 ms of selected-model generation-time savings before routing breaks even on
              latency. Likewise, the observed model-cost saving is 2.595857/7853 = $0.0003306 per query; if local routing compute
              were monetized, its average per-query cost would need to remain below that amount to preserve the recorded
              model-cost advantage. Live provider timing and local-compute accounting are not available here, so these are
              break-even conditions rather than deployment claims.
            </p>
            <BreakEven />
          </section>

          <section id="threats">
            <h2>Threats to validity and limitations</h2>
            <p>
              First, the confirmation cohort is fresh with respect to V2 design but is not an independent external benchmark
              collection: all datasets come from the same LLMRouterBench release and share its model outputs and cost recording
              conventions. The outcome sealing is procedural and cryptographic rather than physical blinding.
            </p>
            <p>
              Second, the primary binary cohort is highly imbalanced, with SimpleQA contributing 4,326 of 7,104 queries.
              Sample-weighted accuracy is therefore the primary statistic and macro-dataset accuracy is reported separately.
              Arena-Hard uses a different native metric and is not folded into binary accuracy.
            </p>
            <p>
              Third, the 0.568656-point accuracy-retention margin is development-derived and study-specific. The confirmation
              interval excludes zero in the unfavorable direction, and McNemar testing also detects a small accuracy disadvantage.
              The correct interpretation is therefore that V2 met the pre-frozen retention tolerance, not that it is
              accuracy-equivalent to GPT-5.
            </p>
            <p>
              Fourth, threshold selection uses a development Pareto frontier whose final cheapest-passing selection rule was
              formulated after inspecting development results. Cross-fitting removes direct in-sample scoring for each query, but
              development uncertainty remains selection-affected. The fresh cohort, not the development frontier, is the basis for
              the final claim.
            </p>
            <p>
              Fifth, BGE-M3 truncation affects long prompts. Across the 7,853 fresh prompts, 347 exceed the model's 8,192-token
              maximum, including 346 SWE-Bench prompts and one Arena-Hard prompt. No manual truncation rule is introduced; the
              frozen encoder's native maximum-sequence behavior is used. The fresh router makes zero SWE-Bench offloads, but
              truncation still influences its routing scores and is a deployment limitation.
            </p>
            <p>
              Sixth, the fresh common-protocol comparison contains only two learned routing baselines in addition to V2.
              GraphRouter could not be transported to unseen task identities without a new task-specific rule, and RouterDC could
              not be reproduced in the available environment, so baseline breadth remains limited.
            </p>
            <p>
              Finally, costs are provider-reported values recorded by LLMRouterBench, not audited invoices. Model prices can
              change. The latency experiment measures local router overhead only and does not include network, provider queueing,
              time-to-first-token, or full generation time.
            </p>
          </section>

          <section id="conclusion">
            <h2>Conclusion</h2>
            <p>
              This study combines a conservative GPT-5-relative router with a leakage-controlled evaluation protocol. V2 is
              selected entirely on development data, frozen, and then evaluated once on 7,853 previously unused LLMRouterBench
              queries. On 7,104 binary-scored queries, the router loses 0.197 accuracy points relative to GPT-5, but the 95% paired
              interval remains within the pre-frozen 0.569-point retention tolerance. Across the full cohort, recorded cost falls by
              1.034%, and the 95% cost-reduction interval remains strictly positive. The joint pre-frozen confirmation rule
              therefore passes.
            </p>
            <p>
              The result is intentionally narrow. It does not show accuracy equivalence, and it does not show end-to-end latency
              superiority. Instead, the fresh cohort detects a small accuracy loss alongside a small but statistically supported
              cost reduction. V2 retains the smallest observed accuracy loss per unit of cost saving among the routed systems, while
              RouteLLM buys slightly more cost reduction with a larger loss and Avengers-Pro accepts a much larger quality drop for
              much larger savings. The fivefold reduction in offload rate from development to confirmation also shows that the
              router transports poorly across benchmark families, turning distribution shift into a central result rather than a
              footnote. Future work should improve transport across prompt distributions, avoid expensive routing on long-context
              workloads that rarely offload, evaluate dynamic pricing, and measure live selected-model latency under a common
              serving protocol.
            </p>
          </section>

          <section id="references">
            <h2>References</h2>
            <ol className="p-refs">
              {REFERENCES.map((r) => (
                <li key={r.n} id={`ref-${r.n}`}>
                  <span className="p-ref-n">[{r.n}]</span>
                  <span>
                    {r.text}
                    {"doi" in r && r.doi && (
                      <>
                        {" "}
                        <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer">
                          doi:{r.doi}
                        </a>
                      </>
                    )}
                    {"url" in r && r.url && (
                      <>
                        {" "}
                        <a href={r.url} target="_blank" rel="noreferrer">
                          {r.url.replace("https://", "")}
                        </a>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <footer className="p-foot">
            <a className="p-pill light" href={PAPER.pdf} target="_blank" rel="noreferrer">
              Read the full paper <Arrow />
            </a>
            <Link to="/" className="p-back">
              Back to the site
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
