// The document upload prototype as a slide of its own: it fills the window at its natural size
// (fullBleed), rather than being scaled into the 16:9 stage. A thin bar on top labels it like the
// other slides and says how to read the two halves. The prototype is a separate page (prototype/)
// so it can also be used directly, e.g. on a phone.
export default {
  id: 'prototype',
  title: 'Prototype',
  className: 'is-prototype',
  fullBleed: true,
  render(el) {
    el.innerHTML = `
      <div class="proto-bar">
        <span class="eyebrow">05 · Prototype</span>
        <span class="proto-title">Document upload: OCR and masking on the device, then AI extraction</span>
        <span class="proto-key">Left: what the member sees · Right: behind the scenes</span>
      </div>
      <iframe class="proto-frame" src="prototype/" title="Document upload prototype"></iframe>
    `;
  },
};
