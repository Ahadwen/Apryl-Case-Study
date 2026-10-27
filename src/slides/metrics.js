// 02: everything we capture from week 1 (left), summarised in plain language (right).
const list = (items) => items.map((i) => `<li>${i}</li>`).join('');

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
];
const rows = (items) => items.map((m) => `<tr><td>${m}</td></tr>`).join('');

export default {
  id: 'metrics',
  title: 'Metrics',
  className: 'is-dense s-metrics',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">02 · Metrics</div>
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
