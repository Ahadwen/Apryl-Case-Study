// 08: risks with their mitigations, then dependencies and scope.
const list = (items) => items.map((i) => `<li>${i}</li>`).join('');

const RISKS = [
  ["Investing heavily in an idea that turns out not to work; stakeholders could flag at any point that it isn't wise",
    "Include stakeholders early and often. Investigate in smart layers and build small, specific tools where possible. Don't spend 6 months of engineering effort before learning an idea isn't viable."],
  ['GDPR and sensitive data: the data is high-stakes, and solutions may rely on third-party suppliers',
    'Confirm the approach with legal before any member data is used, even in a trial'],
  ["Iteration needs stakeholders' time, so they need to believe the solution will work",
    "Frame the investigation early as working together on a real problem, and build trust that it's worth their time"],
];

export default {
  id: 'risks',
  title: 'Risks and scope',
  className: 'is-dense s-risks',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">08 · Risks and scope</div>
      <h2 data-focus="head">Risks and scope</h2>
      <table class="rt" data-focus>
        <tr><th>Risk</th><th>Mitigation</th></tr>
        ${RISKS.map(([r, m]) => `<tr><td>${r}</td><td>${m}</td></tr>`).join('')}
      </table>
      <div class="two">
        <div data-focus>
          <h3>Dependencies</h3>
          <ul>${list([
            '<strong>Engineering:</strong> two engineers for a couple of months',
            '<strong>Claims team:</strong> operator time for iteration and the pilot',
            '<strong>Legal:</strong> sign-off before any member data is used',
          ])}</ul>
        </div>
        <div data-focus>
          <h3>Scope</h3>
          <ul>${list([
            'Keep it small: a couple of engineers for a couple of months, leaving us free to invest further or move on. No 6-month blocks of work.',
            "This example wouldn't touch operator tooling, employer configuration tooling, fraud prevention, or payments.",
          ])}</ul>
        </div>
      </div>
    `;
  },
};
