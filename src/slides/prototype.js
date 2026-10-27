// 06: the document upload prototype, full-window with a thin context column. It loads with ?inline,
// so its two columns use the same gap as this slide's grid and all three are evenly spaced.
// The prototype is a separate page (prototype/) so it can also be used directly, e.g. on a phone.
const list = (items) => items.map((i) => `<li>${i}</li>`).join('');

export default {
  id: 'prototype',
  title: 'Prototyping',
  className: 'is-prototype s-proto',
  fullBleed: true,
  render(el) {
    el.innerHTML = `
      <aside class="pctx">
        <div class="eyebrow">06 · Prototyping</div>
        <ul>${list([
          'Prototyping is a collaborative, iterative effort between me, design, legal and operators.',
          'We explore solutions, and settle on one to run as a pilot.',
          "Here, the solution is improving the member's claim creation funnel. An early prototype might look and behave like this.",
          'At this stage, the goal is to prove that the UX makes sense, and that the requirements are met.',
        ])}</ul>
      </aside>
      <iframe class="proto-frame" src="prototype/?inline" title="Document upload prototype"></iframe>
    `;
  },
};
