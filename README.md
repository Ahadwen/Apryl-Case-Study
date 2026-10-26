# Apryl Case Study

Case study presentation as a browser-based JavaScript app. Plain ES modules with no build step and no dependencies, so GitHub Pages serves the repo as-is.

## Structure

- `index.html`: app shell
- `src/app.js`: slide engine (1280×720 stage scaled to fit, keyboard and button navigation, deep links via `#slide-id`)
- `src/slides/`: one module per slide, ordered in `src/slides/index.js`. Each exports `{ id, title, className?, render(el) }`; `render` builds DOM and may return a cleanup function, so a slide can be a fully interactive prototype.
- `src/styles.css`: design tokens and layout

Keys: `→` / `Space` next, `←` previous, `Home` / `End`, `f` fullscreen. Navigation keys are ignored while focus is inside an input or any element marked `data-capture-keys`.

## Local preview

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

ES modules don't load from `file://`, so open it through a server.

## Hosting

GitHub Pages, **Settings → Pages → Source: Deploy from a branch**, branch `claude/peaceful-einstein-obqdri` (later `main`), folder `/ (root)`.
