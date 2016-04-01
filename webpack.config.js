module.exports = {
    resolve: {
      root: __dirname,
      extensions: ['', '.js','.html'],
      modulesDirectories: ['bower_components', 'node_modules', 'src'],
      alias: {
        'jquery': 'bower_components/jquery/jquery',
        'mout': 'bower_components/mout/src'
      }
    }
};
