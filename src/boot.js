require.config({
  baseUrl: './',
  paths: {
    'es5-shim': 'components/es5-shim/es5-shim',
    '$': 'components/jquery/index',
    'jquery': 'components/jquery/index',
    'mout': 'components/mout/src',
    'dust': 'components/dustjs-linkedin/dist/dust-full-2.0.3',
    'dust-helpers': 'components/dustjs-linkedin-helpers/dist/dust-helpers-1.1.1',
    'rdust': 'components/require-dust/require-dust',
    'iScroll': 'components/iscroll/dist/iscroll-lite-min',
    'lavaca': './'
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