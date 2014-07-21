require.config({
  baseUrl: './',
  paths: {
    'es5-shim': 'components/es5-shim/es5-shim',
    '$': 'components/jquery/jquery',
    'jquery': 'components/jquery/jquery',
    'mout': 'components/mout/src',
    'iScroll': 'components/iscroll/dist/iscroll-lite-min',
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
require(['es5-shim']);
require(['app/app']);
