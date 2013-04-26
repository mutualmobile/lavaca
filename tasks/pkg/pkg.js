module.exports = function(grunt) {
  'use strict';

  var path = require('path');
  var child = require('child_process');
  var Deferred = require('deferreds').Deferred;
  var forEachSeries = require('deferreds').forEachSeries;

  var cmd = function(command, cwd) {
    cwd = cwd || process.cwd();

    var deferred = new Deferred();
    var timer = setInterval(function() {
      deferred.notify();
    }, 1000);

    child.exec(command, {cwd: cwd}, function(err, stdout) {
      clearInterval(timer);
      if (err) {
        deferred.reject(err);
      }
      else {
        deferred.resolve(stdout);
      }
    });
    return deferred.promise();
  };

  grunt.registerTask('pkg', 'Generates debug packages for iOS and android', function(platform) {
    var done = this.async();

    switch (platform) {
      case 'android':
        var dir = grunt.config.get('paths.build.android');
        forEachSeries([
          {
            cmd: 'android update project -p . --target 1',
            msg: 'Updating Android project...'
          },
          {
            cmd: 'ant debug',
            msg: 'Building debug package...'
          }
        ], function(task) {
          grunt.log.write(task.msg);
          return cmd(task.cmd, dir)
            .progress(function() {
              grunt.log.write('.');
            })
            .done(function() {
              grunt.log.ok();
            })
            .fail(function(err) {
              grunt.log.error();
              grunt.log.writeln(err);
            });
        }).then(function() {
          var src = path.resolve(dir, 'bin/App-debug.apk');
          var dest = grunt.config.get('paths.pkg.android');
          grunt.file.copy(src, dest);
          grunt.log.writeln('Package saved to ' + dest);
          done();
        });
        break;
    }
  });

};
