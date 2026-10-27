export default {
  id: 'research',
  title: 'Research',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">02 · Research</div>
      <h2 data-focus="head">Research</h2>
      <ul>
        <li data-focus>Sit with reviewers for a day each.</li>
        <li data-focus>Inventory the knowledge that lives in people’s heads: country exceptions, judgement calls, Slack escalations.</li>
        <li data-focus>Questions sent to Brittany: number of reviewers and their time share, whether a required-information list exists, how the current OCR works and how it was approved.</li>
        <li data-focus>Legal advice started in week one.</li>
      </ul>
    `;
  },
};
