// 04: speculative conditions, the area they point to, and today's loop vs. the flow if it works.
// Steps are coloured by who does them: m = member, a = Progyny, c = clinic.
const list = (items) => items.map((i) => `<li>${i}</li>`).join('');
const step = (who, text) => `<span class="step ${who}">${text}</span>`;
const arrow = '<span class="arrow">→</span>';

export default {
  id: 'explore',
  title: 'Identify a problem',
  className: 'is-dense s-problem s-explore',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">04 · Identify a problem</div>
      <h2 data-focus="head">Identify a problem, explore a solution</h2>
      <div class="cond" data-focus>
        <h3>Speculatively, say the investigation shows that:</h3>
        <ul>${list([
          'Headcount scaling is a real problem',
          'Most cases move quickly once the documentation is in place',
          "The current member screens are mostly well built and don't require an infrastructural redesign",
          "The current member screen doesn't give structured information or provide quality control on document submissions",
        ])}</ul>
      </div>
      <div class="then" data-focus="then">
        <h3>Given these conditions, a sensible area to investigate:</h3>
        <p class="q">Can we make it intuitive for members to understand what they need to submit?</p>
        <p class="if">If so, operators engage with a better standard of claim on average, with fewer requests for more documentation.</p>
      </div>
      <div class="flows" data-focus="then">
        <div class="flow today"><span class="lbl">Today</span>
          <div class="steps">
            ${step('m', 'Member submits')}${arrow}
            <div class="loop">
              ${step('a', "Reviewer finds what's missing")}${arrow}
              ${step('a', 'Request sent to member')}${arrow}
              ${step('m', 'Member asks clinic')}${arrow}
              ${step('c', 'Clinic sends document')}${arrow}
              ${step('m', 'Member re-uploads')}
            </div>${arrow}
            ${step('a', 'Decision')}
          </div>
        </div>
        <div class="flow proposed"><span class="lbl">If so</span>
          <div class="steps">
            ${step('m', "Member sees exactly what's needed")}${arrow}
            ${step('m', 'Member gathers it, asking the clinic early')}${arrow}
            ${step('c', 'Clinic sends document')}${arrow}
            ${step('m', 'Member submits a complete claim')}${arrow}
            ${step('a', 'Reviewed once')}${arrow}
            ${step('a', 'Decision')}
          </div>
        </div>
        <div class="legend"><span class="lm">Member</span><span class="la">Progyny</span><span class="lc">Clinic</span></div>
      </div>
    `;
  },
};
