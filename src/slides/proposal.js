export default {
  id: 'proposal',
  title: 'Proposal',
  className: 'is-dense',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow">04 · Proposal</div>
      <h2>Proposal</h2>
      <div class="cols">
        <ul>
          <li>Upload asks for information, not documents: patient name, treatment, provider, date, amount, proof of payment. Any document can satisfy any item.</li>
          <li>OCR first, then names and dates of birth masked locally, then AI extraction. The AI never learns who the patient is.</li>
          <li>Unreadable document: retake the photo, try another document, or submit anyway for a person to check. It never goes to the AI.</li>
          <li>Member confirms the pre-filled facts.</li>
        </ul>
        <ul>
          <li>Deterministic checks run automatically.</li>
          <li>Reviewers see each fact with its source highlighted. Two lanes: clean claims (verify and sign off) and judgement claims (AI summary, person decides). Both reviewers sign off either way.</li>
          <li>Machine vs. human: deterministic checks are automated, extraction is assisted, judgement stays with people. Each check earns its autonomy through measured accuracy.</li>
          <li>Alternative considered: AI judging the whole claim. Rejected because it’s harder to audit, version and defend.</li>
        </ul>
      </div>
    `;
  },
};
