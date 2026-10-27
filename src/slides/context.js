export default {
  id: 'context',
  title: 'Context',
  className: 'is-dense s-context',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">02 · Context</div>
      <h2 data-focus="head">What we know, and what we assume</h2>
      <div class="cols2">
        <div class="known" data-focus>
          <h3>What we know</h3><p class="sub">Confirmed</p>
          <ul>
            <li>2 FTE review claims (alongside digital card transactions); 2 more hires planned for 2026</li>
            <li>Requirements are a matrix: country × treatment × employer</li>
            <li>An invoice is always required; proof of payment usually</li>
            <li>Proof of medical necessity drives back-and-forth between member, Progyny and clinic</li>
            <li>Multi-document uploads are split by hand</li>
          </ul>
        </div>
        <div class="assumed" data-focus>
          <h3>What we assume</h3><p class="sub">To be tested</p>
          <ul>
            <li>Most of the 40% of information requests are preventable at upload</li>
            <li>Most claims would be straightforward if all data and documents were already presented as required</li>
            <li>Most of the delay is the round trips between member, Progyny and clinic, not time spent reviewing</li>
            <li>Proof of medical necessity can be anticipated and requested before submission</li>
            <li>A claim is created when the member opens it, and moves to "submitted" when submitted</li>
          </ul>
        </div>
      </div>
    `;
  },
};
