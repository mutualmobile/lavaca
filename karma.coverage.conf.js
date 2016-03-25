var webpackConfig = require('./webpack.config.js');
var path = require('path');

webpackConfig.module.loaders.push({
  test: /\.js/,
  include: path.resolve('src'),
  loader: 'istanbul-instrumenter'
});

module.exports = function(config) {
  config.set({
    basePath: '',
    browsers: ['PhantomJS'],
    files: [
      { pattern: 'bower_components/es5-shim/es5-shim.js', watched: false },
      { pattern: 'bower_components/es6-shim/es6-shim.js', watched: false },
      { pattern: 'test-context.js', watched: false }
    ],
    frameworks: ['jasmine'],
    preprocessors: {
        'test-context.js': ['webpack', 'sourcemap']
    },
    webpack: webpackConfig,
    autoWatch: false,
    singleRun: true
  });
};
