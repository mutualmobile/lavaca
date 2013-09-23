module.exports = function(grunt) {
	'use strict';

	var combine = require('./lib/combine.js');
	var forEachSeries = require('deferreds').forEachSeries;


	grunt.registerMultiTask('amd-dist', 'Runs requirejs optimizer', function() {
		var options = this.options();
		options.requirejs = grunt.config.get('requirejs');
		var done = this.async();

		forEachSeries(this.files, function(f) {
			var src = f.src.filter(function(filepath) {
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			});

			return combine(src, f.dest, options);
		}).then(done);
	});

};
