// The document upload prototype as a slide of its own: it fills the window at its natural size
// (fullBleed), rather than being scaled into the 16:9 stage. It's a separate page (prototype/)
// so it can also be used directly, e.g. on a phone.
export default {
  id: 'prototype',
  title: 'Prototype',
  className: 'is-prototype',
  fullBleed: true,
  render(el) {
    el.innerHTML = `<iframe class="proto-frame" src="prototype/" title="Document upload prototype"></iframe>`;
  },
};
