module.exports = function(config) {
  config.set({
    basePath: '',
    browsers: ['PhantomJS'],
    files: [
        { pattern: 'test/test-context.js', watched: false }
    ],
    frameworks: ['jasmine', 'requirejs'],
    preprocessors: {
        'test-context.js': ['webpack']
    },
    webpack: {
        module: {
            loaders: [
                { 
                  test: /\.js/, 
                  exclude: /node_modules/, 
                  loader: 'babel-loader' 
                }
            ]
        },
        watch: true
    },
    webpackServer: {
        noInfo: true
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: false
  });
};
