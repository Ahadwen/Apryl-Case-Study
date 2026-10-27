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
          'Prototyping is a collaborative, iterative effort between product, design, legal and operators.',
          'We explore solutions, and settle on one to run as a pilot.',
          "Here, the goal is to improve the member's claim creation funnel. An early prototype might look and behave like this.",
          'At this stage, we aim to prove that the UX can contain these steps and still feel intuitive, plus that the requirements are met.',
          'Next iterations will likely include more edge cases, further design efforts, or fields that were missed on first draft.',
        ])}</ul>
        <div class="pnote">
          <p>The pitch suggested I add several solution screens and list the relative strengths between them.</p>
          <p>Whilst occasionally such decisions are needed, this process often creates smaller more specific decisions between iterations.</p>
        </div>
      </aside>
      <iframe class="proto-frame" src="prototype/?inline" title="Document upload prototype"></iframe>
    `;
  },
};
