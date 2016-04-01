var webpackConfig = require('./webpack.config.js');
var path = require('path');

webpackConfig.module = {
  loaders: [
    {
      loader: 'babel-loader',
      include: [
        path.resolve(__dirname, 'src/')
      ],
      exclude: /(node_modules)/,
      test: /\.js?$/,
      query: {
        presets: ['es2015-webpack'],
        plugins: [
          ['transform-es2015-modules-commonjs-simple', { 'noMangle': true, 'addExports': true }]
        ]
      }
    }
  ]
};

module.exports = webpackConfig;
