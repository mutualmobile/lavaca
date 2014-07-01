module.exports = function(grunt) {
  'use strict';
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jasmine: {
      all: {
        // PhantomJS is not fully ES5-compatible; shim it
        src: [
          'src/components/es5-shim/es5-shim.js',
          'src/components/es6-shim/es6-shim.js'
        ],
        options: {
          specs: 'test/unit/**/*.js',
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfigFile: 'src/boot.js',
            requireConfig: {
              baseUrl: 'src'
            }
          },
          keepRunner: true
        }
      }
    },

    jshint: {
      src: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: {
          lavaca: 'src/js/lavaca/**/*.js'
        }
      },
      test: {
        options: {
          jshintrc: 'test/unit/.jshintrc'
        },
        files: {
          src: 'test/unit/**/*.js'
        }
      }
    },

    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: 'src',
          outdir: 'docs',
          linkNatives: true,
          themedir: 'libs/yuidoc/themes/default'
        }
      }
    },

    requirejs: {
      baseUrl: 'src',
      mainConfigFile: 'src/boot.js',
      optimize: 'none',
      keepBuildDir: true,
      locale: "en-us",
      useStrict: false,
      skipModuleInsertion: false,
      findNestedDependencies: false,
      removeCombined: false,
      preserveLicenseComments: false,
      logLevel: 0
    },

    open : {
      doc : {
        path: 'docs/index.html'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-open');

  // Default task.
  grunt.registerTask('doc', ['yuidoc', 'open:doc']);
  grunt.registerTask('test', 'generates runner and runs the tests', ['jasmine']);

};
