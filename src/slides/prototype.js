// Placeholder for a live prototype slide. Everything inside .prototype is a real,
// interactive app; it shows that a slide can hold state, handle input and clean up.
export default {
  id: 'prototype',
  title: 'Prototype',
  className: 'is-split',
  render(el) {
    el.innerHTML = `
      <div>
        <div class="eyebrow">Prototype</div>
        <h2>Working prototype</h2>
        <p class="muted">Placeholder. The real prototype will replace the panel on the right.</p>
      </div>
      <div class="prototype" data-capture-keys>
        <label>Type something <input type="text" placeholder="Arrow keys stay in here"></label>
        <p class="echo muted">&nbsp;</p>
      </div>
    `;
    const input = el.querySelector('input');
    const echo = el.querySelector('.echo');
    const onInput = () => { echo.textContent = input.value || ' '; };
    input.addEventListener('input', onInput);
    return () => input.removeEventListener('input', onInput);
  },
};
