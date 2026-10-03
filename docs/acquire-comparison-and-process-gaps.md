# Acquire.com comparison, process-flow gap analysis, and terminology

Inputs:
- Acquire.com public pages and reviews. The site itself was not reachable from the build environment; sources are listed at the end.
- The attached "M&A Process Flow" (Meta AI export), and the full "What happens in each phase" descriptions supplied afterwards (exclusivity 30–90 days; LOI terms; parallel DD workstreams; SPA protections; financing and approvals; closing; PMI).
- A separate research brief, *Acquire.com — UX & Product Capability Review*, kept verbatim in [`research/acquire-ux-review.md`](research/acquire-ux-review.md). Section 4 below is the gap analysis against it.

## 1. Acquire.com vs. this product

### Positioning

| | Acquire.com | This product |
|---|---|---|
| What it is | Two-sided **marketplace** to buy and sell small online businesses (SaaS, e-commerce, content) | **Buy-side acquisition intelligence workspace** for acquirers running repeated deals |
| Primary user | Founders selling; individual and small-fund buyers | Corp dev / finance / integration teams at serial acquirers and PE platforms |
| Typical deal | Mostly sub-$10M online businesses, often asset purchases (APA) | $5–60M operating companies (services, healthcare), usually equity purchases (SPA) |
| Revenue model | Listing fee ($25–100/mo) + 6–8% success fee to the seller; buyers browse and sign NDAs free | Subscription (per organization / per acquisition), no transaction fees |
| Process coverage | Listing → NDA → data room → LOI builder → diligence → APA → escrow → close | Strategy → valuation & IOI → LOI → multi-workstream diligence → SPA → financing & approvals → closing → integration → outcomes → memory |
| Intelligence | Verified metrics (Stripe/analytics) before NDA; ID-verified buyers, "verified funds" badge | Document reading, playbook scoring, prior-deal matching, seller-claim checks, drafted risks/decisions/questions, institutional memory |

**Conclusion:** they don't compete. Acquire.com is a sourcing and transaction rail for small digital assets, and it is seller-centric. We are the buy side's operating and intelligence layer for complex operating businesses. The overlap is limited to Phase 1 sourcing (targets, NDA, teaser) and the mechanics of Phases 3 and 7 (LOI, closing). That is why the prototype's Pipeline page is explicitly "your own buy-side list, not a marketplace".

### Functionality by phase

| Phase | Acquire.com | This prototype |
|---|---|---|
| 1 Strategy & screening | Search and filter listings by metrics; buyer profile; NDA requests | Target pipeline (long list → short list → NDA → CIM) with playbook pre-screen; investment thesis; Atlas research |
| 2 Valuation & IOI | Seller-stated asking price; marketplace metrics | Playbook fit, benchmarks vs. own past deals, EBITDA bridge, drafted IOI letter |
| 3 LOI | **LOI Builder** (one click) inside the Guided Acquisition Process | **Structured LOI terms** (EV, cash at close, seller note, earn-out, rollover, NWC peg, exclusivity, diligence period, management retention, conditions) drafted by Atlas from the playbook and findings, each with its basis; Draft → Sent → Signed; one-click LOI letter |
| 4 Due diligence | Data room access, chat with seller, checklists | 9–10 playbook workstreams, Atlas data-room analysis, findings → risks → decisions → actions, information requests, **Q&A with management**, seller-claim verification, review queue |
| 5 Definitive agreement | APA templates via partner law firms | **Deal protections** card (R&W, MAC, indemnification cap and basket, escrow, survival, non-compete, price adjustment, R&W insurance), each tied to what drives it; finding → protection map |
| 6 Financing & approvals | — | IC memo; approvals (IC, board, HSR, CFIUS, shareholder vote, third-party consents); financing (facility, lender credit memo, debt commitment letter, equity documents, covenant headroom) |
| 7 Closing | **Escrow partners** (Escrow.com, SRS Acquiom) | Closing checklist: conditions precedent met or waived, funds wired per funds flow, shares transferred, announcements to employees, customers and suppliers; funds flow memo as a key deliverable |
| 8 Integration | — | Day 1 plan, 100-day plan, value realization targets, integration KPIs |
| After close | — | Outcomes vs. thesis, lessons, playbook changes, archive backfill, memory queries |

### UX comparison

