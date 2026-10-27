export default {
  id: 'metrics',
  title: 'Metrics',
  className: 'is-dense',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow">03 · Metrics</div>
      <h2>Metrics to capture</h2>
      <p class="subtitle">Captured from week 1, before anything changes, so we know whether the hypothesis holds.</p>
      <div class="cols wide-left">
        <div>
          <h3>Operator tracking</h3>
          <p class="purpose">Is the effort finding information, or making judgements?</p>
          <ul>
            <li>Time between claim creation and closure (granted, at least partially)</li>
            <li>Time between claim creation and closure (denied)</li>
            <li class="headline">Time between claim submission and last document upload before closure <span class="tag">Headline</span></li>
            <li>Number of document requests</li>
            <li>Operator minutes per claim (no judgement call required)</li>
            <li>Operator minutes per claim (judgement call required)</li>
            <li>Operator minutes per claim (on average, full sample)</li>
            <li>% of claims rejected</li>
          </ul>
        </div>
        <div>
          <h3>Member tracking</h3>
          <p class="purpose">Are we making it harder to claim?</p>
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
