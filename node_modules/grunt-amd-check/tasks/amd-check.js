module.exports = function(grunt) {

	'use strict';

	var path = require('path');
	var amd = require('grunt-lib-amd');
	var _ = require('underscore');


	var _getPlugin = function(pluginName, rjsconfig) {
		rjsconfig.nodeRequire = require;
		amd.requirejs.config(rjsconfig);

		var plugin = amd.requirejs(pluginName);

		if (!plugin || !plugin.load) {
			throw '"' + pluginName + '" plugin could not be resolved';
		}

		return plugin;
	};


	var _pluginCanLoad = function(plugin, loadArgs) {
		var didLoad = false;
		var load = function() {
			didLoad = true;
		};
		load.fromText = function() {
			didLoad = true;
		};

		try {
			plugin.load(loadArgs, amd.requirejs, load, {});
		}
		catch(e) {
			return false;
		}

		return didLoad;
	};


	grunt.registerMultiTask('amd-check', 'Checks AMD modules for unresolvable dependencies and circular dependencies', function() {
		var files = this.filesSrc.map(function(file) {
			return path.resolve(process.cwd() + '/' + file);
		});
		var rjsconfig = amd.loadConfig(grunt.config.get('requirejs'));

		grunt.verbose.writeln('Loaded RequireJS config:');
		grunt.verbose.writeln(JSON.stringify(rjsconfig, false, 4));

		var found = false;

		grunt.log.writeln('Scanning ' + files.length + ' files for unresolved dependencies...');

		var depCache = {};

		files.forEach(function(file) {
			depCache[file] = amd.getDeps(file);
		});

		files.forEach(function(file) {
			var deps = depCache[file]
				.filter(function(depPath) {
					//ignore special 'require' dependency
					return depPath !== 'require';
				})
				.map(function(depPath) {
					if (depPath.search(/!/) !== -1) {
						var rParts = /^(.*)!(.*)$/;
						var parts = depPath.match(rParts);
						var pluginName = parts[1];
						var pluginArgs = parts[2];

						var plugin;
						try {
							plugin = _getPlugin(pluginName, rjsconfig);
						}
						catch(e) {
							return {
								declared: depPath,
								resolved: false,
								message: 'Error on \u001b[4m\u001b[31m' + pluginName + '\u001b[0m!' + pluginArgs + ': "' + pluginName + '" plugin could not be resolved'
							};
						}

						if (!_pluginCanLoad(plugin, pluginArgs)) {
							return {
								declared: depPath,
								resolved: false,
								message: 'Error on ' + pluginName + '!\u001b[4m\u001b[31m' + pluginArgs + '\u001b[0m: "' + pluginName + '" plugin could not load with given arguments'
							};
						}

						return {
							declared: depPath,
							resolved: true
						};
					}

					return {
						declared: depPath,
						resolved: amd.moduleToFileName(depPath, path.dirname(file), rjsconfig)
					};
				})
				.filter(function(dep) {
					return !dep.resolved;
				});

			if (deps.length) {
				found = true;
				grunt.log.writeln('');
				grunt.log.writeln('\u001b[31mWarning:\u001b[0m Unresolved dependencies in ' + file + ':');
				deps.forEach(function(dep) {
					grunt.log.writeln('\t' + dep.declared);
					if (dep.message) {
						grunt.log.writeln('\t\t' + dep.message);
					}
				});
			}
		});

		if (!found) {
			grunt.log.writeln('All dependencies resolved properly!');
		}

		grunt.log.write('\n\n');
		grunt.log.write('Checking for circular dependencies...');

		found = [];
		_.each(depCache, function(deps, file) {
			depCache[file] = deps.map(function(dep) {
				return amd.moduleToFileName(dep, path.dirname(file), rjsconfig);
			});
		});

		var checkCircular = function(file, graphPath) {
			var i = graphPath.indexOf(file);
			if (i !== -1) {
				var loop = graphPath.slice(i);
				found.push(loop);
				return;
			}
			graphPath.push(file);

			if (depCache[file] === undefined) {
				depCache[file] = amd.getDeps(file).map(function(dep) {
					return amd.moduleToFileName(dep, path.dirname(file), rjsconfig);
				});
			}

			depCache[file].forEach(function(dep) {
				checkCircular(dep, graphPath.slice());
			});
		};

		files.forEach(function(file) {
			checkCircular(file, []);
		});

		//eliminate duplicate circular dependency loops
		var _rotated = function(arr, i) {
			var ret = arr.slice(0);
			for (var j = 0; j < i; j++) {
				ret = [ret[ret.length - 1]].concat(ret.slice(0, ret.length - 1));
			}
			return ret;
		};

		var _equal = function(first, second) {
			return JSON.stringify(first) === JSON.stringify(second);
		};

		//loops are "equal" if their elements are equal when "shifted" to the right by some amount
		var _loopEqual = function(first, second) {
			if (_equal(first, second)) {
				return true;
			}
			for (var i = 1; i <= first.length; i++) {
				if (_equal(first, _rotated(second, i))) {
					return true;
				}
			}
			return false;
		};

		var dupes = [];
		found = found
			.filter(function(loop, i) {
				if (i === 0) {
					return true;
				}

				var isDuplicate = false;
				var before = found.slice(0, i - 1);
				before.every(function(candidateLoop, j) {
					if (dupes.indexOf(j) !== -1) {
						return true; //continue
					}
					if (_loopEqual(loop, candidateLoop)) {
						isDuplicate = true;
						return false;
					}
					return true;
				});
				if (isDuplicate) {
					dupes.push(i);
				}
				return !isDuplicate;
			})
			.map(function(loop) {
				return loop.map(function(file) {
					return amd.fileToModuleName(file, rjsconfig);
				});
			});

		if (!found.length) {
			grunt.log.writeln(' none found');
			return;
		}

		grunt.log.writeln('\u001b[31m ' + found.length + ' found:\u001b[0m\n');

		/*
		 *found.forEach(function(loop) {
		 *    grunt.log.writeln(
		 *        loop
		 *            .concat([loop[0]])
		 *            .join(' -> ')
		 *    );
		 *});
		 */


		var _longestCommonSublist = function(first, second) {
			var start = 0;
			var max = 0;

			for (var i = 0; i < first.length; i++) {
				for (var j = 0; j < second.length; j++) {
					var x = 0;
					while (first[i + x] === second[j + x]) {
						x++;
						if ((i + x >= first.length) || (j + x >= second.length)) {
							break;
						}
					}
					if (x > max) {
						max = x;
						start = i;
					}
				}
			}

			return first.slice(start, start + max);
		};

		var _longestCommonSublistInLoops = function(first, second) {
			var bestCase = Math.min(first.length, second.length);
			var max = [];

			for (var i = 0; i < first.length; i++) {
				var firstList = _rotated(first, i);
				for (var j = 0; j < second.length; j++) {
					var secondList = _rotated(second, j);
					var commonSublist = _longestCommonSublist(firstList, secondList);
					if (commonSublist.length === bestCase) {
						return commonSublist;
					}
					if (commonSublist.length > max.length) {
						max = commonSublist;
					}
				}
			}

			return max;
		};

		var _grouped = function(loops) {
			var worstLength = 2;
			var groups = {};

			for (var i = 0; i < loops.length; i++) {
				var first = loops[i];
				for (var j = 0; j < loops.length; j++) {
					if (i === j) {
						continue;
					}

					var second = loops[j];
					var commonSublist = _longestCommonSublistInLoops(first, second);
					if (commonSublist.length >= worstLength) {
						var key = commonSublist.join(',');
						groups[key] = groups[key] || [];
						groups[key].push(first);
						groups[key].push(second);
					}
				}
			}

			_.each(groups, function(loops, key) {
				groups[key] = _.uniq(loops);
			});

			return groups;
		};

		var grouped = _grouped(found);
		var ungrouped = _.difference(
			found,
			_.reduce(grouped, function(memo, loops) {
				return memo.concat(loops);
			}, [])
		);

		_.each(grouped, function(loops, key) {
			grunt.log.writeln('Grouped by longest common subpath:');
			var group = key.split(',');
			grunt.log.writeln('{ ' + group.join(' -> ') + ' }');

			loops
				.sort(function(a, b) {
					return a.length - b.length;
				})
				.map(function(loop) {
					for (var i = 0; i < loop.length; i++) {
						var rotated = _rotated(loop, i);
						if (rotated[0] === group[0]) {
							return rotated;
						}
					}
				})
				.forEach(function(loop) {
					grunt.log.write('\t' + loop.join(' -> '));
					grunt.log.write(' ( -> ' + loop[0] + ' -> ...)\n');
				});
		});

		ungrouped.forEach(function(loop) {
			grunt.log.write(loop.join(' -> '));
			grunt.log.write(' ( -> ' + loop[0] + ' -> ...)\n');
		});


	});


	grunt.registerTask('whatrequires', 'Traces which files depend on given js file', function(searchFile) {
		searchFile = path.resolve(searchFile);
		var rjsconfig = amd.loadConfig(grunt.config.get('requirejs'));

		if (!grunt.file.exists(searchFile)) {
			grunt.log.write(searchFile + ' does not exist! ').error();
			return;
		}

		var config = grunt.config.get('amd-check');
		var pool = grunt.task.normalizeMultiTaskFiles(config.files)[0].src;

		grunt.verbose.writeln('Loaded RequireJS config:');
		grunt.verbose.writeln(JSON.stringify(rjsconfig, false, 4));

		var matches = pool.filter(function(file) {
			file = path.resolve(file);

			var deps = _.map(amd.getDeps(file), function(depPath) {
				return amd.moduleToFileName(depPath, path.dirname(file), rjsconfig);
			});

			return deps.some(function(dep) {
				//take case-insensitive filesystems like HFS+ into account
				return dep && dep.toLowerCase() === searchFile.toLowerCase();
			});
		});

		switch (matches.length) {
		case 0:
			grunt.log.write('No files depend');
			break;
		case 1:
			grunt.log.write('1 file depends');
			break;
		default:
			grunt.log.write(matches.length + ' files depend');
			break;
		}

		grunt.log.write(' on ' + searchFile);

		if (!matches.length) {
			grunt.log.write('.\n');
		}
		else {
			grunt.log.write(':\n');
			grunt.log.writeln('-----------------------------------------------------------');
			matches.forEach(function(file) {
				grunt.log.writeln(file);
			});
		}

	});

};
