export default {
  id: 'title',
  title: 'Apryl',
  className: 'is-title',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">Case study</div>
      <h1 data-focus="head">Apryl</h1>
      <p class="lede" data-focus>Response to the case study brief</p>
      <p class="muted" data-focus>Alastair Hadwen · 2026</p>
    `;
  },
};
