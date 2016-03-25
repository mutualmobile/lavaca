var webpack = require('webpack');

module.exports = {
    resolve: {
      root: __dirname,
      extensions: ['', '.js','.html'],
      modulesDirectories: ['components','node_modules'],
      alias: {
        '$': 'bower_components/jquery/jquery',
        'jquery': 'bower_components/jquery/jquery',
        'mout': 'bower_components/mout/src',
        'es5-shim': 'bower_components/es5-shim/es5-shim',
        'es6-shim': 'bower_components/es6-shim/es6-shim'
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'jquery': 'bower_components/jquery/jquery'
      })
    ]
};
