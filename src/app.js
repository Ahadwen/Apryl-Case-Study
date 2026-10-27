import { slides } from './slides/index.js';
import { countVisit } from './visits.js';

// Slides render into a fixed 1280x720 stage that is scaled to fit the window,
// so layouts look identical on a laptop, a projector, or a shared screen.
// A slide with fullBleed: true (the live prototype) fills the window at its natural size instead.
const STAGE_W = 1280;
const STAGE_H = 720;

const app = document.getElementById('app');
app.innerHTML = `
  <div class="viewport">
    <div class="stage"></div>
    <div class="full"></div>
  </div>
  <button class="nav-btn prev" data-dir="-1" aria-label="Previous slide"></button>
  <button class="nav-btn next" data-dir="1" aria-label="Next slide"></button>
  <div class="hud"><span class="hud-count"></span></div>
  <div class="progress"><div class="progress-bar"></div></div>
`;

const stage = app.querySelector('.stage');
const full = app.querySelector('.full');
const count = app.querySelector('.hud-count');
const bar = app.querySelector('.progress-bar');
const prev = app.querySelector('.nav-btn.prev');
const next = app.querySelector('.nav-btn.next');

let current = -1;
let cleanup = null;
let currentEl = null;
let sections = [];   // groups of elements on the current slide that Space steps through
let step = -1;       // index into sections; -1 = everything visible

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
  stage.replaceChildren();
  full.replaceChildren();
  (slide.fullBleed ? full : stage).append(el);
  app.classList.toggle('is-full', Boolean(slide.fullBleed));
  // A slide's render() may return a cleanup function (timers, listeners, etc).
  cleanup = slide.render(el);
  if (!slide.fullBleed) shrinkToFit(el);
  currentEl = slide.fullBleed ? null : el;
  sections = sectionsOf(el);
  step = -1;

  count.textContent = `${index + 1} / ${slides.length}`;
  bar.style.width = `${((index + 1) / slides.length) * 100}%`;
  prev.disabled = index === 0;
  next.disabled = index === slides.length - 1;
  document.title = `${slide.title} · Progyny Global Case Study`;
  history.replaceState(null, '', `#${slide.id}`);
}

// Text has no reason to be big at the cost of fitting: if a slide's content overflows the stage,
// step its font size down (headings are sized in em, so they scale with it) until it fits.
function shrinkToFit(el) {
  let size = parseFloat(getComputedStyle(el).fontSize);
  while (el.scrollHeight > el.clientHeight && size > 14) {
    size -= 1;
    el.style.fontSize = `${size}px`;
  }
}

// Sections are marked with data-focus. Elements sharing a value form one section (e.g. the
// eyebrow and heading); an empty value makes the element a section of its own. Order follows the page.
function sectionsOf(el) {
  const groups = new Map();
  let anon = 0;
  for (const node of el.querySelectorAll('[data-focus]')) {
    const key = node.dataset.focus || `#${anon++}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(node);
  }
  return [...groups.values()];
}

// Space steps the focus through the sections, blurring the rest; after the last, back to all visible.
function stepFocus(dir) {
  if (!sections.length || !currentEl) return;
  const n = sections.length + 1;  // the sections, plus "all visible"
  step = ((step + 1 + dir) % n + n) % n - 1;
  currentEl.classList.toggle('focusing', step >= 0);
  sections.forEach((group, i) => group.forEach((node) => node.classList.toggle('focused', i === step)));
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
  if (e.key === ' ') { e.preventDefault(); stepFocus(e.shiftKey ? -1 : 1); }
  if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); show(current + 1); }
  if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); show(current - 1); }
  if (e.key === 'Home') show(0);
  if (e.key === 'End') show(slides.length - 1);
  if (e.key === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
});

// An embedded prototype (iframe) has the keyboard while it's focused, so it forwards ← / → here.
window.addEventListener('message', (e) => {
  if (e.origin !== location.origin || typeof e.data?.deckNav !== 'number') return;
  show(current + e.data.deckNav);
});

app.querySelectorAll('.nav-btn').forEach((btn) =>
  btn.addEventListener('click', () => show(current + Number(btn.dataset.dir)))
);

window.addEventListener('hashchange', () => show(indexFromHash()));
window.addEventListener('resize', fit);

fit();
show(indexFromHash());
// The web font is a little wider than the fallback, so check the fit again once it has loaded.
document.fonts?.ready.then(() => currentEl && shrinkToFit(currentEl));
countVisit();
