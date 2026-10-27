export default {
  id: 'ai-usage',
  title: 'AI usage reflection',
  className: 'is-dense s-ai',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">08 · AI usage reflection</div>
      <h2 data-focus="head">How I used AI</h2>
      <div class="ai">
        <div>
          <div data-focus>
            <h3>What it did</h3>
            <ul>
              <li>Brainstorming, dissecting the brief, and stress-testing assumptions</li>
              <li>Built the prototype and this deck, iterating on my instruction</li>
              <li>Sense checks, grammar and spelling checks, and quality control throughout my inputs and drafts</li>
            </ul>
          </div>
          <div data-focus>
            <h3 class="gap">What it didn't do</h3>
            <ul>
              <li>Case study approach and strategy</li>
              <li>Matters of taste and language</li>
            </ul>
          </div>
        </div>
        <div data-focus>
          <h3>Where I overruled it</h3>
          <ul>
            <li>It pitched a standard slide deck. I wanted a browser app where the prototype is a slide.</li>
            <li>The prototype's "behind the scenes" panel was broadly visible in the main screen. I split it off.</li>
            <li>It spoke on my perspective, for example it invented an "alternative considered and dismissed" with inviable options I had never considered. I removed such cases.</li>
            <li>I consistently overruled it on language: it reached for jargon and corporate speak; I insisted on readability.</li>
          </ul>
        </div>
      </div>
    `;
  },
};
