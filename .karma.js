module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'requirejs'],
    files: [
      'test/boot.js',
      {pattern: 'bower_components/**/*.js', included: false},
      {pattern: 'src/**/*.js', included: false},
      {pattern: 'test/unit/**/*.js', included: false}
    ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: false
  });
};
