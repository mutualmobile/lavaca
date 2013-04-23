require.config({
  baseUrl: 'js',
  packages: [{
    name: 'app',
    location: 'app'
  }],
  paths: {
    '$': 'libs/jquery-1.9.1',
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

require(['app']);
