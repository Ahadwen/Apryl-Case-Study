export default {
  id: 'proposal',
  title: 'Proposal',
  className: 'is-dense',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">04 · Proposal</div>
      <h2 data-focus="head">Proposal</h2>
      <div class="cols">
        <ul>
          <li data-focus>Upload asks for information, not documents: patient name, treatment, provider, date, amount, proof of payment. Any document can satisfy any item.</li>
          <li data-focus>OCR first, then names and dates of birth masked locally, then AI extraction. The AI never learns who the patient is.</li>
          <li data-focus>Unreadable document: retake the photo, try another document, or submit anyway for a person to check. It never goes to the AI.</li>
          <li data-focus>Member confirms the pre-filled facts.</li>
        </ul>
        <ul>
          <li data-focus>Deterministic checks run automatically.</li>
          <li data-focus>Reviewers see each fact with its source highlighted. Two lanes: clean claims (verify and sign off) and judgement claims (AI summary, person decides). Both reviewers sign off either way.</li>
          <li data-focus>Machine vs. human: deterministic checks are automated, extraction is assisted, judgement stays with people. Each check earns its autonomy through measured accuracy.</li>
          <li data-focus>Alternative considered: AI judging the whole claim. Rejected because it’s harder to audit, version and defend.</li>
        </ul>
      </div>
    `;
  },
};
