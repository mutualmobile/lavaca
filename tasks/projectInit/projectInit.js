'use strict';

module.exports = function(grunt) {

  grunt.registerTask('projectInit', 'wrapper task for project setup', function() {

    grunt.task.run(['initLavaca', 'initCordova', 'initPlatforms', 'configLavaca']);

  });

};