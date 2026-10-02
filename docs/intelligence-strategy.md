# From workspace to intelligence: research, differentiation and feature options

## The answer to "do users fill in every field?"

No. If users have to type in every finding, risk, decision and work item, we have built a nicer M&A project tracker, not the product we set out to build.

- **People provide:** about six fields per target, the seller's documents, context ("why we're interested") and decisions.
- **Atlas does:** reading, extracting, calculating, comparing (to the playbook and to prior deals), researching, drafting and monitoring.
- **People:** accept, edit or dismiss what Atlas proposes, and they own every material judgment.

The prototype now shows this end to end. Under **Portfolio → New acquisition → Use sample target**, Atlas reads a 10-document data room. It then:

- proposes 9 findings with sources
- scores the target against Playbook v4
- matches it to prior deals
- drafts 5 seller requests for missing information
- researches 6 external items
- checks 4 seller claims, 1 of which the data contradicts

Accepting a finding releases the risk, decision and actions Atlas drafted for it.

## What the market already does (Oct 2026)

| Category | Examples | What they do well | What they don't do |
|---|---|---|---|
| AI data rooms | Ansarada, Datasite, DealRoom | AI Q&A, auto-sorting, redaction, readiness scoring. Datasite shipped an MCP server (Apr 2026) so AI assistants can read live deal content. | They hold documents. They don't run the acquirer's decisions, playbook or post-close learning. |
| AI analyst tools | Hebbia (Matrix), Rogo (Felix agent), Brightwave | Answer structured questions across thousands of files with citations; draft CIMs, comps and memos. Rogo raised $160M at a $2B valuation in Apr 2026. | Built for PE, banks and funds. They work at the level of the analyst, not the corp-dev team's workflow, and keep no memory across deals. |
| Deterministic diligence | Keye (Odin, Jan 2026) | The language model interprets the question, but the math runs in auditable formulas, so every number ties back to a source. | Covers financial diligence only. |
| Corp-dev deal management | **Midaxo**, DealCloud/Intapp | Pipeline, diligence workflow, PMI tracking. Midaxo's agent **"Madi"** reads documents, surfaces risks, and adds "cross-project risk flags" and one-click field updates. Midaxo is explicitly selling to serial acquirers in fire/safety, environmental and commercial services. | Mature but heavy. AI is layered onto an existing data-entry model. |

**Implication:** "AI that reads documents and flags risks" is now table stakes. Midaxo is the closest competitor and is moving in our direction with our target customer. We have to win on depth in a few places, not on having AI.

## Where we can differentiate (sharpened)

1. **Playbook as code.** The acquirer's thesis and thresholds are data, and every target is scored against them automatically, with the metric, the source and the rule visible. This combines Keye's deterministic principle with the acquirer's own strategy.
2. **Evidence → Finding → Risk → Decision → Action → Outcome graph.** Atlas drafts the whole chain from one accepted finding. Deliverables (IC memo, weekly update) are generated from the graph and go stale when it changes.
3. **Institutional memory with outcomes.** We record not just what was found, but what was predicted, what happened after close, and which lesson changed the playbook. New targets are benchmarked against the acquirer's own history: "concentration is 17 pts above your median; resembles Red River."
4. **Seller-claim verification.** Every factual claim in the CIM and management deck is checked against the data room, and marked Verified, Partly true, Contradicted or Unverified.
5. **Human review as the core workflow.** One review queue holds everything Atlas proposes. Accept, edit and dismiss are logged. The queue is the product's daily surface.
6. **Built for a 5–15 person team doing 2–10 deals a year.** Little setup, sensible defaults, HVAC/plumbing/fire playbooks out of the box, and advisors scoped to their workstreams.

## Feature options

Tier A is in the prototype now. Tier B is the proposed MVP. Tier C comes later.

### Intake and document intelligence
| Feature | Tier | Notes |
|---|---|---|
| Six-field intake + data-room batch → automatic analysis | A | `/new` → live analysis screen |
| Classification, extraction, page-level citations | A (simulated) / B | Real: PDF/XLSX/DOCX parsing, table extraction, chunking, pgvector |
| Missing-information detection → drafted seller requests | A | Driven by playbook request lists per phase |
| Seller-claim verification (CIM vs. data) | A | Strong SME demo moment |
| Version diffing (QoE v1 → v2, what changed) | B | Re-runs affected findings and marks deliverables stale |
| VDR connectors (Datasite MCP, Ansarada, SharePoint) | C | Pull, don't replace; aligns with "not a VDR" |

