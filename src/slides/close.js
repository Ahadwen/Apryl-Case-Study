export default {
  id: 'close',
  title: 'Thank you',
  className: 'is-title',
  render(el) {
    el.innerHTML = `
      <h1>Thank you</h1>
      <p class="muted">Questions</p>
    `;
  },
};
