
'use strict';

module.exports = function(grunt) {
  grunt.registerMultiTask('build', 'Configurable build process', function() {
    var paths = grunt.config.get('paths');
    var options = this.options({});
    var tasks = options.tasks;
    tasks.unshift('clean:tmp', 'clean:build', 'copy:tmp');
    var target = this.target;
    var platforms = options.platforms;
    var preProcessIndex = grunt.util._.indexOf(options.tasks, 'preprocess');
    var platformTasks = [];
    platforms.forEach(function(value, index, array){
      platformTasks.push('copy:' + value);
      if (value === 'ios' || value === 'android') {
        platformTasks.push('copy:www' + value);
      }
    });
    if (preProcessIndex > 0){
      platforms.forEach(function(value, index, array){
        platformTasks.push('preprocess' + ':' + value + ':' + target);
      });
      tasks.splice.apply(tasks, [preProcessIndex, 1].concat(platformTasks));
    } else {
      tasks = tasks.concat(platformTasks);
    }

    tasks.push('clean:tmp');
    grunt.verbose.writeln('Options:', options);
    grunt.task.run(tasks);
  });

};
