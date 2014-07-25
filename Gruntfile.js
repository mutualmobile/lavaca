module.exports = function(grunt) {
  'use strict';
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    karma: {
      run: {
        configFile: '.karma.js',
        singleRun: true,
        reporters: ['dots'],
        browsers: ['PhantomJS']
      },
      debug: {
        configFile: '.karma.js',
        reporters: ['dots'],
        browsers: ['Chrome']
      },
      coverage: {
        configFile: '.karma.js',
        singleRun: true,
        reporters: ['dots', 'coverage'],
        browsers: ['PhantomJS'],
        preprocessors: {
          'src/**/*.js': ['coverage']
        },
        coverageReporter: {
          type : 'lcov',
          dir : 'test/coverage/'
        }
      }
    },

    coveralls: {
      options: {
        debug: true,
        coverage_dir: 'test/coverage',
        dryRun: false,
        force: true,
        recursive: true
      }
    },

    jshint: {
      src: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: {
          lavaca: 'src/**/*.js'
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
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-karma-coveralls');

  // Default task.
  grunt.registerTask('doc', ['yuidoc', 'open:doc']);
  grunt.registerTask('test', ['karma:run']);

};
