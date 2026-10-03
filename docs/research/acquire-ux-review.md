<!-- Reference input supplied by the product owner (a separate Claude Opus research brief). Kept verbatim for the gap analysis in ../acquire-comparison-and-process-gaps.md. -->

# Acquire.com — UX & Product Capability Review
*Handover brief for Claude Code · prepared 3 Oct 2026*

> **Scope & confidence.** Based on Acquire.com's public marketing pages (home, seller pricing), its help center, and third-party reviews. The logged-in app (`app.acquire.com`) is behind signup and was **not** directly inspected, so in-app flows below are reconstructed from help docs and should be treated as inferred. One major review source (ExitBid) is a direct competitor, so its criticisms are flagged as such.

---

## 1. What the product is

A **two-sided M&A marketplace for small online businesses** (SaaS first; also ecommerce, apps, agencies, content, newsletters, AI, crypto). Sellers list anonymously; paying buyers browse, sign NDAs, chat, and submit LOIs; deals close via third-party escrow. A human advisory layer ("Guided by Acquire") sits on top for larger SaaS deals.

**Positioning claims (homepage):** 500k+ users, 2,000+ startups sold, $500M+ closed volume, $2B+ verified buyer funds, "sell in as little as 90 days."

**Origin:** launched as MicroAcquire (Jan 2020), rebranded to Acquire.com in 2022 and moved upmarket.

## 2. Business model

| Side | Plan | Price | What it unlocks |
|---|---|---|---|
| Seller | Asking < $250k | $25/mo listing + **8%** closing fee | Listing, CSM, NDAs, doc builders, free escrow |
| Seller | $250k–$1M | $50/mo + **7%** | same |
| Seller | > $1M | $100/mo + **6%** | same |
| Seller | Guided by Acquire | Included (SaaS, $100k+ TTM only) | In-house M&A advisor, marketing, buyer matchmaking, negotiation coaching |
| Buyer | Basic | Free | Public listing data only — **no chat, no private data** |
| Buyer | Premium | $390/yr | Full access to listings up to $250k TTM revenue |
| Buyer | Platinum | ~$780/yr (some sources quote higher) | All listing sizes, priority support, matchmaking |

**Key insight:** monetises both sides. Seller listing fee is explicitly framed as a seriousness filter; buyer paywall is a tire-kicker filter. Both shrink liquidity — a deliberate quality-over-volume trade-off.

## 3. Personas

1. **Bootstrapped founder / seller** — first-time exit, non-expert in M&A, privacy-sensitive, wants speed + max price.
2. **Individual / first-time buyer** — "acquisition entrepreneur," budget < $250k, needs education + financing.
3. **Serial acquirer / small PE / holdco** — high deal volume, wants filtering, alerts, fast LOIs.
4. **Internal M&A advisor / CSM** — ops persona; vets listings, coaches sellers, qualifies buyers.

## 4. Capability inventory

### 4.1 Seller side
- **Onboarding & listing builder** — business details, revenue, growth, tech stack, team, reason for sale; submitted for review before going live (vetting gate).
- **Free valuation tool** (standalone SaaS valuation; also a top-of-funnel lead magnet).
- **Synchronized metrics** — integrations (e.g. Stripe/analytics) keep listing financials live and verified.
- **Anonymity by default** — company name and sensitive data hidden until NDA.
- **Automated NDAs** gated per buyer.
- **Data room** for diligence docs.
- **Offer inbox** — structured LOIs make offers comparable.
- **Legal doc builders** — LOI and APA (asset purchase agreement) templates.
- **Escrow integration** (Escrow.com), fee paid by platform.
- **Assigned CSM / acquisition expert** — listing optimisation, buyer-seriousness signals.
- **Paid ad campaigns** promoting listings to the buyer base.

