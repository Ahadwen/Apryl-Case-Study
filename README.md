# Apryl Case Study

Slide deck for the Apryl case study, built with [reveal.js](https://revealjs.com) and hosted on GitHub Pages.

## Editing

- reveal.js 5.1.0 is vendored in `vendor/reveal/` (no CDN needed when presenting)
- Slide content: `slides.md` (`---` = new slide, `--` = vertical sub-slide, `Note:` = speaker notes)
- Styling: `assets/theme.css`
- Present: open the Pages URL, press `S` for speaker view, `F` for fullscreen, `Esc` for overview.

## Local preview

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

(`slides.md` is fetched at runtime, so opening `index.html` straight from disk won't work.)

## Hosting

`.github/workflows/pages.yml` deploys on every push to `main` (and, for now, the working branch `claude/peaceful-einstein-obqdri`). One-time setup: repo **Settings → Pages → Source: GitHub Actions**.
