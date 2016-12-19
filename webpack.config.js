const path = require('path');

const webpack = require('webpack');

const dirLib = path.resolve(__dirname, 'lib');
const dirDist = path.resolve(__dirname, 'dist');

module.exports = {
  target: 'node',
  node: {
    __dirname: true,
    __filename: true
  },
  context: dirLib,
  entry: './cli.js',
  output: {
    path: dirDist,
    filename: 'dafny-transpiler.js'
  },
  module: {
    loaders: [
      {
        loader: 'eslint-loader',
        enforce: 'pre',
        test: /\.js$/,
        include: dirLib,
        exclude: /node_modules/
      },
      {
        loader: 'babel-loader',
        test: /\.js$/,
        include: dirLib,
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ]
};
