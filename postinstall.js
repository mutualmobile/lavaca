#!/usr/bin/env node
'use strict';
var path = require('path');
var fs = require('fs-extra');
var config = require('./config');
	
var sourceRelPath,
		mod;

for (mod in config.copies) {
	sourceRelPath = config.copies[mod];
	if (Array.isArray(sourceRelPath)) {
		// copy files
		sourceRelPath.forEach(function(relPath) {
			var filename = getFilename(relPath);
			var source = path.join(resolveModuleDir(mod), relPath);
			var target = path.join(__dirname, config.libsDir, filename);
      if (mod in config.copyMethodOverrides) {
        config.copyMethodOverrides[mod](source, target, handleErr);
      }
      fs.removeSync(target);
      fs.symlinkSync(source, target);
		});
	} else {
		// copy folders
    fs.removeSync( path.join(__dirname, config.libsDir, mod));
		fs.symlinkSync(path.join(resolveModuleDir(mod), sourceRelPath), path.join(__dirname, config.libsDir, mod), handleErr);
	}
}

function handleErr(err) {
	if (err) { console.error(err); }
}

function getFilename(path) {
	if (!path) { return ''; }
	var filename = path.split('/');
	filename = filename[filename.length - 1];
	return filename;
}

function resolveModuleDir(mod) {
	try {
		var modEntryFile = require.resolve(mod);
		var patt = new RegExp('^.*?' + mod + '\/');
		var match = modEntryFile.match(patt);
		return match[0];
	} catch(e) {
		return path.join(__dirname, config.modulesDir, mod);
	}
}