const path = require('path'),
      webpack = require('webpack'),
      { CleanWebpackPlugin } = require('clean-webpack-plugin'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin'),
      VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  entry: {
    app: './src/main.js',
  },
  output: {
    filename: '[name]-[hash].js',
    path: path.resolve(process.cwd(), './dist'),
    publicPath: '/',
  },
  devServer: {
    clientLogLevel: 'warning',
    contentBase: [path.resolve(process.cwd(), './dist')],
    disableHostCheck: true,
    port: 8000,
    host: '0.0.0.0',
    compress: true,
    hot: true,
    historyApiFallback: {},
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/',
              esModule: false
            }
          },
        ]
      },
      {
        test: /\.(svg|ttf|eot|woff)\??.*$/,
        loader: 'url-loader?limit=10000'
      },
      // 下面几行才是 html-loader 的配置内容
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            minimize: true
          }
        }],
      },
      {
        test: /\.(scss|css)$/,
        use: [
          {
            loader: 'style-loader',
          },
          { loader: 'css-loader', options: { importLoaders: 1, sourceMap: true } },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
          },
        ]
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'indoor-map',
      filename: 'index.html',
      template: './src/index.html',
      meta: {
        viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0',
      },
    }),
    new FriendlyErrorsPlugin(),
  ],
  resolve: {
    alias: {
      assets: path.resolve(process.cwd(), './src/assets'),
    },
  },
}
