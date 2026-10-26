export default {
  id: 'metrics',
  title: 'Metrics',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow">03 · Metrics</div>
      <h2>Metrics for Back Office to capture</h2>
      <ul>
        <li>Touch time vs. elapsed time per claim.</li>
        <li>Rate of information requests, and what was missing.</li>
        <li>Rejection and partial-award rates.</li>
        <li>Share of clean vs. judgement claims.</li>
        <li>Later: extraction accuracy per field, from member confirmations and reviewer corrections.</li>
        <li>Shown on a dashboard.</li>
      </ul>
    `;
  },
};
