export default {
  id: 'ai-usage',
  title: 'AI usage reflection',
  className: 'is-dense',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">08 · AI usage reflection</div>
      <h2 data-focus="head">AI usage reflection</h2>
      <p data-focus>Used for thinking, challenge and research. All copy is yours.</p>
      <h3 data-focus="list">Ten logged disagreements, for example:</h3>
      <ul data-focus="list">
        <li>four-eyes isn’t up for debate</li>
        <li>ask for information, not documents</li>
        <li>fraud is out of scope</li>
        <li>8 slides of filler</li>
        <li>the roadmap is front-loaded, not a six-month build</li>
      </ul>
    `;
  },
};
