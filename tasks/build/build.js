
'use strict';

module.exports = function(grunt) {

  grunt.registerTask('build', 'Configurable build process', function(env) {
    var target = env || 'local';
    grunt.task.run('buildProject:' + target);
  });

};