### Intelligence and judgment
| Feature | Tier | Notes |
|---|---|---|
| Proposed findings with fact / interpretation / recommendation and "Why?" | A | |
| Chain drafting: risk + decision (with options) + actions per finding | A | `ChainPanel`, "Accept all" |
| Atlas review queue (findings, requests, research, deliverable updates, playbook changes) | A | `/inbox` |
| Thesis-fit scorecard (deterministic) | A | `src/lib/playbook.ts` |
| Benchmarks vs. prior deals; similar-deal matching | A | |
| Confidence calibration and reviewer feedback loop | B | Dismiss reasons train ranking per customer |
| Continuous monitoring (new doc contradicts an accepted fact) | B | |
| Quantified valuation impact per finding (EV bridge from accepted findings) | B | Deterministic, links to the decision |

### Research
| Feature | Tier | Notes |
|---|---|---|
| External research kept separate from seller data | A (synthetic) | Market, competition, regulatory, public records, reviews, people |
| Real sourcing (court/UCC records, state licensing lookups, news, reviews) | B | Permitted sources only; cited; dated |
| Competitive and labor-market signals (job postings, wage pressure) | C | |

### Execution and collaboration
| Feature | Tier | Notes |
|---|---|---|
| Decisions with options, reviews, approval and rationale | A | |
| Outcome-oriented asks ("Prepare me for tomorrow") | A | |
| Deliverables generated from the graph and flagged stale | A | IC memo, weekly update, meeting brief, Day-1 plan |
| Email/Teams digest of the briefing; meeting-prep reminders | B | Explicit, opt-in; no inbox surveillance |
| Selected-email ingestion (forward a thread to the deal) | C | |

### Learning loop
| Feature | Tier | Notes |
|---|---|---|
| Predicted vs. actual for completed deals; lessons; adopt into playbook | A | |
| Atlas-proposed playbook changes from cross-deal patterns | A | e.g. concentration escrow above 10% |
| 100-day / 12-month outcome check-ins against thesis and synergies | B | Ties value realization to memory |
| Playbook versions and "what changed since v3" | C | |

## Architecture implications for the real build

- **LLM reads, code computes.** Extraction is done by models into typed fields with source spans. Every metric, threshold test and benchmark runs in code, as in `playbook.ts`. This is how numbers stay trustworthy.
- **Proposal is a first-class entity** (`Proposal` in `types.ts`). It holds kind, payload, basis, confidence, sources and status. Every AI output that could change the deal goes through it, so we get human-in-the-loop and an audit trail for free.
- **The graph is the source for deliverables.** Generation stays controlled (`generate.ts`), and a model polishes the prose inside each section without inventing content.
- **Retrieval is scoped to the tenant and the deal**, and memory retrieval is scoped to the same acquirer's completed deals.

## Questions for the SME session

1. *"If the system could do all of this automatically from the documents and information your team already produces, which parts would actually change how you run an acquisition?"*
2. Which Atlas proposals would you accept without re-checking the source? Which would you always check?
3. Who on your team would work the review queue, and how often?
4. Is "playbook as code" realistic? Do you have written thresholds today, or are they in people's heads?
5. What would this be worth, and who signs?

## Sources

- [Ansarada: Best AI data rooms for due diligence (2026)](https://www.ansarada.com/article/best-ai-data-rooms-due-diligence-2026)
- [Papermark: Best AI virtual data rooms for M&A due diligence in 2026](https://www.papermark.com/blog/best-ai-virtual-data-room-for-m-and-a-due-diligence)
- [Hebbia: Top 10 AI solutions for due diligence (2026)](https://www.hebbia.com/resources/ai-solutions-for-due-diligence)
- [Marvin Labs: Rogo vs Hebbia comparison](https://www.marvin-labs.com/blog/ai-tools-for-equity-research-complete-platform-comparison/)
- [The FinRate: Keye launches Odin](https://thefinrate.com/keye-launches-ai-co-pilot-odin-to-revolutionise-private-equity-due-diligence/)
- [Midaxo: Q2 update and major AI release](https://www.midaxo.com/blog/midaxo-closes-q2-with-new-customers-and-a-major-ai-update)
- [Midaxo: M&A intelligence platform](https://www.midaxo.com/m-a-software)
- [McKinsey: The continuing case for programmatic M&A](https://www.mckinsey.com/business-functions/strategy-and-corporate-finance/our-insights/repeat-performance-the-continuing-case-for-programmatic-m-and-a)
- [L.E.K.: How serial acquirers drive outperformance](https://www.lek.com/insights/post-merger-integration/keys-ma-success-how-serial-acquirers-drive-outperformance)
- [Pillsbury: Home service business rollups](https://www.pillsburylaw.com/en/news-and-insights/home-service-business-rollups-buyers-sellers.html)
- [Kroll: M&A in residential HVAC services](https://kroll.com/en/publications/ma-residential-hvac-services-industry)