**What Acquire.com does well, and what we borrowed:**
1. **A guided process with an obvious next step.** Their "Guided Acquisition Process" keeps both parties on one visible track. *Adopted:* the deal header now shows **"Next step: …"**, taken from the first unfinished key deliverable of the current phase. Every phase page lists key activities and deliverables with live status.
2. **One-click templates.** The LOI Builder is one click away from the deal. *Adopted:* key deliverables can be **drafted in one click** from the phase page (Investment Thesis, IOI, Due Diligence Report, Day 1 and 100-Day plans), generated from structured data.
3. **Metric-dense cards and fast short-listing.** Listings expose MRR, churn and margin before the NDA. *Adopted:* pipeline cards show revenue, EBITDA, source and a playbook **pre-screen**.
4. **Trust badges** ("verified funds", verified metrics). *Adopted:* every metric in the playbook-fit table carries **Verified** (an advisor report or internal source system backs it) or **Seller-stated** (only seller documents back it), derived from its cited documents.
5. **Automated NDA and access flow.** *Future:* a seller portal for NDA, information requests and Q&A responses.

**Where our UX has to differ:**
- Acquire.com is consumer-grade and built around a marketplace. Ours is a professional workspace: dense tables, audit trail, roles and approvals, evidence labels, and multi-person review.
- Their chat is a free-form conversation between two parties. Our Q&A is structured: each question is linked to a finding, has a status, and is drafted by Atlas.
- No public listings, no success fees, no seller-side optimization.

## 2. Process-flow gap analysis

