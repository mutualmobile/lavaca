module.exports = function(config) {
  config.set({
    basePath: '',
    browsers: ['PhantomJS'],
    files: [
      { pattern: 'bower_components/es5-shim/es5-shim.js', watched: false },
      { pattern: 'bower_components/es6-shim/es6-shim.js', watched: false },
      { pattern: 'test/context-compiled.js', watched: false }
    ],
    frameworks: ['jasmine'],
    preprocessors: {
        'test/context-compiled.js': ['sourcemap']
    },
    reporters: ['dots'],
    autoWatch: false,
    singleRun: true
  });
};
