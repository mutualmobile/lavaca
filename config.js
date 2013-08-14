var fs = require('fs');
var config = {
	libsDir: 'src/js/libs',
	modulesDir: 'node_modules',
	copies: {
	  'dustjs-linkedin': ['dist/dust-full-1.2.4.js', 'dist/dust-full-1.2.3.js'],
	  'dustjs-helpers': ['dist/dust-helpers-1.1.1.js'],
	  'mout': 'src',
	  'es5-shim': ['es5-shim.js'],
	  'requirejs': ['require.js'],
	  'iscroll': ['build/iscroll-lite.js'],
	  'less': ['dist/less-1.4.2.min.js', 'dist/less-1.3.3.min.js', 'dist/less-1.4.2.js'],
	  'jquery-mobile': 'js'
	},
	copyMethodOverrides: {
		'dustjs-linkedin': function(source, target, handleErr) {
			fs.readFile(source, function(err, content) {
				if (err) { return handleErr(err); }
				content = content.toString().replace('var dust', 'window.dust');
				fs.writeFile(target, content, handleErr);
			});
		}
	}
};

module.exports = config;