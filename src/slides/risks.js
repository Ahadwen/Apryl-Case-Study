export default {
  id: 'risks',
  title: 'Risks and dependencies',
  className: 'is-dense',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">07 · Risks and dependencies</div>
      <h2 data-focus="head">Risks and dependencies</h2>
      <ul>
        <li data-focus>Legal and DPIA approval is the critical path. No AI on real documents until it’s done.</li>
        <li data-focus>Needs the claims team’s time to write down rules and to sit with you.</li>
        <li data-focus>Engineering capacity: 7 engineers across everything.</li>
        <li data-focus>OCR quality on bad photos.</li>
      </ul>
      <p class="aside" data-focus><strong>Out of scope:</strong> fraud, payout, employer configuration tooling.</p>
    `;
  },
};
