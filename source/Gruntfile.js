module.exports = function( grunt ) {

  'use strict';

  grunt.initConfig({
    paths: {
      src: {
        root: 'src',
        www: '<%= paths.src.root %>/www',
        ios: '<%= paths.src.root %>/ios',
        android: '<%= paths.src.root %>/android'
      },
      lib: {
        cordova: {
          ios: 'libs/cordova/ios/cordova-2.2.0.min.js',
          android: 'libs/cordova/android/cordova-2.2.0.min.js'
        },
        atnotate: 'libs/atnotate'
      },
      tmp: {
        root: 'tmp',
        www: '<%= paths.tmp.root %>/www',
        ios: '<%= paths.tmp.root %>/ios',
        android: '<%= paths.tmp.root %>/android'
      },
      build: {
        root: 'build',
        www: '<%= paths.build.root %>/www',
        ios: '<%= paths.build.root %>/ios',
        android: '<%= paths.build.root %>/android'
      },
      asset: {
        ios: '<%= paths.build.ios %>/www',
        android: '<%= paths.build.android %>/assets/www'
      },
      out: {
        index: 'index.html',
        css: 'css/app.min.css',
        js: 'js/app.min.js',
        cordova: 'js/cordova.min.js'
      },
      pkg: {
        root: 'pkg',
        android: '<%= paths.pkg.root %>/<%= pkg.name %>.apk',
        ios: '<%= paths.pkg.root %>/<%= pkg.name %>.ipa'
      },
      docs: 'docs'
    },

    pkg: grunt.file.readJSON('package.json'),

    clean: {
      tmp: ['<%= paths.tmp.root %>'],
      build: ['<%= paths.build.root %>'],
      pkg: ['<%= paths.pkg.root %>']
    },

    uglify: {
      all: {
        options: {
          banner: '/*! <%= pkg.title %> v<%= pkg.version %> | License: <%= pkg.license %> */\n'
        },
        files: [
          {
            src: '<%= paths.tmp.www %>/<%= paths.out.js %>',
            dest: '<%= paths.tmp.www %>/<%= paths.out.js %>'
          }
        ]
      }
    },

    preprocess: {
      www: {
        options: {
          locals: {
            css: '<link rel="stylesheet" type="text/css" href="<%= paths.out.css %>" />\n',
            js: '<script src="<%= paths.out.js %>"></script>\n'
          }
        },
        files: [{
          src: '<%= paths.tmp.www %>/<%= paths.out.index %>',
          dest: '<%= paths.build.www %>/<%= paths.out.index %>'
        }]
      },
      ios: {
        options: {
          locals: {
            css: '<%= preprocess.www.options.locals.css %>',
            js: (function() {
              return [
                '<%= paths.out.cordova %>',
                '<%= paths.out.js %>'
              ]
                .map(function(file) {
                  return '<script src="' + file + '"></script>';
                })
                .join('\n') + '\n';
            })()
          }
        },
        files: [{
          src: '<%= paths.tmp.www %>/<%= paths.out.index %>',
          dest: '<%= paths.asset.ios %>/<%= paths.out.index %>'
        }]
      },
      android: {
        options: {
          locals: {
            css: '<%= preprocess.www.options.locals.css %>',
            js: '<%= preprocess.ios.options.locals.js %>'
          }
        },
        files: [{
          src: '<%= paths.tmp.www %>/<%= paths.out.index %>',
          dest: '<%= paths.asset.android %>/<%= paths.out.index %>'
        }]
      }
    },

    less: {
      build: {
        options: {
          compress: true
        },
        files: [
          {
            src: '<%= paths.tmp.www %>/css/app/app.less',
            dest: '<%= paths.tmp.www %>/<%= paths.out.css %>'
          }
        ]
      }
    },

    concat: {
      css: {
        src: '<%= paths.tmp.www %>/css/app.css',
        dest: '<%= paths.tmp.www %>/css/app.built.css'
      }
    },

    jasmine: {
      all: ['test/runner.html']
    },

    dustjs: {
      all: {
        files: [
          {
            src: '<%= paths.tmp.www %>/templates/**/*.html',
            dest: '<%= paths.tmp.www %>/js/templates.js'
          }
        ]
      }
    },

    docs: {
      all: {
        options: {
          atnotate: '<%= paths.lib.atnotate %>'
        },
        files: [
          {
            src: '<%= paths.src.www %>',
            dest: 'docs'
          }
        ]
      }
    },

    'amd-test': {
      mode: 'jasmine',
      files: 'test/unit/**/*.js'
    },

    jshint: {
      src: {
        options: {
          jshintrc: '<%= paths.src.www %>/js/.jshintrc'
        },
        files: {
          src: '<%= paths.src.www %>/js/**/*.js'
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

    server: {
      port: 8080,
      //base: BASE_DIR
      base: 'src/www'
    },

    copy: {
      tmp: {
        files: [
          {
            expand: true,
            cwd: '<%= paths.src.root %>',
            src: '**/*',
            dest: '<%= paths.tmp.root %>/'
          }
        ]
      },
      build: {
        files: (function() {
          var files = [];

          files.push({
            expand: true,
            cwd: '<%= paths.tmp.ios %>',
            src: '**/*',
            dest: '<%= paths.build.ios %>'
          });

          files.push({
            expand: true,
            cwd: '<%= paths.tmp.android %>',
            src: '**/*',
            dest: '<%= paths.build.android %>'
          });

          [
            '<%= paths.build.www %>/',
            '<%= paths.asset.ios %>/',
            '<%= paths.asset.android %>/'
          ].forEach(function(dest) {
            files.push({
              expand: true,
              cwd: '<%= paths.tmp.www %>',
              src: [
                '<%= paths.out.index %>',
                '<%= paths.out.css %>',
                '<%= paths.out.js %>',
                'img/**/*',
                'messages/**/*'
              ],
              dest: dest
            });
          });

          files.push({
            src: '<%= paths.lib.cordova.ios %>',
            dest: '<%= paths.asset.ios %>/js/cordova.min.js'
          });

          files.push({
            src: '<%= paths.lib.cordova.android %>',
            dest: '<%= paths.asset.android %>/js/cordova.min.js'
          });

          return files;
        })()
      }
    },

    'amd-check': {
      files: [
        '<%= paths.src.www %>/js/**/*.js',
        'test/unit/**/*.js'
      ]
    },

    'amd-dist': {
      all: {
        options: {
          standalone: false
        },
        files: [
          {
            src: [
              '<%= paths.tmp.www %>/js/libs/require.js',
              '<%= paths.tmp.www %>/js/app/boot.js',
              '<%= paths.tmp.www %>/js/templates.js'
            ],
            dest: '<%= paths.tmp.www %>/<%= paths.out.js %>'
          }
        ]
      }
    },

    requirejs: {
      baseUrl: '<%= paths.src.www %>/js',
      mainConfigFile: '<%= paths.src.www %>/js/app/boot.js',
      optimize: 'none',
      keepBuildDir: true,
      locale: "en-us",
      useStrict: false,
      skipModuleInsertion: false,
      findNestedDependencies: false,
      removeCombined: false,
      preserveLicenseComments: false,
      logLevel: 0
    }
  });

  grunt.loadTasks('tasks/server');
  grunt.loadTasks('tasks/pkg');
  grunt.loadTasks('tasks/docs');
  grunt.loadTasks('tasks/preprocess');
  grunt.loadNpmTasks('grunt-dustjs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-amd-dist');
  grunt.loadNpmTasks('grunt-amd-test');
  grunt.loadNpmTasks('grunt-amd-check');

  grunt.registerTask('build', ['clean', 'copy:tmp', 'dustjs', 'less', 'concat', 'amd-dist', 'uglify', 'copy:build', 'preprocess', 'clean:tmp']);
  grunt.registerTask('test', ['amd-test', 'jasmine']);

};
