# simple-bundler

A minimal CSS-in-JS bundler built on top of `@wyw-in-js/transform` (the engine behind Linaria). It walks a source tree, compiles every file that uses `css`/`styled` tags at build time, and emits a single static stylesheet — zero runtime CSS-in-JS in the browser.

## What it does

1. Globs `src/**/*.{js,jsx,ts,tsx}`.
2. Skips files with no CSS-in-JS imports (cheap regex pre-check).
3. Runs each remaining file through `transform()` with a Babel preset chain (`@linaria`, `preset-react`, `preset-typescript`).
4. Collects the extracted `cssText` per file into a map.
5. Concatenates everything (with a source comment per file) into `dist/styles.css`.

## Run

```bash
npm install
node index.js
```

Output: `dist/styles.css` plus a summary (files scanned, files with CSS, bundle size).

## Why

To understand what tools like Linaria/wyw-in-js actually do under the hood: evaluate tagged templates at build time, replace them with class names, and ship plain CSS. The whole thing is one class (`SimpleWywBundler`) in `index.js`.

## Stack

Node (ESM) · `@wyw-in-js/transform` · `@linaria/babel-preset` · Babel (React + TypeScript presets) · `glob`
