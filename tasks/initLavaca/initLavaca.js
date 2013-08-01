'use strict';

module.exports = function(grunt) {

  grunt.registerTask('initLavaca', 'copies initial www folder, then copies back after symlink has been resolved', function() {
    grunt.task.run(['copy:cordovaInit', 'clean:cordova', 'copy:configLavaca']);
  });

};
