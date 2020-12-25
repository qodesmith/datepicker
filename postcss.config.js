module.exports = {
  plugins: {
    autoprefixer: {},
    cssnano: {
      preset: [
        'default',
        {
          /*
            Why do we need to exclude any calc transformations?
            Because we want to preserve any calc declarations as they are
            so that the browser is left to implement how to render any
            sub-pixel situations. Otherwise, cssnano will transform calc's
            into literal percent values and potentially break things for
            some users (https://bit.ly/2vVzZvL).
          */
          calc: {
            exclude: true
          }
        }
      ]
    }
  }
}
