var webpackConfig = require('./webpack.config.js');
var path = require('path');

webpackConfig.module = {
  loaders: [
    {
      loader: 'babel-loader',
      include: [
        path.resolve(__dirname, 'src/'),
        path.resolve(__dirname, 'test/unit')
      ],
      exclude: /(node_modules)/,
      test: /\.js?$/,
      query: {
        presets: [],
        plugins: [
          ['transform-es2015-modules-commonjs-simple', { 'noMangle': true, 'addExports': true }]
        ]
      }
    }
  ]
};

module.exports = webpackConfig;