| Phase | From the process flow | Before | Added now | Still open |
|---|---|---|---|---|
| 1 | Define thesis, criteria, **synergies**; screen; outreach; **long list → short list; NDA; teaser/CIM** | Thesis, playbook criteria | **Target pipeline** with stages, sources, pre-screen, pass reasons; **Investment Thesis** deliverable with synergy hypotheses; "Target list" and "Teaser / CIM review" deliverables | Synergy values as structured data; NDA document tracking |
| 2 | Comps, precedents, DCF; CIM review; **management meetings**; **IOI** | Valuation bridge, management meeting brief | **IOI letter** deliverable; valuation range status; phase renamed "Preliminary Valuation & IOI" | Comps/precedents/DCF (connect to the team's model rather than rebuild it) |
| 3 | Price (EV), **cash vs stock**, **earn-outs**, **working capital peg**, **management retention**, exclusivity 30–90 days | LOI terms, exclusivity decision | **Structured LOI terms** drafted by Atlas with a basis per field; LOI letter generated from them; exclusivity tracked | Term-sheet comparison across bidders |
| 4 | Financial, legal, tax, commercial, operational, IT, HR, **ESG**; **Q&A with management**; DD reports; risk register; **purchase price adjustments** | Workstreams (no ESG), findings, risks, information requests | **ESG & Safety** workstream (ESG & Patient Safety for healthcare); **Q&A with management** page (Atlas drafts from findings; send, answer, follow up); **Due Diligence Report**; PPA status from the price decision | NWC peg calculator; debt-like items schedule |
| 5 | Reps & warranties, **MAC clause**, **indemnification caps**, **escrow**, **non-competes** | Finding → protection map | **Deal protections** card; signed definitive agreement as a key deliverable | Disclosure schedules; R&W insurance quote workflow |
| 6 | **Debt commitment letters**, equity documents, **HSR**, **CFIUS**, board / shareholder votes | Approvals and financing checklists | HSR, CFIUS, shareholder vote, third-party consents, debt commitment letter, equity documents | Lender data room |
| 7 | **CPs met**, **funds wired**, **shares transferred**, **announcements** | Closing checklist | CPs, wires, share transfer and announcements on the checklist; funds flow memo and closed deal as key deliverables | Funds-flow builder |
| 8 | Day 1 planning, synergy capture, systems/people/**culture**; **100-day plan; integration KPIs** | Day 1 plan, value-realization targets | **100-Day Plan** deliverable with KPIs from the playbook; integration KPIs tracked | Culture assessment; synergy tracking against actuals |

**One deliberate difference from the flow.** The flow describes the phases as sequential. Real deals overlap: agreement drafting, financing and integration planning run during diligence. We keep the 8 phases as the navigation spine and the source of key deliverables, but allow phases to be active at the same time. ABC Mechanical shows this.

## 3. Standard terminology

The canonical vocabulary is in `src/data/glossary.ts` and is shown in the app under **Guide → Terms we use**, so the SME can correct it. Changes applied in this pass:

| Was | Now |
|---|---|
| Preliminary Valuation / IOI | **Preliminary Valuation & IOI** |
| Seller request(s) | **Information request(s)** |
| Atlas review / Atlas review queue | **Review queue** |
| Thesis tracker | **Investment thesis** |
| Thesis fit | **Playbook fit** |
| Diligence Summary | **Due Diligence Report** |
| Day-1 Integration Plan / Day-1 | **Day 1 plan** (+ new **100-day plan**) |
| Reviewer guide / Memory & Playbook (nav) | **Guide**, **Memory**, **Playbooks**, **Pipeline** |

Alternate phase names in the process flow are kept as aliases and shown on each phase page as "also called …": **Valuation & Initial Bid** (Phase 2), **Definitive Agreement Negotiation** (Phase 5), **Post-Merger Integration (PMI)** (Phase 8). The glossary now also defines TTM, NWC peg, earn-out, seller note, SPA vs APA, R&W, MAC, indemnification cap/basket, HSR, CFIUS, conditions precedent, funds flow, and verified vs seller-stated.

## 4. Gap analysis against the Acquire.com UX review

**Answer to its open question 1 (clone, benchmark or differentiated competitor?): differentiated.** We benchmark Acquire.com's UX patterns but do not clone the marketplace. We are buy-side software for acquirers running repeated deals; Acquire.com is a seller-centric marketplace for small online businesses. Its state machine (`interest → nda_signed → in_conversation → loi_submitted → loi_accepted → diligence → apa_signed → in_escrow → closed`) maps onto our pipeline stages (Long list → NDA signed → CIM received) followed by the 8 phases.

| Review opportunity / strength | Applies? | Status here |
|---|---|---|
| Deal pipeline view (kanban) with a state machine | Yes | **Built:** Pipeline page, stage columns, pre-screen, convert to acquisition |
| Diligence checklist auto-generated by business type | Yes | **Built:** information request list generated from the playbook (HVAC vs. healthcare vs. software) when the LOI is signed |
| Structured LOIs that make offers comparable | Yes | **Built:** structured LOI terms with Atlas-drafted basis per field |
| Verified metrics before commitment | Yes | **Built:** Verified / Seller-stated badges on playbook-fit metrics |
| Guided process with an obvious next step | Yes | **Built:** "Next step" in the deal header, key deliverables per phase |
| Progressive disclosure (public → NDA → data room) | Partly | Pipeline stages track NDA and CIM; a seller portal is future |
| Criteria-based matching / alerts on new targets | Yes | Pre-screen exists; **future:** alert when a new pipeline target passes the playbook |
| Seller portal: NDA click-through, request list, Q&A answers | Yes | **Future** (largest remaining UX gap for the seller side) |
| Escrow hand-off | Partly | Escrow is a deal protection and closing item; no escrow integration |
| Buyer reputation score | No | We are the buyer; seller-side trust signals are out of scope |
| Paywall / free first message / subscription tiers | No | No marketplace; priced per organization |
| Sealed-bid rounds, stale-listing reactivation | No | Marketplace dynamics; not relevant to a buy-side workspace |
| Fee calculator (seller net proceeds) | No | No transaction fees. The buy-side equivalent is the LOI consideration check (cash + note + earn-out vs. EV) |
| SSR marketing pages, SEO | No | Prototype only; production marketing site is separate |

**UX weaknesses in the review that we avoid by design:** no paywall before value (everything visible to the deal team); NDA volume is not treated as intent (pipeline stages need a CIM and a pre-screen); non-binding LOIs are tracked with an exclusivity clock and a next step; pricing and fees are not part of the workflow.

## Sources

- [Acquire.com: Guided Acquisition Process](https://blog.acquire.com/introducing-the-acquire-guided-acquisition-process-and-workflow/)
- [Acquire.com: How it works](https://blog.acquire.com/how-acquire-com-works-buy-sell-startups/)
- [Acquire.com Help: The acquisition process for sellers](https://help.acquire.com/what-is-the-acquisition-process-for-sellers)
- [Acquire.com Help: Automatic buyer access and NDA signing](https://help.acquire.com/how-to-configure-automatic-buyer-access-and-nda-signing)
- [ExitBid: Acquire.com review 2026 (pricing and fees)](https://exitbid.io/blog/acquire-com-review-2026)
- [Acquire.com: Buyer & seller terms](https://acquire.com/buyerseller/)
