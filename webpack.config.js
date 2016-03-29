var webpack = require('webpack');

module.exports = {
    resolve: {
      root: __dirname,
      extensions: ['', '.js','.html'],
      modulesDirectories: ['components','node_modules'],
      alias: {
        '$': 'bower_components/jquery/jquery',
        'jquery': 'bower_components/jquery/jquery',
        'mout': 'bower_components/mout/src'
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
