const CHECKLIST = [
  ['Proposal approval from', ['Claims operators', 'Legal']],
  ['Investigation and time tracking metrics confirm that', [
    'Operator time spent on claims is a reasonable goal to prioritise',
    'Incomplete document submissions are a reasonable problem to target',
  ]],
];

const ROWS = [
  ['Weeks 1–2', [
    'Sit with reviewers and understand their workflows',
    'Capture domain-specific operator knowledge: country exceptions, judgement calls, Slack escalations',
    'Set up metric capture and dashboards',
    'Discuss privacy and data regulation with legal',
  ]],
  ['Go ahead', ['Decision against the go-ahead checklist'], 'goahead'],
  ['Weeks 3–6', ['Build it, test against historical claims', 'Validate prototype iterations with operators']],
  ['February', ['Feature goes live']],
  ['March–June', [
    'Follow the dashboard periodically, and intervene with further effort if needed',
    'Otherwise, move focus to a different product area',
  ]],
];

export default {
  id: 'milestones',
  title: 'Milestones',
  className: 'is-dense s-milestones',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">06 · Milestones</div>
      <h2 data-focus="head">Milestones</h2>
      <div class="ms">
        <ol class="timeline">${ROWS.map(([when, items, focus = '']) => `
          <li data-focus="${focus}" class="${focus}"><span class="when">${when}</span><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul></li>`).join('')}
        </ol>
        <div class="checklist" data-focus="goahead">
          <h3>Go-ahead checklist</h3>
          ${CHECKLIST.map(([group, items]) => `
            <h4>${group}</h4>
            <ul>${items.map((c) => `<li>${c}</li>`).join('')}</ul>`).join('')}
        </div>
      </div>
    `;
  },
};
