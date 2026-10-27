export default {
  id: 'hypothesis',
  title: 'Hypothesis',
  className: 'is-dense',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">01 · Hypothesis, conditions, assumptions</div>
      <h2 class="statement" data-focus="head">Most of the reviewer effort and delay comes from finding and chasing information, not from judgement.</h2>
      <div class="cols wide-right">
        <div data-focus>
          <h3>For this to be true</h3>
          <ul>
            <li>the 40% information requests are mostly preventable at upload</li>
            <li>most claims are straightforward</li>
          </ul>
        </div>
        <div data-focus>
          <h3>Assumptions</h3>
          <ul>
            <li>review time per claim is unknown, and could be 10 minutes or an hour</li>
            <li>the delay is mostly members waiting (elapsed time), not reviewer effort (touch time)</li>
            <li>required information is mostly universal, with additions by treatment and rare country exceptions</li>
            <li>the four-eyes check stays: two human sign-offs, no exceptions</li>
            <li>a claim is created in the back office the moment it is opened by the member, and moves from “created” to “submitted” when submitted</li>
          </ul>
        </div>
      </div>
    `;
  },
};
