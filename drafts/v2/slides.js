// Draft v2 of the deck: restructured around the plan, with later slides as "what this might look like".
// Not live: once agreed, these move into src/slides/ one module per slide.
const list = (items) => items.map((i) => `<li>${i}</li>`).join('');
const step = (who, text) => `<span class="step ${who}">${text}</span>`;
const arrow = '<span class="arrow">→</span>';

const title = {
  id: 'title',
  title: 'Progyny Global',
  className: 'is-title',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">Case study</div>
      <h1 data-focus="head">Progyny Global</h1>
      <p class="muted" data-focus>Alastair Hadwen · 2026</p>
    `;
  },
};

// Each approach step sits level with the milestone that delivers it.
const PLAN = [
  ['Confirm the priority', 'Is this the right target to work on first?',
    'January, weeks 1–2', 'Start capturing metrics and tracking time; sit with operators'],
  ['Identify a problem', 'Searching for high impact, scalability, and a good ROI',
    'January, weeks 2–3', 'Agree the problem and define success, with operators and legal'],
  ['Investigate and prototype', 'Iterate with stakeholders before engineering gets involved',
    'Late January', 'Prototype quickly, iterating with design, legal and operators'],
  ['Build a small, focused solution', 'Stay light, this is likely not the only priority',
    'February', 'Build the pilot version (two engineers); the pilot starts late February'],
  ['Qualify the result', 'Did this feature help, is more work needed?',
    'March–June', 'Follow the dashboard and step in if needed; otherwise, move on to a different product area'],
];

const context = {
  id: 'context',
  title: 'Context',
  className: 'is-dense v2-plan',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">01 · Context</div>
      <h2 data-focus="head">How I'd work, and the plan for H1 2027</h2>
      <div class="plan">
        <div class="ph ph-a" data-focus="a">Approach</div>
        <div class="ph ph-m" data-focus="m">Milestones</div>
        ${PLAN.map(([s, sub, when, what], i) => `
          <div class="pa" data-focus="a"><span class="num">${i + 1}</span><div><strong>${s}</strong><span>${sub}</span></div></div>
          <div class="pm" data-focus="m"><span class="when">${when}</span><span>${what}</span></div>`).join('')}
      </div>
    `;
  },
};

const UNKNOWNS = [
  ['Most of the 40% of information requests are preventable at upload',
    'Go through recent document requests with operators: which could have been asked for upfront?'],
  ['Most claims would be straightforward if all data and documents were already presented as required',
    'Track operator time on complete versus incomplete submissions'],
  ['Much of the delay comes from discussion between operators, members and clinics around missing documentation',
    'Compare the time from submission to the last document upload with the total time to closure'],
  ['The current member screen is a fairly loose request for documentation',
    'Review the screen with operators, and look at what members actually upload'],
  ['Proof of medical necessity can be requested at step one',
    "Check with operators whether claim type, country and employer are enough to know it's needed"],
  ['A claim can move between created, submitted and closed states',
    'Confirm with engineering that the back office records these states, with timestamps'],
  ['There is no pressing need to redesign a larger portion of member-facing or back-office functionality',
    "Check against operators' and leadership's other priorities"],
];

const unknowns = {
  id: 'unknowns',
  title: 'Unknowns',
  className: 'is-dense v2-unknowns',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">02 · Assumptions</div>
      <h2 data-focus="head">Unknowns, and how we'd test them</h2>
      <table class="ut" data-focus>
        <tr><th>Unknown</th><th>How we'd test it</th></tr>
        ${UNKNOWNS.map(([u, t]) => `<tr><td>${u}</td><td>${t}</td></tr>`).join('')}
      </table>
    `;
  },
};

const OPERATOR = [
  'Time between claim creation and closure (granted, at least partially)',
  'Time between claim creation and closure (denied)',
  'Time between claim submission and last document upload before closure',
  'Number of document requests',
  'Operator minutes per claim (no judgement call required)',
  'Operator minutes per claim (judgement call required)',
  'Operator minutes per claim (on average, full sample)',
  '% of claims rejected',
];
const MEMBER = [
  'Time between opening a claim and submission (proof of medical necessity required)',
  'Time between opening a claim and submission (proof of medical necessity not required)',
  'Abandonment rate',
  'Document rejection rate',
  'Manual entry rate',
];
const rows = (items) => items.map((m) => `<tr><td>${m}</td></tr>`).join('');

const metrics = {
  id: 'metrics',
  title: 'Metrics',
  className: 'is-dense s-metrics v2-metrics',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">03 · Metrics</div>
      <h2 data-focus="head">Metrics</h2>
      <p class="subtitle" data-focus="head">Captured from week 1, before anything changes, so we can test our assumptions.</p>
      <div class="mgrid">
        <table class="all" data-focus>
          <tr><th>Everything we should capture</th></tr>
          <tr class="group op"><td>Operator</td></tr>${rows(OPERATOR)}
          <tr class="group mem"><td>Member</td></tr>${rows(MEMBER)}
        </table>
        <div class="summary" data-focus>
          <div class="sum mem">
            <h3>Member convenience</h3>
            <ul>${list(['Time until claim completion', 'Ease of use'])}</ul>
          </div>
          <div class="sum op">
            <h3>Operator convenience</h3>
            <ul>${list(['Time spent on claims', 'Time wasted on missing documents', 'Straightforward claims vs. claims needing judgement'])}</ul>
          </div>
        </div>
      </div>
    `;
  },
};

