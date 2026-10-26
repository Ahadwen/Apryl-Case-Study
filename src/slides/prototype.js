// The document upload prototype, live inside the slide. It's its own page (prototype/) so it can
// also be opened full screen or on a phone.
export default {
  id: 'prototype',
  title: 'Prototype',
  className: 'is-prototype',
  render(el) {
    el.innerHTML = `
      <div class="proto-head">
        <div>
          <div class="eyebrow">Prototype</div>
          <h2>Document upload</h2>
        </div>
        <a class="proto-open" href="prototype/" target="_blank" rel="noopener">Open full screen ↗</a>
      </div>
      <iframe class="proto-frame" src="prototype/" title="Document upload prototype"></iframe>
    `;
  },
};
