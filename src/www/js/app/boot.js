require.config({
  baseUrl: 'js',
  paths: {
    '$': 'libs/jquery-2.0.0',
    'jquery': 'libs/jquery-2.0.0',
    'jquery-mobile': 'libs/jquery-mobile',
    'cordova': 'libs/cordova',
    'mout': 'libs/mout/src',
    'dust': 'libs/dust-full-1.1.1',
    'dust-helpers': 'libs/dust-helpers-1.1.0',
    'rdust': 'libs/require-dust',
    'iScroll': 'libs/iscroll-lite-4.1.6',
    'lavaca': 'Lavaca',
    'Lavaca': 'lavaca'
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

require(['app/app']); // this is app.js