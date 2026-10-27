export default {
  id: 'milestones',
  title: 'Milestones',
  className: 'is-dense',
  render(el) {
    const rows = [
      ['Weeks 1–2', 'Metric capture, dashboard, legal advice.'],
      ['Weeks 3–6', 'Build it, test against historical claims.'],
      ['February', 'Live, both reviewers still signing off.'],
      ['March–June', 'Light touch. A monthly look at the dashboard, checks graduate when they hit their threshold, and the claims team writes down rules themselves.'],
    ];
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">06 · Milestones</div>
      <h2 data-focus="head">Milestones</h2>
      <ol class="timeline">${rows.map(([when, what]) => `<li data-focus><span class="when">${when}</span><span>${what}</span></li>`).join('')}</ol>
    `;
  },
};
