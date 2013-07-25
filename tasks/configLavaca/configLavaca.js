'use strict';

module.exports = function(grunt) {

  grunt.registerTask('configLavaca', 'copies cordova config and then places www directory back into corodva folder', function() {
    var paths = grunt.config.get('paths');
    var configDest = paths.cordovaInit.cordovaConfigDest;
    var config = paths.cordovaInit.cordovaConfig;
    grunt.file.copy(config, configDest);
    grunt.task.run(['clean:cordova', 'copy:configLavaca', 'clean:init']);
  });

};
