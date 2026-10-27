// 01: the approach, each step level with the milestone that delivers it.
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

export default {
  id: 'context',
  title: 'Context',
  className: 'is-dense s-plan',
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
