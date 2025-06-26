const fs = require('fs')
const postcss = require('postcss')
const safeParser = require('postcss-safe-parser')

const html = fs.readFileSync('dist/index.html', 'utf8')
const js = fs.readFileSync('dist/index.js', 'utf8')

const htmlClasses = [...html.matchAll(/class="([^"]+)"/g)]
  .map(e => e[1].split(' ').map(c => c.trim()).filter(c => c)).flat()

const jsClasses = [...js.matchAll(/classList\.add\(([^)]+)\)/g)]
  .map(e => e[1].replace(/['"]/g, '').split(',').map(c => c.trim()).filter(c => c)).flat()

const usedClasses = new Set(htmlClasses.concat(jsClasses))
const preservedSelectors = ['html', 'body', 'div', `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, 'p', 'a', 'button', 'input', 'textarea', 'select', '*']

const css = fs.readFileSync('dist/index.css', 'utf8')
const root = postcss().process(css, { parser: safeParser }).root

root.walkRules(rule => {
  const keepSelectors = rule.selectors?.filter(selector => {
    if (preservedSelectors.includes(selector)) return true

    const classMatches = selector.match(/\.(\w[\w-]*)/g)
    if (!classMatches) return false

    return classMatches.every(cls => usedClasses.has(cls.slice(1)))
  })

  if (!keepSelectors || keepSelectors.length === 0) {
    rule.remove()
  } else {
    rule.selectors = keepSelectors
  }
})

fs.writeFileSync('dist/index.css', root.toString())

