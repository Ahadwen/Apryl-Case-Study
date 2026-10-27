// 03: each assumption, and how we'd test it.
const ASSUMPTIONS = [
  ['Most of the 40% of information requests are preventable at upload',
    'Go through recent document requests with operators: which could have been asked for upfront?'],
  ['Most claims would be straightforward if all data and documents were already presented as required',
    'Track operator time on complete versus incomplete submissions'],
  ['Much of the delay comes from discussion between operators, members and clinics around missing documentation',
    'Compare the time from submission to the last document upload with the total time to closure'],
  ['The current member screen is a fairly loose request for documentation',
    'Review the screen with operators, and look at what members actually upload'],
  ['Proof of medical necessity can be requested at step one',
    "Check with operators whether claim type, country and employer are enough to know it's needed"],
  ['A claim can move between created, submitted and closed states',
    'Confirm with engineering that the back office records these states, with timestamps'],
  ['There is no pressing need to redesign a larger portion of member-facing or back-office functionality',
    'Check against other priorities from operators, engineering, design and leadership'],
];

export default {
  id: 'assumptions',
  title: 'Assumptions',
  className: 'is-dense s-assumptions',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">03 · Assumptions</div>
      <h2 data-focus="head">Assumptions, and how we'd test them</h2>
      <table class="ut" data-focus>
        <tr><th>Assumption</th><th>How we'd test it</th></tr>
        ${ASSUMPTIONS.map(([u, t]) => `<tr><td>${u}</td><td>${t}</td></tr>`).join('')}
      </table>
    `;
  },
};
