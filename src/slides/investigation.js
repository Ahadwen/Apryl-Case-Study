// 05: defining success: the target picture, when we can pilot, and when the pilot has worked.
const list = (items) => items.map((i) => `<li>${i}</li>`).join('');

export default {
  id: 'investigation',
  title: 'Investigation',
  className: 'is-dense s-success',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">05 · Investigation</div>
      <h2 data-focus="head">Defining success</h2>
      <div class="three">
        <div class="box target" data-focus>
          <h3>Target picture</h3>
          <ul>${list([
            "AI doesn't make the decisions, it makes life easier for humans to evaluate a case. We maintain the principle of four eyes on a given outcome.",
            'Operators can more often rely on the data they receive',
            'Member UX remains simple and transparent',
            'GDPR compliance',
          ])}</ul>
        </div>
        <div class="box ready" data-focus>
          <h3>Ready to pilot when</h3>
          <p class="lbl">Prototype is signed off by:</p>
          <ul>${list(['Legal', 'Operators', 'Design', 'Engineering', 'Product'])}</ul>
        </div>
        <div class="box pilot" data-focus>
          <h3>The pilot succeeds if</h3>
          <ul>${list([
            'Document upload quality meaningfully improves',
            'Operator time spent meaningfully decreases',
            "Guardrails don't raise red flags: abandonment rate, % of claims rejected, manual entry and document rejection rates",
          ])}</ul>
        </div>
      </div>
    `;
  },
};
