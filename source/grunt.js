/*global module:false*/

var dust = require('dustjs-linkedin'),
    exec = require('child_process').exec,
    preprocess = require('preprocess'),
    fs = require('fs'),
    path = require('path');

module.exports = task;

function task(grunt) {

  function appendBaseDir(file) {
    return BASE_DIR + file;
  }

  function stripBaseDir(file) {
    return file.replace(DIST_BASE_DIR, '');
  }

  function renderIndex(fileMap) {
    var layout = grunt.file.read(this.data.layout),
        compiled = dust.compile(layout, "index"),
        dirs = this.data.destDirs;
    dust.loadSource(compiled);
    dust.render("index", fileMap, function(err, out) {
      if (err) throw err;
      dirs.forEach(function(dir) {
        grunt.file.write(dir + 'index.html', out);
        grunt.log.writeln('index.html generated successfully to "' + dir + '"');
      }, this);
    });
  }

  function copyStaticDirMap(baseRoot, destRoot) {
    var map = {};
    STATIC_DIRS.forEach(function(dir) {
      map[destRoot + dir] = baseRoot + dir + '**';
    });
    return map;
  }

  function copyDirMap(baseRoot, destRoot) {
    var map = {};
    map[destRoot] = baseRoot + '**';
    return map;
  }

  function copy(env) {
    var files = grunt.config(this.name)[env ? env : 'dist'];
    grunt.config.set('copy', {dist: files});
    grunt.task.run('copy');
  }

  function renderDocs() {
    exec('python ' + ATNOTATE_BASE_DIR + 'atnotate.py -s ' + BASE_DIR + ' -d ' + DOCS_DIST_DIR + ' -t ' + ATNOTATE_BASE_DIR + 'templates');
  }

  var _ = grunt.utils._;

  var connect = require('connect');

  var LAVACA = 'lavaca',
      APP = 'app',
      TEST = 'test',
      JS_EXT = '.js',
      CSS_EXT = '.css',
      JS_MIN_EXT = '.min.js',
      CSS_MIN_EXT = '.min.css',
      LAYOUT = 'layout.html',
      LOCAL = 'local',
      STAGING = 'staging',
      PRODUCTION = 'production',
      BASE_DIR = './src/',
      BUILD_BASE_DIR = './build/',
      DIST_BASE_DIR = './www/',
      ANDROID_BASE_DIR = './android/assets/www/',
      IOS_BASE_DIR = './ios/www/',
      WEB_BASE_DIR = './www/',
      ATNOTATE_BASE_DIR = './libs/atnotate/',
      DOCS_DIST_DIR = './docs/',
      STAGING_BASE_DIR = 'www-' + STAGING + '/',
      PRODUCTION_BASE_DIR = 'www-' + PRODUCTION + '/',
      CONF_BASE_DIR = BASE_DIR + 'configs/',
      JS_JSON_DIR = BUILD_BASE_DIR + 'scripts/',
      CSS_JSON_DIR = BUILD_BASE_DIR + 'styles/',
      JS_DIST_DIR = DIST_BASE_DIR + 'js/',
      CSS_DIST_DIR = DIST_BASE_DIR + 'css/app/',
      TEMPLATES_BASE_DIR = BASE_DIR + 'templates/',
      CSS_BASE_DIR = BASE_DIR + 'css/',
      STATIC_DIRS = ['img/', 'messages/', 'mock/', 'templates/'],
      lavacaScripts = require(JS_JSON_DIR + LAVACA).src.map(appendBaseDir),
      appScripts = require(JS_JSON_DIR + APP).src.map(appendBaseDir),
      appStyles = require(CSS_JSON_DIR + APP).src.map(appendBaseDir),
      testScripts = require(JS_JSON_DIR + TEST).specs;


  var buildConfig = {
        build: {
          js: {
            lavaca: {
              src: lavacaScripts,
              dest: JS_DIST_DIR + LAVACA + JS_EXT,
              minDest: JS_DIST_DIR + LAVACA + JS_MIN_EXT
            },
            app:  {
              src: appScripts,
              dest: JS_DIST_DIR + APP + JS_EXT,
              minDest: JS_DIST_DIR + APP + JS_MIN_EXT
            }
          },
          css: {
            app: {
              src: appStyles,
              dest: CSS_DIST_DIR + APP + CSS_EXT,
              minDest: CSS_DIST_DIR + APP + CSS_MIN_EXT
            }
          },
          test: {
            src : lavacaScripts.concat(appScripts),
            specs : testScripts
          }
        }
      };

  var config = _.extend({}, buildConfig, {
    meta: {
      version: '0.1.0'
      // banner: '/*! PROJECT_NAME - v<%= meta.version %> - ' +
      //   '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      //   '* http://PROJECT_WEBSITE/\n' +
      //   '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
      //   'YOUR_NAME; Licensed MIT */'
    },
    //yeoman
    staging: 'temp',
    output: 'www',
    //end yeoman
    clean: {
      build: ['temp', 'www']
    },
    'usemin-handler': {
      html: 'temp/index.html'
    },
    usemin: {
      html: ['temp/index.html']
    },
    rev: {
      js: 'temp/js/app.built.min.js',
      css: 'temp/css/app/app.css'
    },
    lint: {
      files: ['grunt.js', BASE_DIR + '**/*.js', 'test/**/*.js']
    },
    min: {
      build: {
        src: 'temp/js/app.built.js',
        dest: 'temp/js/app.built.min.js'
      }
    },
    cssmin: {
      cssApp: {
        src: '<config:concat.cssApp.dest>',
        dest: buildConfig.build.css.app.minDest
      }
    },
    preprocess: {
      build: {
        src: 'temp/index.html',
        dest: 'temp/index.html',
        locals: {
          css: 'test',
          js: 'test'
        }
      }
    },
    less: {
      build: {
        options: {
          compress: true
        },
        files: {
          'temp/css/app.css': 'temp/css/app/app.less'
        }
      }
    },
    concat: {
      css: {
        dest: 'temp/css/app.built.css',
        src: ['temp/css/app.css']
      }
    },
    jasmine : {
      //src : '<config:build.test.src>',
      specs : '<config:build.test.specs>',
      //helpers : 'specs/helpers/*.js',
      timeout : 5000,
      //template : 'src/custom.tmpl',
      phantomjs : {
        'ignore-ssl-errors': true
      },
      src: [],
      server: {
        port: '8888'
      }
    },
    'jasmine-server': {
      browser : true
    },
    dustjs: {
      compile: {
        files: {
          'src/js/app/ui/templates.js': [TEMPLATES_BASE_DIR+ '**/*.html']
        }
      }
    },
    docs: {
      dist : {
        src: buildConfig.build.test.src, 
        dest: 'docs'
      }
    },
    test: {
      mode: 'jasmine',
      include: 'test/unit/**/*.js'
    },
    watch: {
      files: [BUILD_BASE_DIR + '**/*', BASE_DIR  + '**/*'],
      tasks: 'build'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {}
    },
    uglify: {},
    server: {
      port: 8080,
      base: BASE_DIR
    },
    index: {
      unminified: {
        layout: BASE_DIR + LAYOUT,
        destDirs: [BASE_DIR]
      },
      minified: {
        layout: BASE_DIR + LAYOUT,
        destDirs: [DIST_BASE_DIR]
      }
    },
    copy: {
      temp: {
        files: {
          'temp/': 'src/**'
        }
      },
      www: {
        files: {
          'www/': 'temp/index.html',
          'www/css/': 'temp/css/*.built.css',
          'www/js/': 'temp/js/*.built.min.js'
        }
      },
      ios: {
        files: {
          'ios/www/': 'www/**'
        }
      },
      android: {
        files: {
          'android/assets/www/': 'www/**'
        }
      }
    },
    'copy-static': {
      dist: {
        files: copyStaticDirMap(BASE_DIR, DIST_BASE_DIR)
      }
    },
    'copy-env': {
      staging: {
        files: copyDirMap(DIST_BASE_DIR, STAGING_BASE_DIR)
      },
      production: {
        files: copyDirMap(DIST_BASE_DIR, PRODUCTION_BASE_DIR)
      }
    },
    'copy-device': {
      ios: {
        files: copyDirMap(DIST_BASE_DIR, IOS_BASE_DIR)
      },
      android: {
        files: copyDirMap(DIST_BASE_DIR, ANDROID_BASE_DIR)
      }
    },
    checkrequire: {
      include: ['src/js/**/*.js', 'test/unit/**/*.js']
    },
    whatrequires: {
      module: 'src/js/Lavaca/util/Map.js',
      include: ['src/js/**/*.js', 'test/unit/**/*.js']
    },
    dist: {
      out: 'temp/js/app.built.js',
      standalone: false,
      include: 'temp/js/app/**/*.js',
      excludeBuilt: [],
      excludeShallow: []
    },
    requirejs: {
      baseUrl: 'src/js',
      mainConfigFile: 'src/js/app/boot.js',
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

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-dustjs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-amd-dist');
  grunt.loadNpmTasks('grunt-amd-test');
  grunt.loadNpmTasks('grunt-amd-checkrequire');


  grunt.registerMultiTask('preprocess', 'Preprocess HTML containing special comments', function() {
    var src = this.data.src;
    var dest = this.data.dest;
    preprocess.preprocessFileSync(src,dest,this.data.locals);
  });


  grunt.registerTask('build', 'clean copy:temp less concat dist min preprocess copy:www copy:ios copy:android');


  grunt.registerMultiTask('docs', 'Generates documentation using atnotate', function(env) {
    renderDocs.call(this, this.data);
  });

  grunt.registerMultiTask('index', 'Generates index.html from layout template', function(env) {
    renderIndex.call(this, grunt.helper('getFileMap', 'minified' === this.target, env));
  });

  grunt.registerTask('copy-static', 'Copies all static files', copy);
  grunt.registerTask('copy-env', 'Copies all sources files to environment specific directory', copy);
  grunt.registerTask('copy-device', 'Copies all source files to device specific directory', function() {
    var configs = grunt.config(this.name);
    grunt.config.set('copy', configs);
    grunt.task.run('copy');
  });

  grunt.registerTask('watch-all', 'Watches all file changes for rebuild for a specific environment', function(env) {
    if (STAGING === env || PRODUCTION === env) {
      grunt.config.set('watch.tasks', 'build-' + env);
    }
    grunt.task.run('watch');

  });

  grunt.registerTask('static-server', function(root, port) {
    var done = this.async();
    root = root ? root : grunt.config('server.base');
    port = port ? port : grunt.config('server.port');
    grunt.log.writeln('Starting static web server in "' + root + '" on port "' + port);
    connect(connect.static(root))
      .listen(port)
      .on('close', done);
  });

  //grunt.registerTask('build', 'dustjs concat min less cssmin index copy-static copy-device');
  grunt.registerTask('build-staging', 'concat min cssmin index::staging copy-static copy-env:staging copy-device');
  grunt.registerTask('build-production', 'concat min cssmin index::production copy-static copy-env:production copy-device');
  grunt.registerTask('run', 'build server watch-all');
  grunt.registerTask('run-staging', 'build-staging server watch-all:staging');
  grunt.registerTask('run-production', 'build-production server watch-all:production');

  grunt.registerTask('default', 'docs build test:minified');

  grunt.registerHelper('getFileMap', function(isMin, env) {
    var fileMap = {},
        json;
    fileMap.lavacaScripts = isMin ? stripBaseDir(buildConfig.build.js.lavaca.minDest) : require(JS_JSON_DIR + LAVACA).src;
    fileMap.appScripts = isMin ? stripBaseDir(buildConfig.build.js.app.minDest) : require(JS_JSON_DIR + APP).src;
    fileMap.appStyles = isMin ? stripBaseDir(buildConfig.build.css.app.minDest) : require(CSS_JSON_DIR + APP).src;
    fileMap.configs = {};
    if (STAGING === env) {
      fileMap.configs.env = STAGING;
    } else if (PRODUCTION === env) {
      fileMap.configs.env = PRODUCTION;
    } else {
      fileMap.configs.env = LOCAL;
    }
    json = grunt.file.read(CONF_BASE_DIR + fileMap.configs.env + '.json');
    fileMap.configs.json = json;
    return fileMap;
  });

}
