# Acquisition Workspace: SME validation prototype

A clickable, front-end-only prototype of an intelligent M&A workspace for lean serial acquirers (2–10 deals a year in fragmented service industries). It exists so an experienced M&A practitioner can use it and tell us whether the workflow, terminology, objects and AI interactions match how real deal teams work, **before** any backend is built.

> **All data is synthetic.** Meridian Field Services, ABC Mechanical, the people, the documents and the numbers are fictional.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production build
npm run lint       # TypeScript type check
npm run build:share  # one self-contained HTML file (hash routing) → share-dist/share/index.html
```

`build:share` bundles the same pages with Vite into a single HTML file that runs without a server, so the prototype can be shared as a link. It swaps `next/link`, `next/navigation` and `next/dynamic` for small hash-routing shims in `src/share/`. In that build, Print and file export are hidden because sandboxed hosts block them.

Start at **Prototype guide** (`/guide`) for a 10-minute tour and the questions we want answered. Use **Feedback** on any screen to capture notes (stored in the browser, exportable as Markdown). The reset button in the top bar restores the demo to its starting state.

## What's in it

| Area | What the reviewer can do |
|---|---|
| Portfolio | See active deals with phase, attention counts and the next milestone. See completed deals and their outcomes. Create a new acquisition. |
| Acquisition overview | See where the deal is, what needs attention, decisions waiting, workstream progress, the thesis tracker and recent activity. Prompts open Atlas. |
| 8 deal phases | Phase-specific views: thesis, EBITDA bridge and implied EV, LOI terms, diligence progress, finding → SPA protection map, approvals, closing checklist, integration and value realization. Phases overlap. |
| Workstreams & work items | 9 standard workstreams. Tasks, requests, reviews and approvals, with owner, reviewer, dependencies, filters and a detail drawer. |
| Findings | First-class objects with evidence, sources, calculation, comparison to the thesis, AI interpretation, recommendation, implications, discussion and a Finding → Risk → Decision → Action trace. |
| Risks | Register with a severity × probability heatmap. Risks are created from findings and addressed by decisions. |
| Decisions | Question, context, evidence, options with pros and cons, recommendation, reviews, approval with rationale, downstream impact and audit trail. |
| Documents | Content search, a page-level viewer with highlighted citations, and simulated upload → processing → Atlas proposes a finding → human accepts. |
| Deliverables | IC memo, management meeting brief, weekly update, Day-1 plan and others. Each is **generated from structured deal data** and editable in BlockNote. Facts link to source pages. |
| Ask Atlas | Contextual assistant (drawer or full screen). Every statement is labeled *Fact*, *AI interpretation*, *Recommendation*, *Decision* or *From prior deals*, and has a **Why?** popover with its sources. |
| Memory & Playbook | Predicted vs. actual for 5 completed deals, patterns recurring in the current deal, and lessons adopted into the playbook. |
| Activity & automation | Full audit feed (people, Atlas, rules) and 5 toggleable M&A workflow rules. |

### Workflow rules that actually run

- **LOI recorded as signed** → create the 9 diligence workstreams and the initial request list.
- **High or Critical finding created/accepted** → create a review work item.
- **Decision approved** → create a follow-up action per downstream impact and move linked risks to *Mitigating*. Approving the ABC price decision also updates the working EV.
- **Document processed** → Atlas proposes a finding, which stays *Proposed* until a person accepts it.

### What is simulated

Atlas answers are composed deterministically from the structured demo data, so they change as the deal changes. Nothing calls an LLM. Document extraction is pre-written excerpts. Uploading your own file does not read it. There is no login: the user switcher in the top bar stands in for roles, and approvals are restricted to the named approver.

## Phase 0: architecture assessment (summary)

- **Repository:** empty at start, so there was no existing stack, auth, database, UI system or tests to reuse.
- **Objective changed** from "build the platform" to "validate the product model with an SME", so the backend (FastAPI/Postgres/pgvector/S3/workers), auth, RAG and integrations are **deliberately not built**.
- **Stack chosen (smallest coherent set):**
  - Next.js 16 (App Router) + React 19 + TypeScript.
  - **Mantine 9** as the single UI system, themed for an enterprise look: navy command bar, cobalt brand, cool slate neutrals, IBM Plex Sans/Mono. `@mantine/spotlight` powers ⌘K search across deals, findings, decisions, risks, documents and work. BlockNote's official Mantine binding means the editor and the app share one component system, so we don't mix MUI or shadcn.
  - **BlockNote** as the single rich-text editor, used for deliverables only.
  - **Zustand** with `persist` as an in-browser stand-in for the API, plus a small ephemeral UI store.
  - `@tabler/icons-react`, `date-fns`.
- **Deliberately omitted:**
  - TanStack Query, because there is no server state yet. It should come in with the API.
  - TanStack Table, because Mantine tables plus local sorting were enough at this data size.
  - Recharts, because the only charts (EBITDA bridge, risk heatmap, progress) are simpler as plain elements.
- **Backend-ready seams:** `src/lib/types.ts` is the domain model, and every mutation goes through a store action in `src/lib/store.ts`. Each action maps 1:1 to a future API endpoint plus a server-side workflow rule. Screens never mutate data directly.

## Code map

```
src/
  app/                       routes (portfolio, memory, guide, feedback, acquisitions/[id]/…)
  components/                shared UI: Atlas, chrome, forms, tables, drawers, editor
  data/                      synthetic seed data (ABC Mechanical, documents, portfolio, uploads)
  lib/
    types.ts                 domain model: Acquisition, WorkItem, Finding, Risk, Decision, Document, Deliverable…
    store.ts                 mock service layer + workflow rules (future API boundary)
    atlas.ts                 simulated, evidence-labeled intelligence layer
    generate.ts              controlled deliverable generation from structured data
    meta.ts, derive.ts       phases, workstreams, formatting, derived progress
```

## Suggested next steps after SME review

1. Revise terminology, phases, workstreams and objects based on SME feedback, then freeze the domain model.
2. Build the backend around the validated model: FastAPI + Postgres (tenant-scoped), S3-compatible storage, async document processing, pgvector retrieval with permission-scoped queries, an LLM provider abstraction with citation enforcement, and an audit log.
3. Replace `store.ts` actions with API calls via TanStack Query. Screens stay the same.
