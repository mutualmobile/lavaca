(function() {

	'use strict';

	var fs = require('fs');
	var path = require('path');
	var grunt = require('grunt/lib/grunt.js');
	var mixin = require('mout/object/deepMixIn');
	var _ = require('underscore');
	var requirejs = require('./lib/r.js');
	var parse = require('./lib/parse');


	var amd = {

		requirejs: requirejs,


		loadConfig: function(config) {
			if (config.mainConfigFile) {
				if (!fs.existsSync(config.mainConfigFile)) {
					throw new Error('requirejs config: mainConfigFile property: file cannot be found');
				}

				var mainConfig = parse.findConfig(grunt.file.read(config.mainConfigFile)).config;
				return mixin({}, mainConfig, config);
			}

			return config;
		},


		getDeps: function(file) {
			try {
				return parse.findDependencies(file, grunt.file.read(file));
			}
			catch (e) {
				return [];
			}
		},


		fileToModuleName: function(filePath, rjsconfig) {
			var baseUrl = rjsconfig.baseUrl;
			var absolutePath = path.normalize(filePath);

			//passed a relative path
			if (!fs.existsSync(filePath)) {
				absolutePath = path.resolve(process.cwd() + '/' + filePath);
			}

			var baseDirectory = path.resolve(process.cwd() + '/' + baseUrl);
			var relativePath = path.relative(baseDirectory, absolutePath);

			//combine all path transformation operations together
			var paths = rjsconfig.paths || [];
			var packages = rjsconfig.packages || [];
			var transforms = _.map(paths, function(val, key) {
				return {
					from: val,
					to: key
				};
			}).concat(packages.map(function(pkg) {
			return {
				from: pkg.location,
				to: pkg.name
			};
			}));

			_.chain(transforms)
			.sortBy(function(obj) {
				//transform in order from most complex to simplest
				return -1 * obj.from.length;
			})
			.every(function(obj) {
				if (relativePath.search(obj.from) !== -1) {
					relativePath = relativePath.replace(obj.from, obj.to);
					return false;
				}
				return true;
			});

			return relativePath.replace('.js', '');
		},


		moduleToFileName: function(declaredName, directory, rjsconfig) {
			declaredName = declaredName.replace(/\.js/, '');

			var candidate;

			//relative paths
			if (declaredName.search(/^\./) !== -1) {
				candidate = path.normalize(directory + '/' + declaredName + '.js');

				if (fs.existsSync(candidate)) {
					return candidate;
				}
				else {
					return undefined;
				}
			}

			//non-transformed paths
			candidate = path.resolve(process.cwd() + '/' + rjsconfig.baseUrl + '/' + declaredName + '.js');

			if (fs.existsSync(candidate)) {
				return candidate;
			}

			//transformed paths (have 'paths' or 'packages' entries in rjsconfig)
			var paths = rjsconfig.paths || [];
			var packages = rjsconfig.packages || [];
			var transforms = _.map(paths, function(val, key) {
				return {
					from: key,
					to: val
				};
			}).concat(packages.map(function(pkg) {
				return {
					from: pkg.name,
					to: pkg.location
				};
			}));

			var result;

			_.chain(transforms)
			.sortBy(function(obj) {
				//transform in order from most complex to simplest
				return -1 * obj.from.length;
			})
			.every(function(obj) {
				var candidate = declaredName;
				if (candidate.search(obj.from) !== -1) {
					candidate = candidate.replace(obj.from, obj.to);
					candidate = path.resolve(process.cwd() + '/' + rjsconfig.baseUrl + '/' + candidate + '.js');
					if (fs.existsSync(candidate)) {
						result = candidate;
						return false;
					}
				}
				return true;
			});

			if (result) {
				return result;
			}

			//try CommonJS Packages directory structure
			result = packages
			.filter(function(pkg) {
				return pkg.name === declaredName;
			})
			.map(function(pkg) {
				return path.resolve(process.cwd(), rjsconfig.baseUrl, pkg.location, pkg.main || 'main');
			})
			.filter(function(path) {
				return fs.existsSync(path) || fs.existsSync(path + '.js');
			})[0];

			if (result) {
				return result;
			}

			//path in current directory without a leading './'
			result = path.normalize(directory + '/' + declaredName + '.js');
			return result;

		}

	};


	module.exports = amd;

})();
