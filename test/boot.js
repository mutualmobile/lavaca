var allTestFiles = [];

var pathToModule = function(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (/^\/base\/test\/unit/.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});


require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  paths: {
    '$': 'bower_components/jquery/jquery',
    'jquery': 'bower_components/jquery/jquery',
    'mout': 'bower_components/mout/src',
    'es5-shim': 'bower_components/es5-shim/es5-shim',
    'es6-shim': 'bower_components/es6-shim/es6-shim',
    'lavaca': 'src'
  },

  shim: {
    $: {
      exports: '$'
    },
    jquery: {
      exports: '$'
    }
  }

});


require([
  'es5-shim',
  'es6-shim'
], function() {
  require(allTestFiles, function() {
    window.__karma__.start();
  });
});