### 4.2 Buyer side
- **Acquisition-criteria onboarding** — category, TTM revenue min/max, asking price range, countries → drives recommendations.
- **Marketplace browse + filters**; category landing pages (SEO).
- **Recommended matches**, "similar startups," favourites / custom lists.
- **Listing detail page** with web, customer and financial metrics; return projection.
- **NDA request → private data unlock.**
- **In-platform chat** with founders (paywalled).
- **LOI builder** — "make an offer in minutes."
- **Proof of funds verification.**
- **Acquisition financing** via lending partners.
- **Instant Slack alerts** for new matching listings.
- **Education** — buyer course, academy, ebooks, blog.

### 4.3 Platform / ops
- Listing moderation queue, buyer identity + funds vetting, tiered entitlements, subscription billing, fee collection at close, advisor assignment, referral and partner programs, regulated brokerage entity (CA DRE licence).

## 5. Core flows (for implementation)

**Seller:** Sign up (role=seller) → listing wizard → connect metrics → submit for review → [admin approves] → live (monthly billing starts) → receive NDA requests (auto-sign) → chat → receive LOIs → accept LOI → diligence in data room → APA via doc builder → escrow → close (closing fee charged) → listing marked sold.

**Buyer:** Sign up (role=buyer) → criteria quiz → recommendations feed → listing detail (public) → **paywall** → upgrade → request NDA → private data → chat → LOI builder → submit → diligence → APA → escrow → close.

**Deal state machine (suggested):**
`interest → nda_signed → in_conversation → loi_submitted → loi_accepted → diligence → apa_signed → in_escrow → closed | withdrawn | rejected`

## 6. UX review

### Strengths
- **Clear dual-sided IA.** Top nav splits Sellers / Buyers / Pricing / Resources; every CTA is role-tagged (`signup?role=seller`).
- **Heavy social proof.** Volume stats + ~20 named testimonials, many naming individual advisors — humanises a high-trust transaction.
- **Transparent seller pricing** with a simple 3-tier slider and an explicit competitor comparison table (vs. other marketplaces and brokers).
- **Progressive disclosure of sensitive data** (public → NDA → data room) matches seller privacy anxiety well.
- **Structured LOIs** reduce negotiation chaos and make offers comparable.
- **Criteria-based matching** tackles browse overwhelm for buyers.
- **Strong SEO surface** — category pages, free valuation, blog, help center.

### Weaknesses / friction
- **Homepage CTA "View Listings" goes straight to signup** — no logged-out browsing teaser on the homepage. High friction for curious buyers.
- **Buyer paywall before first conversation** — a buyer can't validate any listing via chat before paying. Hurts conversion and shrinks seller-visible demand.
- **Marketing pages require JavaScript** to render (no SSR fallback) — SEO and accessibility risk, and blocks link previews/crawlers.
- **Messaging drift** — "free to list" heritage vs. current listing fee + 6–8% closing fee; older help docs and testimonials still say "sellers don't pay a fee." Trust-eroding inconsistency.
- **Platinum pricing is inconsistent** across sources — buyers can't easily verify what they'll pay.
- **Passive marketplace dynamics** (competitor-reported): no built-in urgency or competitive bidding; listings go stale after the first couple of weeks; 3–6 month timelines common.
- **Low-signal NDAs and post-LOI ghosting** (competitor-reported): NDA volume ≠ intent; LOIs are non-binding. No visible buyer reputation/track-record mechanism to counter this.
- **Fit gap** — content sites, sub-$5k MRR, non-tech businesses reportedly underperform despite being listed as supported categories.

### Opportunities (if building a competitor or improvement)
1. **Free first message / limited free chats** for verified buyers; paywall depth, not access.
2. **Buyer reputation score** — NDA→LOI→close conversion, response time, verified funds badge; let sellers filter on it.
3. **Optional time-boxed "deal window" or sealed-bid round** to create urgency inside the marketplace model.
4. **Stale-listing reactivation** — auto-refresh, price-drop alerts, re-promotion after N days without engagement.
5. **Deal pipeline view** (kanban) for both sides with the state machine above.
6. **Diligence checklist** auto-generated by business type, tied to the data room.
7. **SSR marketing pages** + logged-out listing previews for SEO and conversion.
8. **Fee calculator** showing seller net proceeds before signup.

## 7. Suggested MVP scope for a build

