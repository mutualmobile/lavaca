'use strict';

module.exports = function(grunt) {

  grunt.registerTask('cordovaInit', 'wrapper task for project setup', function() {

    grunt.task.run(['initLavaca', 'initCordova', 'initPlatforms', 'configLavaca']);

  });

};