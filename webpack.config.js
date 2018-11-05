const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'datepicker.js'),
  target: 'web', // Default.
  output: {
    path: path.resolve(),
    filename: 'datepicker.min.js',
    library: 'datepicker',
    libraryTarget: 'umd' // "Universal" export - Node, browser, amd, etc.
  },
  module: {
    rules: [
      {
        test: /datepicker.js/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env'
            ]
          }
        }
      },
      {
        test: /datepicker.less/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'datepicker.css'
    })
  ]
}
