const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env, argv) => ({
  mode: env.prod ? 'production' : 'development',
  context: path.resolve(__dirname, './'),
  entry: [
    !env.prod && path.resolve(__dirname, 'sandbox/sandbox.js'),
    path.resolve(__dirname, 'src/datepicker.js')
  ].filter(Boolean),
  target: 'web', // Default.
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'datepicker.min.js',
    library: 'datepicker',
    libraryTarget: 'umd' // "Universal" export - Node, browser, amd, etc.
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.less$/,
        include: path.resolve(__dirname, 'src'),
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
  devServer: {
    /*
      https://goo.gl/eFdUfe
      Tell the dev server where to serve content from.
      This is only necessary if you want to serve static files.
      Content not served from Webpack's devServer is served from here.
    */
    contentBase: path.resolve(__dirname, './'),

    /*
      https://goo.gl/A8ZvxG
      Want to view your site on your phone?
      Make sure your computer and phone are on the same wifi network,
      and navigate to your computer's ip addres: 192.1.2.3:<dev server port>
    */
    host: '0.0.0.0',

    // https://goo.gl/fZ1Hff
    open: true,

    // https://goo.gl/EVMMyC
    port: 9001,

    /*
      https://goo.gl/mrysGp, https://goo.gl/srfqLB
      Nobody wants to see 0.0.0.0 in the browser. This get's rid of that.
    */
    public: 'http://localhost:9001'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'datepicker.min.css'
    }),

    // Used only in development.
    // Prevents `npm run build` from creating an html asset in the dist folder.
    !env.prod && new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.ejs'),
      title: 'Datepicker Sandbox'
    })
  ].filter(Boolean)
})
