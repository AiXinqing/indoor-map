const path = require('path'),
      { CleanWebpackPlugin } = require('clean-webpack-plugin'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  mode: 'production',
  entry: {
    app: './src/main.js',
  },
  output: {
    filename: '[name]-[hash].js',
    path: path.resolve(process.cwd(), './dist'),
    publicPath: '/dist',
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
          MiniCssExtractPlugin.loader,
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
    new MiniCssExtractPlugin({
      filename: 'style.css'
    }),
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      title: 'indoor-map',
      filename: 'index.html',
      template: './src/index.html',
      meta: {
        viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0',
      },
    }),
  ],
  resolve: {
    alias: {
      assets: path.resolve(process.cwd(), './src/assets'),
    },
  }
}
