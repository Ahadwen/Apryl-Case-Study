# Slide content record

Agreed content per slide. Copy is draft until marked final; the deck is rendered from this once every slide is agreed.

## Title — agreed

- Eyebrow: Case study
- Title: Progyny Global
- Byline: Alastair Hadwen · 2026
- (No subtitle: "Response to the case study brief" dropped)

## 01 · Context — agreed (copy: draft)

Mockup: `drafts/context.html`

**Title:** Approach, what we know, and what we assume

**Approach** — *How I'd work* (numbered, narrower first column)
1. Confirm the priority — Is this the metric to focus on?
2. Identify a problem — Is there a sensible way to move it?
3. Investigate and prototype
4. Build a small, focused solution
5. Qualify the result — Did it move?

**What we know** — *Confirmed*
- 2 FTE review claims (alongside digital card transactions); 2 more hires planned for 2026
- Requirements are a matrix: country × treatment × employer
- An invoice is always required; proof of payment usually
- Proof of medical necessity drives back-and-forth between member, Progyny and clinic
- Multi-document uploads are split by hand

**What we assume** — *To be tested*
- Most of the 40% of information requests are preventable at upload
- Most claims would be straightforward if all data and documents were already presented as required
- Much of the delay comes from discussion between operators, members, and clinics, around missing documentation
- Proof of medical necessity can be requested at step one
- A claim can move between created, submitted, and closed states

**Space steps:** heading → Approach → What we know → What we assume

