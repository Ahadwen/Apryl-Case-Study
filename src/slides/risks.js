export default {
  id: 'risks',
  title: 'Risks and scoping',
  className: 'is-dense s-risks',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">07 · Risks and scoping</div>
      <h2 data-focus="head">Risks and scoping</h2>
      <div class="rs">
        <div data-focus>
          <h3>Risks</h3>
          <ul>
            <li>Legal confirmation is the critical path. No AI on real documents until it's done.</li>
            <li>Needs the claims team's time: to write down rules, and for us to sit with them and understand their workflows.</li>
            <li>OCR quality on bad photos.</li>
            <li>Guardrail metrics may show need for further action.</li>
            <li>Anonymised medical letters can still contain health details.</li>
          </ul>
        </div>
        <div class="scope" data-focus>
          <h3>Scoping</h3>
          <h4>In scope</h4>
          <ul>
            <li>Metrics and dashboards</li>
            <li>Claim type and checklist</li>
            <li>Document reading, masking and extraction</li>
            <li>Member confirmation and gated submit</li>
            <li>Operator view with sources</li>
          </ul>
          <h4>Out of scope</h4>
          <ul>
            <li>Fraud, payout, employer configuration tooling</li>
            <li>Changes to how operators make judgement calls</li>
          </ul>
          <p class="team"><strong>Team:</strong> about 2 engineers, plus time from the claims team.</p>
        </div>
      </div>
    `;
  },
};
