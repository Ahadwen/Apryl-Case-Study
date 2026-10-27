export default {
  id: 'title',
  title: 'Progyny Global',
  className: 'is-title',
  counter: false,
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">Case study</div>
      <h1 data-focus="head">Progyny Global</h1>
      <p class="muted" data-focus>Alastair Hadwen · 2026</p>
    `;
  },
};
