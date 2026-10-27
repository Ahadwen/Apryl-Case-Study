# Slide content record

Agreed content per slide. The deck was restructured (v2) so the plan comes first and later slides show what each step might look like; the earlier version is in git history.

## Title — agreed

- Eyebrow: Case study
- Title: Progyny Global
- Byline: Alastair Hadwen · 2026

## 01 · Context — agreed

**Title:** How I'd work, and the plan for H1 2027

Two columns, each approach step level with the milestone that delivers it.

| Approach | Milestone |
|---|---|
| 1. Confirm the priority — Is this the right target to work on first? | January, weeks 1–2 — Start capturing metrics and tracking time; sit with operators |
| 2. Identify a problem — Searching for high impact, scalability, and a good ROI | January, weeks 2–3 — Agree the problem and define success, with operators and legal |
| 3. Investigate and prototype — Iterate with stakeholders before engineering gets involved | Late January — Prototype quickly, iterating with design, legal and operators |
| 4. Build a small, focused solution — Stay light, this is likely not the only priority | February — Build the pilot version (two engineers); the pilot starts late February |
| 5. Qualify the result — Did this feature help, is more work needed? | March–June — Follow the dashboard and step in if needed; otherwise, move on to a different product area |

**Space steps:** heading → approach → milestones

## 02 · Metrics — agreed

**Title:** Metrics
**Subtitle:** Captured from week 1, before anything changes, so we can test our assumptions.

**Left — table "Everything we should capture"**
- Operator: Time between claim creation and closure (granted, at least partially) · Time between claim creation and closure (denied) · Time between claim submission and last document upload before closure · Number of document requests · Operator minutes per claim (no judgement call required) · Operator minutes per claim (judgement call required) · Operator minutes per claim (on average, full sample) · % of claims rejected
- Member: Time between opening a claim and submission (proof of medical necessity required) · Time between opening a claim and submission (proof of medical necessity not required) · Abandonment rate

Manual entry rate and document rejection rate only exist once a solution is piloted, so they appear on slide 05 instead.

**Right — summary**
- Member convenience: Time until claim completion · Ease of use
- Operator convenience: Time spent on claims · Time wasted on missing documents · Straightforward claims vs. claims needing judgement

**Space steps:** heading → table → summary

## 03 · Assumptions — agreed

**Title:** Assumptions, and how we'd test them

| Assumption | How we'd test it |
|---|---|
| Most of the 40% of information requests are preventable at upload | Go through recent document requests with operators: which could have been asked for upfront? |
| Most claims would be straightforward if all data and documents were already presented as required | Track operator time on complete versus incomplete submissions |
| Much of the delay comes from discussion between operators, members and clinics around missing documentation | Compare the time from submission to the last document upload with the total time to closure |
| The current member screen is a fairly loose request for documentation | Review the screen with operators, and look at what members actually upload |
| Proof of medical necessity can be requested at step one | Check with operators whether claim type, country and employer are enough to know it's needed |
| A claim can move between created, submitted and closed states | Confirm with engineering that the back office records these states, with timestamps |
| There is no pressing need to redesign a larger portion of member-facing or back-office functionality | Check against other priorities from operators, engineering, design and leadership |

## 04 · Identify a problem — agreed

**Title:** Identify a problem, explore a solution

**Top — Speculatively, say the investigation shows that:**
- Headcount scaling is a real problem
- Most cases move quickly once the documentation is in place
- The current member screens are mostly well built and don't require an infrastructural redesign
- The current member screen doesn't give structured information or provide quality control on document submissions

**Bottom — Given these conditions, a sensible area to investigate:**
- **Can we make it intuitive for members to understand what they need to submit?**
- If so, operators engage with a better standard of claim on average, with fewer requests for more documentation.

**Flow charts (small):** Today (member submits → loop that repeats for 40% of claims → decision) and If so (member sees exactly what's needed → … → reviewed once → decision). Legend: Member · Progyny · Clinic.

**Space steps:** heading → conditions → area to investigate and flows

## 05 · Investigation — agreed

**Title:** Defining success
**Subtitle:** Problem statement → Prototype → Pilot → Evaluation

Three columns:
- **Target picture:** AI doesn't make the decisions, it makes life easier for humans to evaluate a case. We maintain the principle of four eyes on a given outcome. · Operators can more often rely on the data they receive · Member UX remains simple and transparent · GDPR compliance
- **Ready to pilot when** — Prototype is signed off by: Legal · Operators · Design · Engineering · Product
- **The pilot succeeds if:** Document upload quality meaningfully improves · Operator time spent meaningfully decreases · Guardrails don't raise red flags: abandonment rate, % of claims rejected, manual entry and document rejection rates

## 06 · Prototyping — agreed

Full-window: a thin context column, then the prototype's member screen and behind-the-scenes panel, all three evenly spaced.

**Context column:**
- Prototyping is a collaborative, iterative effort between me, design, legal and operators.
- We explore solutions, and settle on one to run as a pilot.
- Here, the solution is improving the member's claim creation funnel. An early prototype might look and behave like this.
- At this stage, the goal is to prove that the UX can contain these steps and still feel intuitive, plus that the requirements are met.
- Next iterations will likely include more edge cases, further design efforts, or fields that were missed on first draft.

## 07 · Next steps — agreed

**Title:** A pilot
- We run a pilot to confirm this does help move us towards our target.
- **That could look like:** One treatment type uses the new flow · A percentage of members · All members, for a set timeframe
- During the pilot, operators double-check a sample of extracted details against the documents.
- The aim is to confirm that the idea holds water.
- Then either **more work is needed**, or **we move on**.

## 08 · Risks and scope — agreed

**Title:** Risks and scope

| Risk | Mitigation |
|---|---|
| Investing heavily in an idea that turns out not to work; stakeholders could flag at any point that it isn't wise | Include stakeholders early and often. Investigate in smart layers and build small, specific tools where possible. Don't spend 6 months of engineering effort before learning an idea isn't viable. |
| GDPR and sensitive data: the data is high-stakes, and solutions may rely on third-party suppliers | Confirm the approach with legal before any member data is used, even in a trial |
| Iteration needs stakeholders' time, so they need to believe the solution will work | Frame the investigation early as working together on a real problem, and build trust that it's worth their time |

**Dependencies:**
- Engineering: two engineers for a couple of months
- Claims team: operator time for iteration and the pilot
- Legal: sign-off before any member data is used

**Scope:**
- Keep it small: a couple of engineers for a couple of months, leaving us free to invest further or move on. No 6-month blocks of work.
- This example wouldn't touch operator tooling, employer configuration tooling, fraud prevention, or payments.

## 09 · A note on AI — agreed

One small card.
- **Used for:** Drafting the prototype and these slides (Claude Code) · Quality-checking language
- **Not used for:** Strategy or matters of taste. The concepts here are my own.
- **Where I pushed back:** It invented ideas and spoke for my perspective without checking with me; I overruled it in those cases. · It kept defaulting to jargon and corporate language; I aimed for readability.

## Order

Title · 01 Context · 02 Metrics · 03 Assumptions · 04 Identify a problem · 05 Investigation · 06 Prototyping · 07 Next steps · 08 Risks and scope · 09 A note on AI — rendered in the deck