**Must-have (v1):** role-based auth; seller listing wizard with draft/review/live states; admin moderation; public listing cards (anonymised); buyer criteria + filtered search; NDA click-through gating private fields; 1:1 messaging; LOI form (structured fields) with accept/reject; subscription tiers with entitlement checks; basic seller and buyer dashboards.

**v2:** metrics integrations (Stripe first); data room with per-buyer access; APA template generator; escrow hand-off; Slack/email alerts; recommendations; buyer reputation; valuation tool.

**Later:** financing partners, advisor/CSM workspace, ad campaigns, referral/partner programs.

## 8. Suggested data model (starting point)

- `users` (id, role[seller|buyer|admin], name, email, verified_identity, proof_of_funds_status)
- `subscriptions` (user_id, plan, status, renews_at)
- `buyer_criteria` (user_id, categories[], ttm_min, ttm_max, price_min, price_max, countries[])
- `listings` (id, seller_id, status[draft|in_review|live|under_loi|sold|withdrawn], category, headline, public_summary, asking_price, ttm_revenue, ttm_profit, mrr, growth_pct, tech_stack[], team_size, reason_for_sale, country, private_fields jsonb, created_at)
- `listing_metrics` (listing_id, source, period, revenue, profit, customers, traffic, synced_at)
- `ndas` (listing_id, buyer_id, signed_at)
- `conversations` / `messages`
- `offers` (id, listing_id, buyer_id, type[loi|apa], price, cash_at_close, earnout, seller_financing, exclusivity_days, diligence_days, status, created_at)
- `deals` (listing_id, buyer_id, offer_id, stage, escrow_ref, closed_at, closing_fee)
- `favorites`, `alerts`, `documents` (data room, with access grants)

**Entitlement rule example:** Premium buyer may open chat/NDA only where `listing.ttm_revenue <= 250000`; Platinum unrestricted; Basic none.

## 9. Open questions for the product owner

1. Are we **cloning**, **benchmarking**, or **building a differentiated competitor**? (Changes which weaknesses to fix.)
2. Target market and currency — global/USD, or a specific region (e.g. India, INR, local escrow and regulatory requirements)?
3. Monetisation: seller success fee, buyer subscription, both, or flat fee?
4. Marketplace model: passive listings, auctions, or hybrid?
5. Preferred stack, payments provider, and escrow partner?
6. Is a human advisory layer in scope, or fully self-serve?

## 10. Sources
- acquire.com (homepage) and acquire.com/seller-pricing — fetched 3 Oct 2026
- help.acquire.com — "How does Acquire.com work", "buyer pricing plans", "startup recommendations"
- exitbid.io/blog/acquire-com-review-2026 (competitor; treat critiques as directional)
- Product Hunt launch history; Indie Hackers founder interview

https://acquire.com

I've written the review as a Markdown file so you can drop it straight into your repo for Claude Code. It covers the business model, personas, a full list of features, the main user flows, UX strengths and weaknesses, a suggested MVP scope, a starting data model, and open questions.
The headline findings:

* Product: Acquire.com positions itself as the largest marketplace for buying and selling profitable online businesses, covering SaaS, ecommerce, agencies, content, newsletters, mobile apps and crypto businesses.
* Business model: both sides pay. Sellers pay a closing fee of 8%, 7% or 6% depending on asking price, plus a monthly listing fee of $25 to $100. Buyers can browse for free, but they can't chat with founders or see private listing details until they upgrade to Premium or Platinum.
* Biggest UX strength: sensitive information is revealed in stages (public listing, then NDA, then data room), and offers come in a structured LOI format.
* Biggest UX friction: the paywall comes before a buyer can send a first message, and the marketing pages don't render without JavaScript.

A few caveats are also noted in the file. I couldn't see inside the logged-in app, so the in-app flows are pieced together from the help docs. The harshest criticisms come from ExitBid, which is a direct competitor. Sources also disagree on the Platinum buyer price.
Before you hand this off, it's worth answering the first open question in section 9: are you cloning Acquire.com, benchmarking against it, or building a different competitor (for example, one aimed at the Indian market)? The answer changes what Claude Code should build first.