**Carried forward:**
- Four-eyes (two human sign-offs) → was planned for Proposal; dropped there as out of scope
- Research activities (sit with reviewers, inventory knowledge in people's heads, baseline metrics, legal/DPIA advice) → Milestones, weeks 1–2

## 02 · The problem — agreed (copy: draft)

Mockup: `drafts/problem.html`

**Headline**
- (grey) Not a back-office problem. Not a UX problem.
- (black) A collaboration problem.

**Paragraph**
Reviewers know what a claim needs. Members have most of the documents; some, like proof of medical necessity, only the clinic can provide. **The goal: help the member understand what's needed from them, as seamlessly as possible, before they submit.**

**Diagram** (steps coloured by party: Member / Progyny / Clinic)
- Today: Member submits (M) → [loop, "repeats for 40% of claims": Reviewer finds what's missing (A) → Request sent to member (A) → Member asks clinic (M) → Clinic sends document (C) → Member re-uploads (M)] → Decision (A)
- Proposed: Member sees exactly what's needed (M) → Member gathers it, asking the clinic early (M) → Clinic sends document (C) → Member submits a complete claim (M) → Reviewed once (A) → Decision (A)

**Space steps:** headline → paragraph → Today → Proposed

**Layout notes:** paragraph fixed width (960px) at 1em so it sits on three lines; generous space above the diagram.

**Moved elsewhere:** the old hypothesis conditions and assumptions (see Research).

## 03 · Proposal — agreed (copy: draft)

Mockup: `drafts/proposal.html` (17px; it's dense, but read one section at a time)

**Title (two lines):** Claim creation document upload redesign: / *(accent)* A clear checklist of required documentation

**Lead:** Today, only the operator knows what a claim needs. We put that knowledge at the start: each member sees exactly what their claim requires, gathers it with help, and can only submit once it's complete. **Operators receive complete, confirmed claims.**

**What changes for the member** (numbered)
1. They say what they're claiming for. With their country and employer, that defines the checklist.
2. The checklist asks for a few mandatory documents, then information, which can come from any document on a provided shortlist. Documents only count if they identify the member.
3. If proof of medical necessity is needed, they're told upfront, with a ready-made message for their clinic.
4. The member doesn't need to type anything: information is pulled from the provided documents, and they only confirm the retrieved data.
5. Anything the scan reads incorrectly, or any missing data: the member is prompted to upload another document, or type it manually, but flagged for the operator to confirm.
6. Submit unlocks only when the checklist is complete.

**What changes for the operator**
- **Complete claims:** most claims arrive with complete and confirmed information and documents.
- **Automation:** deterministic checks run automatically on the resulting data (e.g. employer date ranges).
- **Sources:** each fact is shown with its source highlighted.

**Principles** (strip along the bottom)
- **Privacy and GDPR:** documents are read and masked on the member's device. The AI never learns who the member is.
- **Machine vs. human:** we automate the data retrieval; the judgement still sits with the operators.

**Space steps:** title + lead → member → operator → principles

**Dropped:** two lanes (clean / judgement), four-eyes, "alternative considered".

## 04 · Metrics — agreed (copy: draft)

Mockup: `drafts/metrics.html` (17px)

**Title:** Metrics, and a definition of success
**Subtitle:** Captured from week 1, before anything changes, so we can test our assumptions.

**Left — table "Everything we should capture"**
- Operator: Time between claim creation and closure (granted, at least partially) · Time between claim creation and closure (denied) · Time between claim submission and last document upload before closure · Number of document requests · Operator minutes per claim (no judgement call required) · Operator minutes per claim (judgement call required) · Operator minutes per claim (on average, full sample) · % of claims rejected
- Member: Abandonment rate · Document rejection rate · Manual entry rate

**Right — "Success: should improve"** (*What the redesign is for*), plain bullets
- **Time between submission and last document upload: towards zero** (bold)
- Number of document requests
- Operator minutes per claim (no judgement call required)
- Time between claim creation and closure (granted)

**Right — "Guardrails: shouldn't get worse"** (*What the redesign could break*)
- Abandonment rate: the checklist mustn't put members off
- % of claims rejected: complete doesn't mean eligible
- Manual entry and document rejection rates: low, or extraction isn't working

**Space steps:** title → table → success → guardrails

## 05 · Prototype — agreed

Already built (full-window slide). Lead-in bar: **05 · Prototype** · Data extraction, information checklist, which gates claim submissions · *Left: what the member sees · Right: behind the scenes*

## 06 · Milestones — agreed (copy: draft)

Mockup: `drafts/milestones.html` (week 1 is in January)

- **Weeks 1–2:** Sit with reviewers and understand their workflows · Capture domain-specific operator knowledge: country exceptions, judgement calls, Slack escalations · Set up metric capture and dashboards · Discuss privacy and data regulation with legal · Validate a prototype with the operators
- **Go ahead** (green): Decision against the go-ahead checklist
- **Weeks 3–6:** Build the feature, with continued input from operators where needed · Test against historical claims
- **February:** Feature goes live
- **March–June:** Follow the dashboard periodically, and intervene with further effort if needed · Otherwise, move focus to a different product area

**Go-ahead checklist** (green box, right; steps in with the Go ahead row)
- *Proposal approval from:* Claims operators · Legal
- *Investigation and time tracking metrics confirm that:* Operator time spent on claims is a reasonable goal to prioritise · Incomplete document submissions are a reasonable problem to target

**Space steps:** heading → each row (Go ahead row + checklist together)

**Note:** "legal confirmation", not "legal and DPIA" (also update Risks).

## 07 · Risks and scoping — agreed (copy: draft)

Mockup: `drafts/risks.html`

**Risks**
- Legal confirmation is the critical path. No AI on real documents until it's done.
- Needs the claims team's time: to write down rules, and for us to sit with them and understand their workflows.
- OCR quality on bad photos.
- Guardrail metrics may show need for further action.
- Anonymised medical letters can still contain health details.

**Scoping**
- In scope: Metrics and dashboards · Claim type and checklist · Document reading, masking and extraction · Member confirmation and gated submit · Operator view with sources
- Out of scope: Fraud, payout, employer configuration tooling · Changes to how operators make judgement calls
- **Team:** about 2 engineers, plus time from the claims team.

**Space steps:** heading → risks → scoping

## 08 · AI usage reflection — agreed (copy: final)

Mockup: `drafts/ai-usage.html`

**Title:** How I used AI

**What it did**
- Brainstorming, dissecting the brief, and stress-testing assumptions
- Built the prototype and this deck, iterating on my instruction
- Sense checks, grammar and spelling checks, and quality control throughout my inputs and drafts

**What it didn't do**
- Case study approach and strategy
- Matters of taste and language

**Where I overruled it**
- It pitched a standard slide deck. I wanted a browser app where the prototype is a slide.
- The prototype's "behind the scenes" panel was broadly visible in the main screen. I split it off.
- It spoke on my perspective, for example it invented an "alternative considered and dismissed" with inviable options I had never considered. I removed such cases.
- I consistently overruled it on language: it reached for jargon and corporate speak; I insisted on readability.

**Space steps:** heading → what it did → what it didn't do → where I overruled it

## Order

Title · 01 Context · 02 Problem · 03 Proposal · 04 Metrics · 05 Prototype · 06 Milestones · 07 Risks and scoping · 08 AI usage — rendered in the deck
