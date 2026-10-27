export default {
  id: 'metrics',
  title: 'Metrics',
  className: 'is-dense',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow">03 · Metrics</div>
      <h2>Metrics for Back Office to capture</h2>
      <div class="cols">
        <div>
          <h3>Operator tracking</h3>
          <ul>
            <li>Time between claim creation and closure (granted)</li>
            <li>Time between claim creation and closure (denied)</li>
            <li>Time between claim submission and last document upload before closure</li>
            <li>Number of document requests</li>
            <li>Operator minutes per claim (no judgement call required)</li>
            <li>Operator minutes per claim (judgement call required)</li>
            <li>Operator minutes per claim (on average, full sample)</li>
            <li>% of claims rejected</li>
          </ul>
        </div>
        <div>
          <h3>Member tracking</h3>
          <ul>
            <li>Abandonment rate</li>
            <li>Document rejection rate</li>
            <li>Manual entry rate</li>
          </ul>
        </div>
      </div>
    `;
  },
};
