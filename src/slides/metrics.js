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

export default {
  id: 'metrics',
  title: 'Metrics',
  className: 'is-dense s-metrics',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">04 · Metrics</div>
      <h2 data-focus="head">Metrics, and a definition of success</h2>
      <p class="subtitle" data-focus="head">Captured from week 1, before anything changes, so we can test our assumptions.</p>
      <div class="mgrid">
        <table class="all" data-focus>
          <tr><th>Everything we should capture</th></tr>
          <tr class="group op"><td>Operator</td></tr>${rows(OPERATOR)}
          <tr class="group mem"><td>Member</td></tr>${rows(MEMBER)}
        </table>
        <div>
          <div class="box improve" data-focus>
            <h3>Success: should improve</h3>
            <p class="why">What the redesign is for</p>
            <ul>
              <li class="head">Time between submission and last document upload: towards zero</li>
              <li>Number of document requests</li>
              <li>Operator minutes per claim (no judgement call required)</li>
              <li>Time between claim creation and closure (granted)</li>
            </ul>
          </div>
          <div class="box guard" data-focus>
            <h3>Guardrails: shouldn't get worse</h3>
            <p class="why">What the redesign could break</p>
            <ul>
              <li>Abandonment rate: the checklist mustn't put members off</li>
              <li>% of claims rejected: complete doesn't mean eligible</li>
              <li>Manual entry and document rejection rates: low, or extraction isn't working</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  },
};
