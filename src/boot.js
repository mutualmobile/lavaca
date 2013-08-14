require.config({
  baseUrl: 'js',
  paths: {
    'es5-shim': 'libs/es5-shim',
    '$': 'libs/jquery-2.0.0',
    'jquery': 'libs/jquery-2.0.0',
    'jquery-mobile': 'libs/jquery-mobile',
    'cordova': 'libs/cordova',
    'mout': 'libs/mout',
    'docCookies': 'libs/docCookies',
    'dust': 'libs/dust-full-1.2.4',
    'dust-helpers': 'libs/dust-helpers-1.1.1',
    'rdust': 'libs/require-dust',
    'iscroll': 'libs/iscroll-lite',
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