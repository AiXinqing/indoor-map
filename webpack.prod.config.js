const path = require('path'),
      { CleanWebpackPlugin } = require('clean-webpack-plugin'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  mode: 'production',
  devtool: 'cheap-module-eval-source-map',
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
        test: /\.(scss|css)$/,
        use: [
          {
            loader: 'style-loader',
          },
          { loader: 'css-loader', options: { importLoaders: 1, sourceMap: true } },
        ]
      },
    ],
  },
  plugins: [
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
