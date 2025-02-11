export default {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    'cssnano': process.env.NODE_ENV === 'production' ? {
      preset: ['advanced', {
        discardComments: {
          removeAll: true,
        },
        reduceIdents: false,
        zindex: false,
        colormin: {
          preserve: true
        }
      }],
    } : false
  },
}