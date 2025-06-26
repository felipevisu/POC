const fs = require('fs')

const html = fs.readFileSync('dist/index.html', 'utf8')
const js = fs.readFileSync('dist/index.js', 'utf8')

const htmlClasses = [...html.matchAll(/class="([^"]+)"/g)]
  .map(e => e[1].split(' ').map(c => c.trim()).filter(c => c)).flat()

const jsClasses = [...js.matchAll(/classList\.add\(([^)]+)\)/g)]
  .map(e => e[1].replace(/['"]/g, '').split(',').map(c => c.trim()).filter(c => c)).flat()

const classes = new Set(htmlClasses.concat(jsClasses))

const css = fs.readFileSync('dist/index.css', 'utf8')

const purgedCss = css.replace(/\.([a-zA-Z0-9_-]+)[^{]*\{[^}]*}/g, (rule, className) => {
  return classes.has(className) ? rule : ''
})

fs.writeFileSync('dist/index.css', purgedCss)