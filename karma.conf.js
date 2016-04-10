module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    files: [
      { pattern: 'node_modules/sinon/pkg/sinon-1.17.3.js', watched: false, nocache: true },
      { pattern: 'node_modules/chai/chai.js', watched: false, nocache: true },
      { pattern: 'node_modules/jquery/dist/jquery.js', watched: false, nocache: true },
      { pattern: 'test/context-compiled.js', watched: true, nocache: true }
    ],
    preprocessors: {
      'test/context-compiled.js': ['sourcemap']
    },
    reporters: ['dots'],
    autoWatch: false,
    singleRun: false,
    client: {
      mocha: {
        timeout: 500
      }
    }
  });
};
