export default {
  id: 'context',
  title: 'Context',
  className: 'is-dense s-context',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">01 · Context</div>
      <h2 data-focus="head">Approach, what we know, and what we assume</h2>
      <div class="cols2">
        <div class="approach" data-focus>
          <h3>Approach</h3><p class="sub">How I'd work</p>
          <ol>
            <li><strong>Confirm the priority</strong><span>Is this the metric to focus on?</span></li>
            <li><strong>Identify a problem</strong><span>Is there a sensible way to move it?</span></li>
            <li><strong>Investigate and prototype</strong></li>
            <li><strong>Build a small, focused solution</strong></li>
            <li><strong>Qualify the result</strong><span>Did it move?</span></li>
          </ol>
        </div>
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
            <li>Much of the delay comes from discussion between Operators, members, and clinics, around missing documentation</li>
            <li>Proof of medical necessity can be requested step one</li>
            <li>A claim can move between created, submitted, and closed states</li>
          </ul>
        </div>
      </div>
    `;
  },
};