const explore = {
  id: 'explore',
  title: 'Identify a problem',
  className: 'is-dense s-problem v2-explore',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">04 · Identify a problem</div>
      <h2 data-focus="head">Identify a problem, explore a solution</h2>
      <div class="cond" data-focus>
        <h3>Speculatively, say the investigation shows that:</h3>
        <ul>${list([
          'Headcount scaling is a real problem',
          "We don't want AI making decisions",
          'Most cases move quickly once the documentation is in place',
          "The current member screen is a fairly loose request for documentation, and doesn't solve the problem as stated",
        ])}</ul>
      </div>
      <div class="then" data-focus="then">
        <h3>Given these conditions, a sensible area to investigate:</h3>
        <p class="q">Can we make it intuitive for members to understand what they need to submit?</p>
        <p class="if">If so, operators get a clean run, without annoying the member.</p>
      </div>
      <div class="flows" data-focus="then">
        <div class="flow today"><span class="lbl">Today</span>
          <div class="steps">
            ${step('m', 'Member submits')}${arrow}
            <div class="loop">
              ${step('a', "Reviewer finds what's missing")}${arrow}
              ${step('a', 'Request sent to member')}${arrow}
              ${step('m', 'Member asks clinic')}${arrow}
              ${step('c', 'Clinic sends document')}${arrow}
              ${step('m', 'Member re-uploads')}
            </div>${arrow}
            ${step('a', 'Decision')}
          </div>
        </div>
        <div class="flow proposed"><span class="lbl">If so</span>
          <div class="steps">
            ${step('m', "Member sees exactly what's needed")}${arrow}
            ${step('m', 'Member gathers it, asking the clinic early')}${arrow}
            ${step('c', 'Clinic sends document')}${arrow}
            ${step('m', 'Member submits a complete claim')}${arrow}
            ${step('a', 'Reviewed once')}${arrow}
            ${step('a', 'Decision')}
          </div>
        </div>
        <div class="legend"><span class="lm">Member</span><span class="la">Progyny</span><span class="lc">Clinic</span></div>
      </div>
    `;
  },
};

const investigation = {
  id: 'investigation',
  title: 'Investigation',
  className: 'is-dense v2-success',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">05 · Investigation</div>
      <h2 data-focus="head">Defining success</h2>
      <div class="two">
        <div class="box ready" data-focus>
          <h3>Ready to pilot when</h3>
          <ul>${list([
            'Legal and operators approve the approach',
            "It's GDPR compliant",
            "The machine doesn't make decisions. Four eyes do; we just make that easier.",
          ])}</ul>
        </div>
        <div class="box pilot" data-focus>
          <h3>The pilot succeeds if</h3>
          <ul>${list([
            'Document upload quality meaningfully improves',
            'Operator time spent meaningfully decreases',
            "Guardrails don't raise red flags: abandonment rate, % of claims rejected, manual entry and document rejection rates",
          ])}</ul>
        </div>
      </div>
      <div class="mvh" data-focus>
        <span class="lbl">Machine vs human</span>
        <span><strong>Automate:</strong> reading documents, checking completeness</span>
        <span><strong>Assist:</strong> flagging gaps and mismatches</span>
        <span><strong>People:</strong> every decision</span>
      </div>
    `;
  },
};

