require.config({
  baseUrl: './',
  paths: {
    '$': '../bower_components/jquery/jquery',
    'jquery': '../bower_components/jquery/jquery',
    'mout': '../bower_components/mout/src',
    'lavaca': './'
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
require(['app/app']);
