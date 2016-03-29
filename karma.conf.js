module.exports = function(config) {
  config.set({
    basePath: '',
    browsers: ['Chrome'],
    files: [
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
