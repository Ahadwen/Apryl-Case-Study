// 07: the pilot that tests the idea, and what happens after.
export default {
  id: 'next-steps',
  title: 'Next steps',
  className: 'is-dense s-pilot',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">07 · Next steps</div>
      <h2 data-focus="head">A pilot</h2>
      <p class="lead" data-focus="head">We run a pilot to confirm this does help move us towards our target.</p>
      <div data-focus>
        <h3>That could look like</h3>
        <div class="opts">
          <div>One treatment type uses the new flow</div>
          <div>A percentage of members</div>
          <div>All members, for a set timeframe</div>
        </div>
      </div>
      <p class="check" data-focus>During the pilot, operators double-check a sample of extracted details against the documents.</p>
      <div class="outcome" data-focus>
        <p>The aim is to confirm that the idea holds water.</p>
        <p class="then">Then either <strong>more work is needed</strong>, or <strong>we move on</strong>.</p>
      </div>
    `;
  },
};
