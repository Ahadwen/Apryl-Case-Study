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
          <div>The new flow is used for one specific treatment type</div>
          <div>A percentage of members use the new flow</div>
          <div>All members use the new flow and the results are closely monitored</div>
        </div>
      </div>
      <p class="check" data-focus>Pilot specifics are partially decided on technical viability and so in close discussion with engineering.<br>During the pilot, operators double-check a sample of extracted details against the documents.</p>
      <div class="outcome" data-focus>
        <p>The aim is to confirm that the change makes a meaningful impact towards the strategic goal.</p>
        <p class="then">Then decide: either <strong>more work is needed</strong>, or <strong>we move on to other priorities</strong>.</p>
      </div>
    `;
  },
};
