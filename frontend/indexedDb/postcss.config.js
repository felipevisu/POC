import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    autoprefixer(),
    // purgecss.purgeCSSPlugin({
    //   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,html}'],
    // })
  ]
}