// Full-window like the live prototype slide, with a thin context column on the left.
const prototype = {
  id: 'prototype',
  title: 'Prototyping',
  className: 'is-prototype v2-proto',
  fullBleed: true,
  render(el) {
    el.innerHTML = `
      <aside class="pctx">
        <div class="eyebrow">06 · Prototyping</div>
        <ul>${list([
          'Prototyping is a collaborative, iterative effort between me, design, legal and operators.',
          'We explore solutions, and settle on one to run as a pilot.',
          "Here, the solution is improving the member's claim creation funnel. An early prototype might look and behave like this.",
          'At this stage, the goal is to prove that the UX makes sense, and that the requirements are met.',
        ])}</ul>
      </aside>
      <iframe class="proto-frame" src="../../prototype/?inline" title="Document upload prototype"></iframe>
    `;
  },
};

const pilot = {
  id: 'next-steps',
  title: 'Next steps',
  className: 'is-dense v2-pilot',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">07 · Next steps</div>
      <h2 data-focus="head">A pilot</h2>
      <p class="lead" data-focus="head">We run a pilot to confirm this does help move us towards our target.</p>
      <div data-focus>
        <h3>That could look like</h3>
        <div class="opts">
          <div>One treatment type uses the new flow</div>
          <div>A percentage of members</div>
          <div>All members, for a set timeframe</div>
        </div>
      </div>
      <p class="check" data-focus>During the pilot, operators double-check a sample of extracted details against the documents.</p>
      <div class="outcome" data-focus>
        <p>The aim is to confirm that the idea holds water.</p>
        <p class="then">Then either <strong>more work is needed</strong>, or <strong>we move on</strong>.</p>
      </div>
    `;
  },
};

const RISKS = [
  ["Investing heavily in an idea that turns out not to work; stakeholders could flag at any point that it isn't wise",
    "Include stakeholders early and often. Investigate in smart layers and build small, specific tools where possible. Don't spend 6 months of engineering effort before learning an idea isn't viable."],
  ['GDPR and sensitive data: the data is high-stakes, and solutions may rely on third-party suppliers',
    'Confirm the approach with legal before any member data is used, even in a trial'],
  ["Iteration needs stakeholders' time, so they need to believe the solution will work",
    "Frame the investigation early as working together on a real problem, and build trust that it's worth their time"],
];

const risks = {
  id: 'risks',
  title: 'Risks and scope',
  className: 'is-dense v2-risks',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">08 · Risks and scope</div>
      <h2 data-focus="head">Risks and scope</h2>
      <table class="rt" data-focus>
        <tr><th>Risk</th><th>Mitigation</th></tr>
        ${RISKS.map(([r, m]) => `<tr><td>${r}</td><td>${m}</td></tr>`).join('')}
      </table>
      <div class="two">
        <div data-focus>
          <h3>Dependencies</h3>
          <ul>${list([
            '<strong>Engineering:</strong> two engineers for a couple of months',
            '<strong>Claims team:</strong> operator time for iteration and the pilot',
            '<strong>Legal:</strong> sign-off before any member data is used',
          ])}</ul>
        </div>
        <div data-focus>
          <h3>Scope</h3>
          <ul>${list([
            'Keep it small: a couple of engineers for a couple of months, leaving us free to invest further or move on. No 6-month blocks of work.',
            "This example wouldn't touch operator tooling, employer configuration tooling, fraud prevention, or payments.",
          ])}</ul>
        </div>
      </div>
    `;
  },
};

const ai = {
  id: 'ai-usage',
  title: 'A note on AI',
  className: 'is-dense v2-ai',
  render(el) {
    el.innerHTML = `
      <div class="note" data-focus>
        <div class="eyebrow">09 · A note on AI</div>
        <h3>Used for</h3>
        <ul>${list(['Drafting the prototype and these slides (Claude Code)', 'Quality-checking language'])}</ul>
        <h3>Not used for</h3>
        <ul>${list(['Strategy or matters of taste. The concepts here are my own.'])}</ul>
        <h3>Where I pushed back</h3>
        <ul>${list([
          'It invented ideas and spoke for my perspective without checking with me; I overruled it in those cases.',
          'It kept defaulting to jargon and corporate language; I aimed for readability.',
        ])}</ul>
      </div>
    `;
  },
};

export const slides = [title, context, unknowns, metrics, explore, investigation, prototype, pilot, risks, ai];
