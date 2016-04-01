module.exports = function(config) {
  config.set({
    files: [
      { pattern: 'test/context-compiled.js', watched: false, nocache: true }
    ],
    frameworks: ['jasmine'],
    preprocessors: {
        'test/context-compiled.js': ['sourcemap']
    },
    reporters: ['dots'],
    autoWatch: false,
    singleRun: false
  });
};
