export default {
  id: 'risks',
  title: 'Risks and dependencies',
  className: 'is-dense',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow">07 · Risks and dependencies</div>
      <h2>Risks and dependencies</h2>
      <ul>
        <li>Legal and DPIA approval is the critical path. No AI on real documents until it’s done.</li>
        <li>Needs the claims team’s time to write down rules and to sit with you.</li>
        <li>Engineering capacity: 7 engineers across everything.</li>
        <li>OCR quality on bad photos.</li>
      </ul>
      <p class="aside"><strong>Out of scope:</strong> fraud, payout, employer configuration tooling.</p>
    `;
  },
};
