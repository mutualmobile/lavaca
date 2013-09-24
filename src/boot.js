require.config({
  baseUrl: 'js',
  paths: {
    'es5-shim': '../components/es5-shim/es5-shim',
    '$': '../components/jquery/index',
    'jquery': '../components/jquery/index',
    'cordova': 'libs/cordova',
    'mout': '../components/mout/src',
    'docCookies': 'libs/docCookies',
    'dust': '../components/dustjs-linkedin/dist/dust-full-2.0.3',
    'dust-helpers': '../components/dustjs-linkedin-helpers/dist/dust-helpers-1.1.1',
    'rdust': 'libs/require-dust',
    'iScroll': '../components/iscroll/dist/iscroll-lite-min',
    'lavaca': 'lavaca'
  },
  shim: {
    $: {
      exports: '$'
    },
    jquery: {
      exports: '$'
    },
    dust: {
      exports: 'dust'
    },
    'dust-helpers': {
      deps: ['dust']
    },
    templates: {
      deps: ['dust']
    }
  }
});
require(['es5-shim']);
require(['app/app']);