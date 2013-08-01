
'use strict';

module.exports = function(grunt) {
  grunt.registerMultiTask('buildProject', 'Configurable build process', function(platform) {
    var paths = grunt.config.get('paths');
    var options = this.options({});
    var tasks = options.tasks;
    tasks.unshift('clean:tmp', 'clean:build', 'copy:tmp');
    var target = this.target;
    var platforms = grunt.config.get('initPlatforms').init.options.platforms;
    var preProcessIndex = grunt.util._.indexOf(options.tasks, 'preprocess');
    var isCordova = grunt.file.exists(paths.src.root + '/.cordova');
    var platformTasks = [];

    platformTasks.push('copy:www');
    platformTasks.push('copy:cordova');
    platformTasks.push('chmod:build');

    if (isCordova) {
      if (platform) {
        platformTasks.push('cordovaBuild:' + platform);
      } else {
        platformTasks.push('cordovaBuild');
      }
    }

    if (preProcessIndex > 0){
      if (isCordova) {
        if (platform) {
          platformTasks.push('preprocess' + ':' + platform + ':' + target)
        } else {
          platforms.forEach(function(value, index, array){
            platformTasks.push('preprocess' + ':' + value + ':' + target);
          });
        }
      }
      platformTasks.push('preprocess:www:' + target);
      tasks.splice.apply(tasks, [preProcessIndex, 1].concat(platformTasks));
    } else {
      tasks = tasks.concat(platformTasks);
    }


    tasks.push('clean:tmp');
    grunt.verbose.writeln('Options:', options);
    grunt.verbose.writeln('Tasks:', tasks);
    grunt.task.run(tasks);
  });



};
