var karmaConfig = require('./karma.conf.js');

module.exports = function(config) {
  karmaConfig(config);
  config.set({
    reporters: ['dots', 'coverage'],
    coverageReporter: {
      type : 'lcov',
      dir : 'test/coverage/'
    }
  });
};
