// 09: a short note on how AI was used.
const list = (items) => items.map((i) => `<li>${i}</li>`).join('');

export default {
  id: 'ai-usage',
  title: 'A note on AI',
  className: 'is-dense s-ai',
  render(el) {
    el.innerHTML = `
      <div class="note" data-focus>
        <div class="eyebrow">A note on AI</div>
        <h3>Used for</h3>
        <ul>${list(['Drafting the prototype and these slides (Claude Code)', 'Quality-checking language'])}</ul>
        <h3>Not used for</h3>
        <ul>${list(['Strategy or matters of taste. The concepts here are my own.'])}</ul>
        <h3>Where I pushed back</h3>
        <ul>${list([
          'It invented ideas and spoke for my perspective without checking with me; I overruled it in those cases.',
          'It kept defaulting to jargon and corporate language; I aimed for readability.',
        ])}</ul>
      </div>
    `;
  },
};
