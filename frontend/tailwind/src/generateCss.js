import { writeFile } from 'fs/promises';
import { spacing, colors, breakpoints } from './tokens.js';

let baseCSS = '/* Auto-generated base tailwind */\n';
let responsiveCSS = '/* Auto-generated responsive tailwind */\n';

function generateSpacing(prefix, property, value) {
  return `.${prefix} { ${property}: ${value}; }\n`;
}

for (const [key, value] of Object.entries(spacing)) {
  baseCSS += generateSpacing(`p-${key}`, 'padding', value);
  baseCSS += generateSpacing(`pt-${key}`, 'padding-top', value);
  baseCSS += generateSpacing(`pr-${key}`, 'padding-right', value);
  baseCSS += generateSpacing(`pb-${key}`, 'padding-bottom', value);
  baseCSS += generateSpacing(`pl-${key}`, 'padding-left', value);

  baseCSS += generateSpacing(`m-${key}`, 'margin', value);
  baseCSS += generateSpacing(`mt-${key}`, 'margin-top', value);
  baseCSS += generateSpacing(`mr-${key}`, 'margin-right', value);
  baseCSS += generateSpacing(`mb-${key}`, 'margin-bottom', value);
  baseCSS += generateSpacing(`ml-${key}`, 'margin-left', value);
}

for (const [key, value] of Object.entries(colors)) {
  baseCSS += generateSpacing(`text-${key}`, 'color', value);
  baseCSS += generateSpacing(`bg-${key}`, 'background-color', value);
}

// Responsive media queries
for (const [bpName, bpSize] of Object.entries(breakpoints)) {
  responsiveCSS += `@media (min-width: ${bpSize}) {\n`;
  for (const [key, value] of Object.entries(spacing)) {
    responsiveCSS += generateSpacing(`${bpName}\\:p-${key}`, 'padding', value);
    responsiveCSS += generateSpacing(`${bpName}\\:pt-${key}`, 'padding-top', value);
    responsiveCSS += generateSpacing(`${bpName}\\:pr-${key}`, 'padding-right', value);
    responsiveCSS += generateSpacing(`${bpName}\\:pb-${key}`, 'padding-bottom', value);
    responsiveCSS += generateSpacing(`${bpName}\\:pl-${key}`, 'padding-left', value);

    responsiveCSS += generateSpacing(`${bpName}\\:m-${key}`, 'margin', value);
    responsiveCSS += generateSpacing(`${bpName}\\:mt-${key}`, 'margin-top', value);
    responsiveCSS += generateSpacing(`${bpName}\\:mr-${key}`, 'margin-right', value);
    responsiveCSS += generateSpacing(`${bpName}\\:mb-${key}`, 'margin-bottom', value);
    responsiveCSS += generateSpacing(`${bpName}\\:ml-${key}`, 'margin-left', value);
  }
  responsiveCSS += '}\n';
}

await writeFile('./src/tailwind.css', baseCSS + responsiveCSS);
console.log('tailwind.css with breakpoints generated.');
