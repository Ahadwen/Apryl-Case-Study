import { slides } from './slides/index.js';

// Slides render into a fixed 1280x720 stage that is scaled to fit the window,
// so layouts look identical on a laptop, a projector, or a shared screen.
const STAGE_W = 1280;
const STAGE_H = 720;

const app = document.getElementById('app');
app.innerHTML = `
  <div class="viewport">
    <div class="stage"></div>
  </div>
  <nav class="hud">
    <span class="hud-count"></span>
    <button class="hud-btn" data-dir="-1" aria-label="Previous slide">&larr;</button>
    <button class="hud-btn" data-dir="1" aria-label="Next slide">&rarr;</button>
  </nav>
  <div class="progress"><div class="progress-bar"></div></div>
`;

const stage = app.querySelector('.stage');
const count = app.querySelector('.hud-count');
const bar = app.querySelector('.progress-bar');

let current = -1;
let cleanup = null;

function fit() {
  const scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
  stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function show(index) {
  index = Math.max(0, Math.min(slides.length - 1, index));
  if (index === current) return;
  current = index;

  if (typeof cleanup === 'function') cleanup();
  const slide = slides[index];
  const el = document.createElement('section');
  el.className = `slide ${slide.className ?? ''}`.trim();
  stage.replaceChildren(el);
  // A slide's render() may return a cleanup function (timers, listeners, etc).
  cleanup = slide.render(el);

  count.textContent = `${index + 1} / ${slides.length}`;
  bar.style.width = `${((index + 1) / slides.length) * 100}%`;
  document.title = `${slide.title} · Apryl Case Study`;
  history.replaceState(null, '', `#${slide.id}`);
}

function indexFromHash() {
  const i = slides.findIndex((s) => s.id === location.hash.slice(1));
  return i === -1 ? 0 : i;
}

// Arrow keys/space navigate, unless focus is inside an interactive prototype.
function isTyping(target) {
  return target.closest('input, textarea, select, [contenteditable], [data-capture-keys]');
}

document.addEventListener('keydown', (e) => {
  if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
  if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); show(current + 1); }
  if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); show(current - 1); }
  if (e.key === 'Home') show(0);
  if (e.key === 'End') show(slides.length - 1);
  if (e.key === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
});

app.querySelectorAll('.hud-btn').forEach((btn) =>
  btn.addEventListener('click', () => show(current + Number(btn.dataset.dir)))
);

window.addEventListener('hashchange', () => show(indexFromHash()));
window.addEventListener('resize', fit);

fit();
show(indexFromHash());
