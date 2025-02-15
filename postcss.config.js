export default {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {
      flexbox: true,
      grid: true
    },
    'cssnano': process.env.NODE_ENV === 'production' ? {
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        normalizeWhitespace: false,
      }]
    } : false
  }
}