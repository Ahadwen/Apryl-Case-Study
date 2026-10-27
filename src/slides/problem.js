// 01: reframes the brief as a collaboration problem, with today's loop vs. the proposed flow.
// Steps are coloured by who does them: m = member, a = Progyny, c = clinic.
const step = (who, text) => `<span class="step ${who}">${text}</span>`;
const arrow = '<span class="arrow">→</span>';

export default {
  id: 'problem',
  title: 'The problem',
  className: 'is-dense s-problem',
  render(el) {
    el.innerHTML = `
      <div class="eyebrow" data-focus="head">01 · The problem</div>
      <h2 class="reframe" data-focus="head"><span class="no">Not a back-office problem. Not a UX problem.</span><br>A collaboration problem.</h2>
      <p class="goal" data-focus>Reviewers know what a claim needs. Members hold the documents, and sometimes only the clinic can provide them. <strong>The goal: help the member understand what's needed from them, as seamlessly as possible, before they submit.</strong></p>
      <div class="flows">
        <div class="flow today" data-focus><span class="lbl">Today</span>
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
        <div class="flow proposed" data-focus="proposed"><span class="lbl">Proposed</span>
          <div class="steps">
            ${step('m', "Member sees exactly what's needed")}${arrow}
            ${step('m', 'Member gathers it, asking the clinic early')}${arrow}
            ${step('c', 'Clinic sends document')}${arrow}
            ${step('m', 'Member submits a complete claim')}${arrow}
            ${step('a', 'Reviewed once')}${arrow}
            ${step('a', 'Decision')}
          </div>
        </div>
      </div>
      <div class="legend" data-focus="proposed"><span class="lm">Member</span><span class="la">Progyny</span><span class="lc">Clinic</span></div>
    `;
  },
};
