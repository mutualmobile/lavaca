'use strict';

module.exports = function(grunt) {

  grunt.registerTask('cordovaBuild', 'builds Cordova Projects', function(platform) {

    var paths = grunt.config.get('paths');

    var build = paths.build.root;

    var done = this.async();

    var doneFunction = function (error, result, code) {
      if (error) {
        grunt.log.error(error);
      }
      grunt.log.write(result.stdout);
      return done();
    };

    var args = [];
    args.push('build');
    if (platform) {
      args.push(platform);
    }


    var options = {
      cmd: 'cordova',
      args: args,
      opts: {
        cwd: build
      }
    };

    var cordova = grunt.util.spawn(options, doneFunction);

  });

};
