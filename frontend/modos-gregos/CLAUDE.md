# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A vanilla JavaScript guitar/bass fretboard visualizer for scales and modes. Supports 21+ scales/modes, multiple instrument tunings (6/7-string guitar, 4/5-string bass, ukulele, custom), configurable fret count, and trilingual UI (PT/EN/ES) via i18next.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview the production build

No test runner or linter is configured.

## Architecture

Single-page app with no framework — all DOM manipulation is imperative via native APIs. The entire application lives in three source files under `src/`:

- **`src/index.js`** (~470 lines) — All application logic in one module:
  - Music theory data (chromatic notes, tuning presets, mode/scale interval patterns, pentatonics)
  - Scale generation (`generateScale`, `generateChromaticScale`, enharmonic normalization)
  - Fretboard rendering (`generateArmMatrix` builds a string×fret 2D note array, `renderFretboard` builds the HTML table)
  - Tuning controls (preset selector, per-string note selectors)
  - i18n wrapper around i18next with `setLanguage()` for full UI re-translation
  - Language persisted in `localStorage`
- **`src/index.css`** — All styles (CSS custom properties, flexbox, gradients, backdrop-filter)
- **`src/locales/{en,pt,es}.json`** — Translation files for i18next

## Build Configuration

Vite is configured with `root: "src"` and `outDir: "../dist"`. The entry HTML is `src/index.html`.
