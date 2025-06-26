import autoprefixer from 'autoprefixer'
import purgecss from '@fullhuman/postcss-purgecss'

export default {
  plugins: [
    autoprefixer(),
    purgecss.purgeCSSPlugin({
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,html}'],
    })
  ]
}