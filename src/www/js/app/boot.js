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
    'lz77': 'libs/lz77',
    'iScroll': 'libs/iscroll-lite-4.1.6',
    'lavaca': 'Lavaca'
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
    },
    lz77: {
      exports: 'LZ77'
    }
  }
});

require(['app/app']); // this is app.js