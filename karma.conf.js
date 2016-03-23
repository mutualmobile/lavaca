var webpack = require('webpack');

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
        'test-context.js': ['webpack']
    },
    webpack: {
        resolve: {
          root: __dirname,
          extensions: ['', '.js','.html'],
          modulesDirectories: ['src','components','node_modules'],
          alias: {
            '$': 'bower_components/jquery/jquery',
            'jquery': 'bower_components/jquery/jquery',
            'mout': 'bower_components/mout/src',
            'es5-shim': 'bower_components/es5-shim/es5-shim',
            'es6-shim': 'bower_components/es6-shim/es6-shim',
            'lavaca': 'src'
          }
        },
        plugins: [
          new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'jquery': 'bower_components/jquery/jquery'
          })
        ],
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
    singleRun: true
  });
};
