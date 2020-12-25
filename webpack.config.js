const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')


module.exports = (env, argv) => ({
  mode: env.prod ? 'production' : 'development',
  entry: path.resolve(__dirname, env.prod ? 'src/datepicker.js' : 'sandbox/sandbox.js'),
  target: 'web',
  output: env.prod ? {
    path: path.resolve(__dirname, 'dist'),
    library: 'datepicker', // The name of the global variable the library is set to.
    libraryExport: 'default',
    libraryTarget: 'umd', // "Universal" export - Node, browser, amd, etc.
    filename: 'datepicker.min.js'
  } : {},
  devServer: {
    open: true,
    contentBase: path.resolve(__dirname, './sandbox'),
    port: 9001,
    public: 'http://localhost:9001'
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/i,
        use: [
          MiniCssExtractPlugin.loader, // https://goo.gl/uUBr8G
          'css-loader',
          'postcss-loader', // https://goo.gl/BCwCzg - needs to be *after* `css-loader`.
          'sass-loader'
        ]
      }
    ]
  },
  optimization: {
    minimize: !!env.prod,
    minimizer: [
      new TerserPlugin({ // https://goo.gl/YgdtKb
        parallel: true, //https://goo.gl/hUkvnK
        terserOptions: { // https://goo.gl/y3psR1
          ecma: 5,
          output: {
            comments: false
          }
        }
      })
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'datepicker.min.css'
    }),
    !env.prod && new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'sandbox/index.ejs'),
      title: 'Datepicker Sandbox'
    })
  ].filter(Boolean)
})
