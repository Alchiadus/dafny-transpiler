var path = require('path');

var webpack = require('webpack');

var dirLib = path.resolve(__dirname, 'lib');
var dirDist = path.resolve(__dirname, 'dist');

module.exports = {
  target: 'node',
  node: {
    __dirname: true,
    __filename: true
  },
  context: dirLib,
  entry: './main.js',
  output: {
    path: dirDist,
    filename: 'dafny-transpiler.js'
  },
  module: {
    preLoaders: [{
      loader: 'eslint-loader',
      test: /\.js$/,
      include: dirLib,
      exclude: /node_modules/
    }],
    loaders: [{
      loader: 'babel-loader',
      test: /\.js$/,
      include: dirLib,
      exclude: /node_modules/
    }]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
};
