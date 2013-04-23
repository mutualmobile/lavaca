module.exports = function(grunt) {
  'use strict';

  var child = require('child_process');

  grunt.registerMultiTask('docs', 'Generates documentation using atnotate', function() {
    var options = this.options();
    var src = this.files[0].src;
    var dest = this.files[0].dest;
    var done = this.async();
    child.exec('python ' + options.atnotate + '/atnotate.py -s ' + src + ' -d ' + dest + ' -t ' + options.atnotate + '/templates', function(err) {
      if (err) {
        grunt.log.error();
        grunt.log.writeln(err);
      }
      done();
    });
  });

};
