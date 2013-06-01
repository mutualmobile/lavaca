module.exports = function(grunt) {
  'use strict';

  var path = require('path');
  var child = require('child_process');
  var toArray = require('mout/lang/toArray');
  var partial = require('mout/function/partial');
  var Deferred = require('deferreds/Deferred');
  var forEachSeries = require('deferreds/forEachSeries');
  var series = require('deferreds/series');
  var promisify = require('promisemonkey');
  var parseString = promisify.convert(require('xml2js').parseString);


  var _partial = function() {
    var args = toArray(arguments);
    var ret = partial.apply(this, args);

    ret.then = function(onFulfilled, onRejected) {
      return function() {
        return Deferred.fromAny(partial.apply(this, args))
          .then(onFulfilled, onRejected);
      };
    };

    return ret;
  };


  var _cmd = function(command, cwd) {
    grunt.verbose.write('\n$ ' + command + '\n');
    cwd = cwd || process.cwd();

    var deferred = new Deferred();

    var p = child.exec(command, {cwd: cwd, maxBuffer: 10000000}, function(err, stdout) {
      if (err) {
        deferred.reject(err);
      }
      else {
        deferred.resolve(stdout);
      }
    });

    if (grunt.option('verbose')) {
      var firstline = true;

      p.stdout.on('data', function(data) {
        if (firstline) {
          process.stdout.write('> ');
          firstline = false;
        }
        process.stdout.write(data.toString().replace(/\n/g, '\n> '));
      });

      p.stderr.on('data', function(err) {
        if (firstline) {
          process.stderr.write('> ');
          firstline = false;
        }
        process.stderr.write(err.toString().replace(/\n/g, '\n> '));
      });
    }

    /*
     *p.stderr.on('data', function(err) {
     *  deferred.reject(err);
     *  p.kill();
     *});
     */

    return deferred.promise();
  };


  var _runCommands = function(tasks) {
    return forEachSeries(tasks, function(task) {
      grunt.log.write(task.msg);
      var promise = _cmd(task.cmd, task.cwd);
      var timer = setInterval(function() {
        grunt.log.notverbose.write('.');
      }, 1000);
      return promise.then(
        function() {
          clearInterval(timer);
          grunt.log.ok();
        },
        function(err) {
          clearInterval(timer);
          grunt.log.error();
          throw err;
        }
      );
    });
  };


  grunt.registerMultiTask('pkg', 'Generates debug packages for iOS and android', function() {
    var done = this.async();
    var options = this.options();
    var buildDir = this.files[0].src[0];
    var dest = this.files[0].dest;

    switch (this.target) {
      case 'android':
        new Deferred().resolve()
          .then(function checkExecs() {
            return forEachSeries([
              {
                exec: 'android',
                msg: '`android` from the Android SDK was not found in your PATH. It may be required to build Android packages.'
              },
              {
                exec: 'ant',
                msg: '`ant` (Apache Ant) was not found in your PATH. It is required to build Android packages.'
              }
            ], function(task) {
              return _cmd('type ' + task.exec + ' >/dev/null').then(
                null,
                function() {
                  grunt.log.error('WARNING: ' + task.msg);
                  return true;
                }
              );
            });
          })
          .then(function run() {
            return _runCommands([
              {
                cmd: 'android update project -p ' + buildDir + ' --target 1',
                msg: 'Updating Android project...'
              },
              {
                cmd: 'ant debug',
                cwd: buildDir,
                msg: 'Building debug package...'
              }
            ]);
          }).then(function() {
            var src = path.resolve(buildDir, 'bin', options.name + '-debug.apk');
            grunt.file.copy(src, dest);
            grunt.log.writeln('Package saved to ' + dest);
          })
          .then(done, done);
        break;
      case 'ios':
        new Deferred().resolve()
          .then(function checkExecs() {
            return forEachSeries([
              {
                exec: 'xcodebuild',
                msg: '`xcodebuild` from Xcode\'s "Command Line Tools" was not found in your PATH. It is required to build iOS packages.'
              },
              {
                exec: 'xcrun',
                msg: '`xcrun` from Xcode\'s "Command Line Tools" was not found in your PATH. It is required to build iOS packages.'
              }
            ], function(task) {
              return _cmd('type ' + task.exec + ' >/dev/null').then(
                null,
                function() {
                  grunt.log.error('WARNING: ' + task.msg);
                  return true;
                }
              );
            });
          })
          .then(function run() {
            var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
            var provisionFile = grunt.file.expand(path.resolve(home, 'Library/MobileDevice/Provisioning Profiles/*.mobileprovision'))[0];
            return _runCommands([
              {
                cmd: 'xcodebuild' +
                     ' -project ' + path.resolve(buildDir, options.name + '.xcodeproj') +
                     ' -configuration Debug' +
                     ' -sdk iphoneos' +
                     ' CODE_SIGN_IDENTITY="' + options.identity + '"' +
                     ' CONFIGURATION_BUILD_DIR="' + path.resolve(buildDir, 'build') + '"' +
                     ' clean build',
                msg: 'Building signed debug package...'
              },
              {
                cmd: 'xcrun' +
                     ' -sdk iphoneos' +
                     ' PackageApplication' +
                     ' -v ' + path.resolve(buildDir, 'build', options.name + '.app') +
                     ' -o ' + path.resolve(buildDir, 'build', options.name + '.ipa') +
                     ' --sign "' + options.identity + '"' +
                     ' --embed "' + provisionFile + '"',
                msg: 'Generating package archive...'
              }
            ]);
          }).then(function() {
            var src = path.resolve(buildDir, 'build', options.name + '.ipa');
            grunt.file.copy(src, dest);
            grunt.log.writeln('Package saved to ' + dest);
          })
          .then(done, done);
        break;
    }
  });


  var _installAndroid = function(pkg, devicePkg) {
    return _runCommands([
      {
        cmd: 'adb uninstall ' + devicePkg,
        msg: 'Uninstalling existing package "' + devicePkg + '"...'
      },
      {
        cmd: 'adb install ' + pkg,
        msg: 'Installing "' + pkg + '" to device...'
      }
    ]);
  };


  var _installIos = function(pkg, devicePkg) {
    return _runCommands([
      {
        cmd: 'ideviceinstaller --uninstall ' + devicePkg,
        msg: 'Uninstalling existing package "' + devicePkg + '"...'
      },
      {
        cmd: 'ideviceinstaller --install ' + pkg,
        msg: 'Installing "' + pkg + '" to device...'
      }
    ]);
  };


  grunt.registerTask('install', 'Installs package to first connected device', function() {
    var done = this.async();

    var timer;
    new Deferred().resolve()
      .then(function checkExecs() {
        return forEachSeries([
          {
            exec: 'ideviceinfo',
            msg: '`ideviceinfo` from the "libimobiledevice" package was not found in your PATH. It is required to query iOS devices. Mac OS X users may use https://github.com/benvium/libimobiledevice-macosx'
          },
          {
            exec: 'ideviceinstaller',
            msg: '`ideviceinstaller` from the "libimobiledevice" package was not found in your PATH. It is required to install and uninstall packages to/from iOS devices. Mac OS X users may use https://github.com/benvium/libimobiledevice-macosx'
          },
          {
            exec: 'adb',
            msg: '`adb` from the Android SDK was not found in your PATH. It is required to install and uninstall packages to/from Android devices.'
          }
        ], function(task) {
          return _cmd('type ' + task.exec + ' >/dev/null').then(
            null,
            function() {
              grunt.log.error('WARNING: ' + task.msg);
              return true;
            }
          );
        });
      })
      .then(function() {
        grunt.log.write('Looking for an attached device...');
        timer = setInterval(function() {
          grunt.log.notverbose.write('.');
        }, 1000);
      })
      .then(function checkAttached() {
        return series([
          _partial(_cmd, 'adb get-state').then(
            function(stdout) {
              return stdout.toString().trim() === 'device';
            },
            function() {
              return false;
            }
          ),
          _partial(_cmd, 'ideviceinfo').then(
            function(stdout) {
              return stdout.search(/no device found/gi) === -1;
            },
            function() {
              return false;
            }
          )
        ]);
      })
      .then(function(results) {
        var isAndroid = results[0];
        var isIos = results[1];

        if (isAndroid) {
          grunt.log.writeln('Android device found.');

          var files = grunt.task.normalizeMultiTaskFiles(grunt.config.get('pkg.android'));
          var buildDir = files[0].src[0];
          var pkgFile = files[0].dest;
          var manifest = path.resolve(buildDir, 'AndroidManifest.xml');

          return parseString(grunt.file.read(manifest))
            .then(function(data) {
              var packageName = data.manifest.$['package'];
              //console.log(packageName);
              return _installAndroid(pkgFile, packageName);
            });
        }
        else if (isIos) {
          grunt.log.writeln('iOS device found.');

          var files = grunt.task.normalizeMultiTaskFiles(grunt.config.get('pkg.ios'));
          var buildDir = files[0].src[0];
          var pkgFile = files[0].dest;
          var plist = grunt.file.expand(buildDir + '/**/*Info.plist')[0];
          var data = grunt.file.read(plist);
          var bundleIdentifier;
          data.split('\n').forEach(function(line, i, list) {
            if (line.search(/<key>.*?CFBundleIdentifier.*?<\/key>/i) !== -1) {
              var next = list[i+1];
              bundleIdentifier = next.match(/<string>(.*)<\/string>/i)[1];
            }
          });
          if (!bundleIdentifier) {
            grunt.log.error('Could not parse bundle identifier from ' + plist);
            throw 'break';
          }
          return _installIos(pkgFile, bundleIdentifier);
        }
        else {
          grunt.log.writeln('No device found.');
          throw 'break';
        }
      })
      .then(done, done);

  });

};
