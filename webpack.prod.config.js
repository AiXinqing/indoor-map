const path = require('path'),
      { CleanWebpackPlugin } = require('clean-webpack-plugin'),
      HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'cheap-module-eval-source-map',
  entry: {
    app: './src/app.js',
  },
  output: {
    filename: '[name]-[hash].js',
    path: path.resolve(process.cwd(), './dist'),
    publicPath: '/dist',
  },
  module: {
    rules: [
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
    new HtmlWebpackPlugin({
      title: 'indoor-map',
      filename: 'index.html',
      template: './src/index.html',
      meta: {
        viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
      },
    }),
  ],
  resolve: {
    alias: {
      assets: path.resolve(process.cwd(), './src/assets'),
    },
  }
}
