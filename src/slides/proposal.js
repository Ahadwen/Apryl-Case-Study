export default {
  id: 'proposal',
  title: 'Proposal',
  className: 'is-dense s-proposal',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">03 · Proposal</div>
      <h2 class="ptitle" data-focus="head">Claim creation document upload redesign:<br><span>Clear checklist before claim submission</span></h2>
      <p class="lead-in" data-focus="head">Today, only the operator knows what a claim needs. We put that knowledge at the start: each member sees exactly what their claim requires, gathers it with help, and can only submit once it's complete. <strong>Operators receive complete, confirmed claims.</strong></p>
      <div class="split">
        <div class="member" data-focus>
          <h3>What changes for the member</h3>
          <ol>
            <li>They say what they're claiming for. With their country and employer, that defines the checklist.</li>
            <li>The checklist asks for a few mandatory documents, then information, which can come from any document on a provided shortlist. Documents only count if they identify the member.</li>
            <li>If proof of medical necessity is needed, they're told upfront, with a ready-made message for their clinic.</li>
            <li>The member doesn't need to type anything: information is pulled from the provided documents, and they only confirm the retrieved data.</li>
            <li>Anything the scan reads incorrectly, or any missing data: the member is prompted to upload another document, or type it manually, but flagged for the operator to confirm.</li>
            <li>Submit unlocks only when the checklist is complete.</li>
          </ol>
        </div>
        <div class="operator" data-focus>
          <h3>What changes for the operator</h3>
          <ul>
            <li><strong>Complete claims:</strong> most claims arrive with complete and confirmed information and documents.</li>
            <li><strong>Automation:</strong> deterministic checks run automatically on the resulting data (e.g. employer date ranges).</li>
            <li><strong>Sources:</strong> each fact is shown with its source highlighted.</li>
          </ul>
        </div>
      </div>
      <div class="princ-strip" data-focus>
        <span class="plabel">Principles</span>
        <p><strong>Privacy and GDPR:</strong> documents are read and masked on the member's device. The AI never learns who the member is.</p>
        <p><strong>Machine vs. human:</strong> we automate the data retrieval; the judgement still sits with the operators.</p>
      </div>
    `;
  },
};
