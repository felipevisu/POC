# Modos Gregos

Visualizador de escalas e modos no braço de instrumentos de corda. Vanilla JS, sem framework.

## Funcionalidades

- 21+ escalas e modos (gregos, pentatônicas, menores harmônica/melódica, etc.)
- Instrumentos: guitarra 6/7 cordas, baixo 4/5 cordas, ukulele, afinação customizada por corda
- Número de trastes configurável
- Interface trilíngue (PT / EN / ES) via i18next, idioma persistido em `localStorage`

## Como funciona

Tudo vive em `src/index.js`:

- Dados de teoria musical: notas cromáticas, presets de afinação, padrões de intervalos por modo
- `generateScale` — gera a escala a partir de tônica + padrão de intervalos, com normalização enarmônica
- `generateArmMatrix` — monta matriz corda × traste com a nota de cada posição
- `renderFretboard` — renderiza a matriz como tabela HTML, destacando notas da escala
- Controles de afinação e wrapper de i18n com `setLanguage()` para retradução completa da UI

Estilos em `src/index.css` (custom properties, flexbox, backdrop-filter). Traduções em `src/locales/{pt,en,es}.json`.

## Rodar

```bash
npm install
npm run dev      # Vite com HMR
npm run build    # gera dist/
npm run preview
```

## Stack

Vanilla JavaScript · Vite 7 · i18next
