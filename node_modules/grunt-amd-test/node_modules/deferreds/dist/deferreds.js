module.exports = (function() {
	
/**
 * almond 0.2.0 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        aps = [].slice;

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!defined.hasOwnProperty(name) && !defining.hasOwnProperty(name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (defined.hasOwnProperty(depName) ||
                           waiting.hasOwnProperty(depName) ||
                           defining.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        waiting[name] = [name, deps, callback];
    };

    define.amd = {
        jQuery: true
    };
}());

define("../../../grunt-amd-dist/tasks/lib/almond", function(){});

define('forceNew',[],function() {

	var forceNew = function(ctor, args, displayName) {
		//create object with correct prototype using a do-nothing constructor
		var xtor;
		//override constructor name given in common debuggers
		if (displayName) {
			xtor = eval('1&&function ' + displayName + '(){}');
		}
		else {
			xtor = function() {};
		}
		xtor.prototype = ctor.prototype;

		var instance = new xtor();
		xtor.prototype = null;

		ctor.apply(instance, args);
		return instance;
	};


	return forceNew;

});

define('mout/lang/kindOf',[],function () {

    var _rKind = /^\[object (.*)\]$/,
        _toString = Object.prototype.toString,
        UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     */
    function kindOf(val) {
        if (val === null) {
            return 'Null';
        } else if (val === UNDEF) {
            return 'Undefined';
        } else {
            return _rKind.exec( _toString.call(val) )[1];
        }
    }
    return kindOf;
});

define('mout/lang/isKind',['./kindOf'], function (kindOf) {
    /**
     * Check if value is from a specific "kind".
     */
    function isKind(val, kind){
        return kindOf(val) === kind;
    }
    return isKind;
});

define('mout/lang/isArray',['./isKind'], function (isKind) {
    /**
     */
    var isArray = Array.isArray || function (val) {
        return isKind(val, 'Array');
    };
    return isArray;
});

define('mout/lang/toArray',['./kindOf'], function (kindOf) {

    var _win = this;

    /**
     * Convert array-like object into array
     */
    function toArray(val){
        var ret = [],
            kind = kindOf(val),
            n;

        if (val != null) {
            if ( val.length == null || kind === 'String' || kind === 'Function' || kind === 'RegExp' || val === _win ) {
                //string, regexp, function have .length but user probably just want
                //to wrap value into an array..
                ret[ret.length] = val;
            } else {
                //window returns true on isObject in IE7 and may have length
                //property. `typeof NodeList` returns `function` on Safari so
                //we can't use it (#58)
                n = val.length;
                while (n--) {
                    ret[n] = val[n];
                }
            }
        }
        return ret;
    }
    return toArray;
});

define('mout/function/bind',[],function(){

    function slice(arr, offset){
        return Array.prototype.slice.call(arr, offset || 0);
    }

    /**
     * Return a function that will execute in the given context, optionally adding any additional supplied parameters to the beginning of the arguments collection.
     * @param {Function} fn  Function.
     * @param {object} context   Execution context.
     * @param {rest} args    Arguments (0...n arguments).
     * @return {Function} Wrapped Function.
     */
    function bind(fn, context, args){
        var argsArr = slice(arguments, 2); //curried args
        return function(){
            return fn.apply(context, argsArr.concat(slice(arguments)));
        };
    }

    return bind;
});


define('mout/object/hasOwn',[],function () {

    /**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     return hasOwn;

});

define('mout/object/forIn',[],function () {

    var _hasDontEnumBug,
        _dontEnums;

    function checkDontEnum(){
        _dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

        _hasDontEnumBug = true;

        for (var key in {'toString': null}) {
            _hasDontEnumBug = false;
        }
    }

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forIn(obj, fn, thisObj){
        var key, i = 0;
        // no need to check if argument is a real object that way we can use
        // it for arrays, functions, date, etc.

        //post-pone check till needed
        if (_hasDontEnumBug == null) checkDontEnum();

        for (key in obj) {
            if (exec(fn, obj, key, thisObj) === false) {
                break;
            }
        }

        if (_hasDontEnumBug) {
            while (key = _dontEnums[i++]) {
                // since we aren't using hasOwn check we need to make sure the
                // property was overwritten
                if (obj[key] !== Object.prototype[key]) {
                    if (exec(fn, obj, key, thisObj) === false) {
                        break;
                    }
                }
            }
        }
    }

    function exec(fn, obj, key, thisObj){
        return fn.call(thisObj, obj[key], key, obj);
    }

    return forIn;

});

define('mout/object/forOwn',['./hasOwn', './forIn'], function (hasOwn, forIn) {

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forOwn(obj, fn, thisObj){
        forIn(obj, function(val, key){
            if (hasOwn(obj, key)) {
                return fn.call(thisObj, obj[key], key, obj);
            }
        });
    }

    return forOwn;

});

define('mout/object/mixIn',['./forOwn'], function(forOwn){

    /**
    * Combine properties from all the objects into first one.
    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
    * @param {object} target    Target Object
    * @param {...object} objects    Objects to be combined (0...n objects).
    * @return {object} Target Object.
    */
    function mixIn(target, objects){
        var i = 0,
            n = arguments.length,
            obj;
        while(++i < n){
            obj = arguments[i];
            if (obj != null) {
                forOwn(obj, copyProp, target);
            }
        }
        return target;
    }

    function copyProp(val, key){
        this[key] = val;
    }

    return mixIn;
});

define('isDeferred',[],function() {

	var isDeferred = function(obj) {
		return obj && obj.promise;
	};

	return isDeferred;

});

define('isPromise',[],function() {

	var isPromise = function(obj) {
		return obj && typeof obj.then === 'function';
	};


	return isPromise;

});

define('Promise',['require','mout/object/mixIn'],function(require) {

	var mixin = require('mout/object/mixIn');


	/**
	 * @class
	 * @param {Deferred} deferred
	 */
	var Promise = function(deferred) {
		this._deferred = deferred;
	};


	mixin(Promise.prototype, /** @lends Promise.prototype */ {

		/**
		 * @return {Deferred.State}
		 */
		state: function() {
			return this._deferred._state;
		},

		/**
		 * @param {Function} doneCallback
		 * @param {Function} [failCallback]
		 * @param {Function} [progressCallback]
		 * @return this
		 */
		then: function() {
			this._deferred.then.apply(this._deferred, arguments);
			return this;
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		done: function() {
			this._deferred.done.apply(this._deferred, arguments);
			return this;
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		fail: function() {
			this._deferred.fail.apply(this._deferred, arguments);
			return this;
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		always: function() {
			this._deferred.always.apply(this._deferred, arguments);
			return this;
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		progress: function() {
			this._deferred.progress.apply(this._deferred, arguments);
			return this;
		},


		/**
		 * @param {Function} callback
		 * @return {Promise}
		 */
		pipe: function() {
			return this._deferred.pipe.apply(this._deferred, arguments);
		}

	});


	return Promise;

});

define('Deferred',['require','./forceNew','mout/lang/isArray','mout/lang/toArray','mout/function/bind','mout/object/mixIn','./isDeferred','./isPromise','./Promise'],function(require) {

	var forceNew = require('./forceNew');
	var isArray = require('mout/lang/isArray');
	var toArray = require('mout/lang/toArray');
	var bind = require('mout/function/bind');
	var mixin = require('mout/object/mixIn');
	var isDeferred = require('./isDeferred');
	var isPromise = require('./isPromise');
	var Promise = require('./Promise');


	//apply each callback in `callbacks` with `args`
	var _execute = function(callbacks, args) {
		if (!callbacks) {
			return;
		}

		if (!isArray(callbacks)) {
			callbacks = [callbacks];
		}

		for (var i = 0; i < callbacks.length; i++) {
			callbacks[i].apply(null, args);
		}
	};


	/**
	 * @class
	 */
	var Deferred = function() {
		if (!(this instanceof Deferred)) {
			return forceNew(Deferred, arguments, 'Deferred');
		}

		this._state = Deferred.State.PENDING;
		this._callbacks = {
			done: [],
			fail: [],
			progress: []
		};
		this._closingArguments = [];
		this._promise = new Promise(this);
	};


	mixin(Deferred.prototype, /** @lends Deferred.prototype */ {

		/**
		 * @return {Promise}
		 */
		promise: function() {
			return this._promise;
		},


		/**
		 * @return {Deferred.State}
		 */
		state: function() {
			return this._state;
		},


		/**
		 * @param {...Any} args
		 * @return this
		 */
		resolve: function() {
			if (this._state !== Deferred.State.PENDING) { //already resolved/rejected
				return this;
			}

			this._state = Deferred.State.RESOLVED;
			_execute(this._callbacks.done, arguments);
			this._closingArguments = arguments;
			return this;
		},


		/**
		 * @param {...Any} args
		 * @return this
		 */
		reject: function() {
			if (this._state !== Deferred.State.PENDING) { //already resolved/rejected
				return this;
			}

			this._state = Deferred.State.REJECTED;
			_execute(this._callbacks.fail, arguments);
			this._closingArguments = arguments;
			return this;
		},


		/**
		 * @return this
		 */
		notify: function() {
			if (this._state !== Deferred.State.PENDING) { //already resolved/rejected
				return this;
			}

			_execute(this._callbacks.progress, arguments);
			return this;
		},


		/**
		 * @param {Function} doneCallback
		 * @param {Function} [failCallback]
		 * @param {Function} [progressCallback]
		 * @return this
		 */
		then: function(doneCallback, failCallback, progressCallback) {
			if (this._state === Deferred.State.RESOLVED) {
				_execute(doneCallback, this._closingArguments);
				return this;
			}

			if (this._state === Deferred.State.REJECTED) {
				_execute(failCallback, this._closingArguments);
				return this;
			}

			if (doneCallback) {
				this._callbacks.done.push(doneCallback);
			}

			if (failCallback) {
				this._callbacks.fail.push(failCallback);
			}

			if (progressCallback) {
				this._callbacks.progress.push(progressCallback);
			}

			return this;
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		done: function(callback) {
			return this.then(callback);
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		fail: function(callback) {
			return this.then(undefined, callback);
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		always: function(callback) {
			return this.then(callback, callback);
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		progress: function(callback) {
			return this.then(undefined, undefined, callback);
		},


		/**
		 * @param {Function} callback
		 * @return {Promise}
		 */
		pipe: function(callback) {
			var deferred = new Deferred();

			this
				.fail(bind(deferred.reject, deferred))
				.done(function() {
					var args = toArray(arguments);

					var callbackDeferred = (function() {
						var result = callback.apply(callback, args);
						if (isDeferred(result) || isPromise(result)) {
							return result;
						}
						return new Deferred().resolve(result).promise();
					})();

					callbackDeferred
						.fail(bind(deferred.reject, deferred))
						.done(bind(deferred.resolve, deferred))
						.progress(bind(deferred.notify, deferred));
				})
				.progress(bind(deferred.notify, deferred));

			return deferred.promise();
		}

	});


	/**
	 * @enum {String}
	 * @const
	 */
	Deferred.State = {
		PENDING: "pending",
		RESOLVED: "resolved",
		REJECTED: "rejected"
	};


	return Deferred;

});

define('mout/lang/isFunction',['./isKind'], function (isKind) {
    /**
     */
    function isFunction(val) {
        return isKind(val, 'Function');
    }
    return isFunction;
});

define('anyToDeferred',['require','./Deferred','mout/lang/isFunction','./isDeferred','./isPromise'],function(require) {

	var Deferred = require('./Deferred');
	var isFunction = require('mout/lang/isFunction');
	var isDeferred = require('./isDeferred');
	var isPromise = require('./isPromise');


	var anyToDeferred = function(obj) {
		//any arguments after obj will be passed to obj(), if obj is a function
		var args = Array.prototype.slice.call(arguments, 1);
		if (isDeferred(obj) || isPromise(obj)) {
			return obj;
		}
		else if (isFunction(obj)) {
			var result = obj.apply(obj, args);
			if (isDeferred(result) || isPromise(result)) {
				return result;
			}
			return Deferred().resolve(result).promise();
		}
		else {
			return Deferred().resolve(obj).promise();
		}
	};


	return anyToDeferred;

});

define('mout/collection/make_',[],function(){

    /**
     * internal method used to create other collection modules.
     */
    function makeCollectionMethod(arrMethod, objMethod, defaultReturn) {
        return function(){
            var args = Array.prototype.slice.call(arguments);
            if (args[0] == null) {
                return defaultReturn;
            }
            // array-like is treated as array
            return (typeof args[0].length === 'number')? arrMethod.apply(null, args) : objMethod.apply(null, args);
        };
    }

    return makeCollectionMethod;

});

define('mout/array/forEach',[],function () {

    /**
     * Array forEach
     */
    function forEach(arr, callback, thisObj) {
        if (arr == null) {
            return;
        }
        var i = -1,
            n = arr.length;
        while (++i < n) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if ( callback.call(thisObj, arr[i], i, arr) === false ) {
                break;
            }
        }
    }

    return forEach;

});

define('mout/collection/forEach',['./make_', '../array/forEach', '../object/forOwn'], function (make, arrForEach, objForEach) {

    /**
     */
    return make(arrForEach, objForEach);

});

define('mout/object/size',['./forOwn'], function (forOwn) {

    /**
     * Get object size
     */
    function size(obj) {
        var count = 0;
        forOwn(obj, function(){
            count++;
        });
        return count;
    }

    return size;

});

define('mout/collection/size',['../lang/isArray', '../object/size'], function (isArray, objSize) {

    /**
     * Get collection size
     */
    function size(list) {
        if (!list) {
            return 0;
        }
        if (isArray(list)) {
            return list.length;
        }
        return objSize(list);
    }

    return size;

});

define('forEach',['require','./Deferred','mout/collection/forEach','mout/collection/size','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var each = require('mout/collection/forEach');
	var size = require('mout/collection/size');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Invoke `iterator` once for each function in `list`
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var forEach = function(list, iterator) {

		var superDeferred = new Deferred();

		if (!size(list)) {
			superDeferred.resolve();
			return superDeferred.promise();
		}

		var completed = 0;
		each(list, function(item, key) {
			anyToDeferred(iterator(item, key, list))
				.then(
					function() {
						completed++;
						if (completed === size(list)) {
							superDeferred.resolve();
						}
					},
					function() {
						superDeferred.reject.apply(superDeferred, arguments);
					}
				);
		});

		return superDeferred.promise();

	};


	return forEach;

});

define('every',['require','./Deferred','./forEach','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Returns `true` if all values in `list` pass `iterator` truth test
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var every = function(list, iterator) {

		var superDeferred = new Deferred();

		forEach(list, function(item, i, list) {
			return anyToDeferred(iterator(item, i, list))
				.then(function(result) {
					if (result !== true) {
						superDeferred.resolve(false);
					}
				});
		}).then(
			function() {
				superDeferred.resolve(true);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return every;

});

define('mout/lang/isObject',['./isKind'], function (isKind) {
    /**
     */
    function isObject(val) {
        return isKind(val, 'Object');
    }
    return isObject;
});

define('mout/object/values',['./forOwn'], function (forOwn) {

    /**
     * Get object values
     */
    function values(obj) {
        var vals = [];
        forOwn(obj, function(val, key){
            vals.push(val);
        });
        return vals;
    }

    return values;

});

define('mout/array/map',['./forEach'], function (forEach) {

    /**
     * Array map
     */
    function map(arr, callback, thisObj) {
        var results = [];
        if (arr == null){
            return results;
        }
        forEach(arr, function (val, i, arr) {
            results[i] = callback.call(thisObj, val, i, arr);
        });
        return results;
    }

     return map;
});

define('mout/collection/map',['../lang/isObject', '../object/values', '../array/map'], function (isObject, values, arrMap) {

    /**
     * Map collection values, returns Array.
     */
    function map(list, callback, thisObj) {
        // list.length to check array-like object, if not array-like
        // we simply map all the object values
        if( isObject(list) && list.length == null ){
            list = values(list);
        }
        return arrMap(list, function (val, key, list) {
            return callback.call(thisObj, val, key, list);
        });
    }

    return map;

});

define('mout/collection/pluck',['./map'], function (map) {

    /**
     * Extract a list of property values.
     */
    function pluck(list, key) {
        return map(list, function(value) {
            return value[key];
        });
    }

    return pluck;

});

define('filter',['require','./Deferred','mout/collection/map','mout/collection/pluck','./forEach','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var map = require('mout/collection/map');
	var pluck = require('mout/collection/pluck');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Returns an array of all values in `list` which pass `iterator` truth
	 * test
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var filter = function(list, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		list = map(list, function(val, i) {
			return {
				index: i,
				value: val
			};
		});

		forEach(list, function(item) {
			return anyToDeferred(iterator(item.value, item.index, list))
				.then(function(result) {
					if (result === true) {
						results.push(item);
					}
				});
		}).then(
			function() {
				results = results.sort(function(a, b) {
					return a.index - b.index;
				});
				results = pluck(results, 'value');
				superDeferred.resolve(results);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return filter;

});

define('mout/object/keys',['./forOwn'], function (forOwn) {

    /**
     * Get object keys
     */
     var keys = Object.keys || function (obj) {
            var keys = [];
            forOwn(obj, function(val, key){
                keys.push(key);
            });
            return keys;
        };

    return keys;

});

define('forEachSeries',['require','./Deferred','mout/lang/isArray','mout/collection/size','mout/object/keys','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var isArray = require('mout/lang/isArray');
	var size = require('mout/collection/size');
	var objectKeys = require('mout/object/keys');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Version of forEach which is guaranteed to execute passed functions in
	 * order.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var forEachSeries = function(list, iterator) {

		var superDeferred = new Deferred();

		if (!size(list)) {
			superDeferred.resolve();
			return superDeferred.promise();
		}

		var completed = 0;
		var keys;
		if (!isArray(list)) {
			keys = objectKeys(list);
		}

		var iterate = function() {
			var item;
			var key;

			if (isArray(list)) {
				key = completed;
				item = list[key];
			}
			else {
				key = keys[completed];
				item = list[key];
			}

			anyToDeferred(iterator(item, key))
				.then(
					function() {
						completed += 1;
						if (completed === size(list)) {
							superDeferred.resolve();
						}
						else {
							iterate();
						}
					},
					function() {
						superDeferred.reject.apply(superDeferred, arguments);
					}
				);
		};
		iterate();

		return superDeferred.promise();

	};


	return forEachSeries;

});

define('filterSeries',['require','./Deferred','mout/collection/map','mout/collection/pluck','./forEachSeries','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var map = require('mout/collection/map');
	var pluck = require('mout/collection/pluck');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Version of filter which is guaranteed to process items in order
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var filterSeries = function(list, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		list = map(list, function(val, i) {
			return {index: i, value: val};
		});

		forEachSeries(list, function(item) {
			return anyToDeferred(iterator(item.value, item.index, list))
				.then(function(result) {
					if (result === true) {
						results.push(item);
					}
				});
		}).then(
			function() {
				results = results.sort(function(a, b) {
					return a.index - b.index;
				});
				results = pluck(results, 'value');
				superDeferred.resolve(results);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return filterSeries;

});

define('find',['require','./Deferred','./forEach','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Returns the first value in `list` matching the `iterator` truth test
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var find = function(list, iterator) {

		var superDeferred = new Deferred();

		forEach(list, function(item, i) {
			return anyToDeferred(iterator(item, i, list))
				.then(function(result) {
					if (result) {
						superDeferred.resolve(item);
					}
				});
		}).then(
			function() {
				superDeferred.resolve(undefined);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return find;

});

define('findSeries',['require','./Deferred','./forEachSeries','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Version of find which is guaranteed to process items in order
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var findSeries = function(list, iterator) {

		var superDeferred = new Deferred();

		forEachSeries(list, function(item, i) {
			return anyToDeferred(iterator(item, i, list))
				.then(function(result) {
					if (result) {
						superDeferred.resolve(item);
					}
				});
		}).then(
			function() {
				superDeferred.resolve(undefined);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return findSeries;

});

define('map',['require','./Deferred','mout/collection/map','./forEach','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var cmap = require('mout/collection/map');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Produces a new Array by mapping each item in `list` through the
	 * transformation function `iterator`.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var map = function(list, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		list = cmap(list, function (val, i) {
			return {index: i, value: val};
		});

		forEach(list, function(item) {
			return anyToDeferred(iterator(item.value, item.index, list))
				.then(function(transformed) {
					results[item.index] = transformed;
				});
		}).then(
			function() {
				superDeferred.resolve(results);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return map;

});

define('mapSeries',['require','./Deferred','mout/collection/map','./forEachSeries','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var cmap = require('mout/collection/map');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Version of map which is guaranteed to process items in order
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var mapSeries = function(list, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		list = cmap(list, function (val, i) {
			return {index: i, value: val};
		});

		forEachSeries(list, function(item) {
			return anyToDeferred(iterator(item.value, item.index, list))
				.then(
					function(transformed) {
						results[item.index] = transformed;
					},
					function(err) {
						results[item.index] = err;
					}
				);
		}).then(
			function() {
				superDeferred.resolve(results);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return mapSeries;

});

define('parallel',['require','./Deferred','mout/lang/isArray','mout/lang/toArray','./anyToDeferred','./forEach','./map'],function(require) {

	var Deferred = require('./Deferred');
	var isArray = require('mout/lang/isArray');
	var toArray = require('mout/lang/toArray');
	var anyToDeferred = require('./anyToDeferred');
	var forEach = require('./forEach');
	var map = require('./map');


	/**
	 * Executes all passed Functions in parallel.
	 * @param {Any} tasks
	 * @return {Promise}
	 */
	var parallel = function(tasks) {

		var superDeferred = new Deferred();

		var isArguments = false;
		if (arguments.length > 1) {
			isArguments = true;
			tasks = toArray(arguments);
		}

		if (isArray(tasks)) {
			map(tasks, function(task) {
				return anyToDeferred(task);
			}).then(
				function(results) {
					if (isArguments) {
						superDeferred.resolve.apply(superDeferred, results);
					}
					else {
						superDeferred.resolve(results);
					}
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		}
		else {
			var results = {};
			forEach(tasks, function(task, key) {
				var deferred = anyToDeferred(task);
				return deferred.then(function(result) {
					results[key] = result;
				});
			}).then(
				function() {
					superDeferred.resolve(results);
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		}

		return superDeferred.promise();

	};


	return parallel;

});

define('mout/function/partial',[],function () {

    function slice(arr, offset){
        return Array.prototype.slice.call(arr, offset || 0);
    }

    /**
     * Creates a partially applied function.
     */
    function partial(fn, var_args){
        var argsArr = slice(arguments, 1); //curried args
        return function(){
            return fn.apply(this, argsArr.concat(slice(arguments)));
        };
    }

    return partial;

});

define('pipe',['require','./Deferred','mout/lang/isArray','mout/lang/toArray','mout/function/partial','./anyToDeferred','mout/object/keys','mout/collection/size'],function(require) {

	var Deferred = require('./Deferred');
	var isArray = require('mout/lang/isArray');
	var toArray = require('mout/lang/toArray');
	var partial = require('mout/function/partial');
	var anyToDeferred = require('./anyToDeferred');
	var objkeys = require('mout/object/keys');
	var size = require('mout/collection/size');


	/**
	 * Executes all passed Functions one at a time, each time passing the
	 * result to the next function in the chain.
	 * @param {Any} tasks
	 * @return {Promise}
	 */
	var pipe = function(tasks) {

		var superDeferred = new Deferred();

		if (arguments.length > 1) {
			tasks = toArray(arguments);
		}

		if (!size(tasks)) {
			superDeferred.reject();
			return superDeferred;
		}

		var completed = 0;
		var keys;
		if (!isArray(tasks)) {
			keys = objkeys(tasks);
		}

		var iterate = function() {
			var task;
			var key;

			if (isArray(tasks)) {
				key = completed;
				task = tasks[key];
			}
			else {
				key = keys[completed];
				task = tasks[key];
			}

			var args = toArray(arguments);
			args.unshift(task);
			anyToDeferred( partial.apply(task, args) ).then(
				function() {
					completed += 1;
					if (completed === size(tasks)) {
						superDeferred.resolve.apply(superDeferred, arguments);
					}
					else {
						iterate.apply(superDeferred, arguments);
					}
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		};

		iterate();

		return superDeferred.promise();

	};


	return pipe;

});

define('reduce',['require','./Deferred','./forEachSeries','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Boils a `list` of values into a single value.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @param {Any} memo
	 * @return {Promise}
	 */
	var reduce = function(list, iterator, memo) {

		var superDeferred = new Deferred();

		forEachSeries(list, function(item, key) {
			return anyToDeferred(iterator(memo, item, key, list))
				.then(function(result) {
					memo = result;
				});
		}).then(
			function() {
				superDeferred.resolve(memo);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return reduce;

});

define('reduceRight',['require','./reduce','mout/collection/map','mout/collection/pluck'],function(require) {

	var reduce = require('./reduce');
	var map = require('mout/collection/map');
	var pluck = require('mout/collection/pluck');


	/**
	 * Right-associative version of reduce; eqivalent to reversing a list and
	 * then running reduce on it.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @param {Any} memo
	 * @return {Promise}
	 */
	var reduceRight = function(list, iterator, memo) {
		var reversed = map(list, function(val, i) {
			return {index: i, value: val};
		}).reverse();
		reversed = pluck(reversed, 'value');
		return reduce(reversed, iterator, memo);
	};


	return reduceRight;

});

define('reject',['require','./Deferred','mout/collection/map','mout/collection/pluck','./forEach','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var map = require('mout/collection/map');
	var pluck = require('mout/collection/pluck');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Returns an array of all values in `list` without ones which the
	 * `iterator` truth test passes. Inverse of filter.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var reject = function(list, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		list = map(list, function(val, i) {
			return {index: i, value: val};
		});

		forEach(list, function(item) {
			return anyToDeferred(iterator(item.value, item.index, list))
				.then(function(result) {
					if (!result) {
						results.push(item);
					}
				});
		}).then(
			function() {
				results = results.sort(function(a, b) {
					return a.index - b.index;
				});
				results = pluck(results, 'value');
				superDeferred.resolve(results);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return reject;

});

define('rejectSeries',['require','./Deferred','mout/collection/map','mout/collection/pluck','./forEachSeries','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var map = require('mout/collection/map');
	var pluck = require('mout/collection/pluck');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Version of reject which is guaranteed to process items in order.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var rejectSeries = function(list, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		list = map(list, function(val, i) {
			return {index: i, value: val};
		});

		forEachSeries(list, function (item) {
			return anyToDeferred(iterator(item.value, item.index))
				.then(function(result) {
					if (!result) {
						results.push(item);
					}
				});
		}).then(
			function() {
				results = results.sort(function(a, b) {
					return a.index - b.index;
				});
				results = pluck(results, 'value');
				superDeferred.resolve(results);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return rejectSeries;

});

define('series',['require','./Deferred','mout/lang/isArray','mout/lang/toArray','./anyToDeferred','./forEachSeries','./mapSeries'],function(require) {

	var Deferred = require('./Deferred');
	var isArray = require('mout/lang/isArray');
	var toArray = require('mout/lang/toArray');
	var anyToDeferred = require('./anyToDeferred');
	var forEachSeries = require('./forEachSeries');
	var mapSeries = require('./mapSeries');


	/**
	 * Executes all passed Functions one at a time.
	 * @param {Any} tasks
	 * @return {Promise}
	 */
	var series = function(tasks) {

		var superDeferred = new Deferred();

		var isArguments = false;
		if (arguments.length > 1) {
			isArguments = true;
			tasks = toArray(arguments);
		}

		if (isArray(tasks)) {
			mapSeries(tasks, function(task) {
				return anyToDeferred(task);
			}).then(
				function(results) {
					if (isArguments) {
						superDeferred.resolve.apply(superDeferred, results);
					}
					else {
						superDeferred.resolve(results);
					}
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		}
		else {
			var results = {};
			forEachSeries(tasks, function(task, key) {
				var deferred = anyToDeferred(task);
				return deferred.then(function(result) {
					results[key] = result;
				});
			}).then(
				function() {
					superDeferred.resolve(results);
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		}

		return superDeferred.promise();

	};


	return series;

});

define('some',['require','./Deferred','./forEach','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Returns `true` if any values in `list` pass `iterator` truth test
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var some = function(list, iterator) {

		var superDeferred = new Deferred();

		forEach(list, function(item, i) {
			return anyToDeferred(iterator(item, i, list))
				.then(function(result) {
					if (result) {
						superDeferred.resolve(true);
					}
				});
		}).then(
			function() {
				superDeferred.resolve(false);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return some;

});

define('sortBy',['require','./Deferred','./map','mout/collection/pluck','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var map = require('./map');
	var pluck = require('mout/collection/pluck');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Produces a sorted copy of `list`, ranked by the results of running each
	 * item through `iterator`
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var sortBy = function(list, iterator) {

		var superDeferred = new Deferred();

		map(list, function(item, i) {

			var deferred = new Deferred();
			anyToDeferred(iterator(item, i, list))
				.then(function(criteria) {
					deferred.resolve({
						index: i,
						value: item,
						criteria: criteria
					});
				});
			return deferred.promise();

		}).then(
			function(result) {
				result = result.sort(function(left, right) {
					var a = left.criteria;
					var b = right.criteria;

					if (a !== b) {
						if (a > b || a === undefined) {
							return 1;
						}
						if (a < b || b === undefined) {
							return -1;
						}
					}

					if (left.index < right.index) {
						return -1;
					}

					return 1;
				});

				result = pluck(result, 'value');
				superDeferred.resolve(result);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return sortBy;

});

define('until',['require','./Deferred','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Repeatedly runs `iterator` until the result of `test` is true.
	 * @param {Function} test
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var until = function(test, iterator) {

		var superDeferred = new Deferred();

		var runTest = function(test, iterator) {
			anyToDeferred(test()).then(
				function(result) {
					if (result) {
						superDeferred.resolve();
					}
					else {
						runIterator(test, iterator);
					}
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		};

		var runIterator = function(test, iterator) {
			anyToDeferred(iterator()).then(
				function() {
					runTest(test, iterator);
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		};

		runTest(test, iterator);

		return superDeferred.promise();

	};


	return until;

});

define('whilst',['require','./Deferred','./anyToDeferred'],function(require) {

	var Deferred = require('./Deferred');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Repeatedly runs `iterator` until the result of `test` is false.
	 * @param {Function} test
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var whilst = function(test, iterator) {

		var superDeferred = new Deferred();

		var runTest = function(test, iterator) {
			anyToDeferred(test()).then(
				function(result) {
					if (result) {
						runIterator(test, iterator);
					}
					else {
						superDeferred.resolve();
					}
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		};

		var runIterator = function(test, iterator) {
			anyToDeferred(iterator()).then(
				function() {
					runTest(test, iterator);
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		};

		runTest(test, iterator);

		return superDeferred.promise();

	};


	return whilst;

});

define('Deferreds',['require','./anyToDeferred','./every','./filter','./filterSeries','./find','./findSeries','./forceNew','./forEach','./forEachSeries','./isDeferred','./isPromise','./map','./mapSeries','./parallel','./pipe','./reduce','./reduceRight','./reject','./rejectSeries','./series','./some','./sortBy','./until','./whilst'],function(require) {

	/** @namespace */
	var Deferreds = {
		'anyToDeferred': require('./anyToDeferred'),
		'every': require('./every'),
		'filter': require('./filter'),
		'filterSeries': require('./filterSeries'),
		'find': require('./find'),
		'findSeries': require('./findSeries'),
		'forceNew': require('./forceNew'),
		'forEach': require('./forEach'),
		'forEachSeries': require('./forEachSeries'),
		'isDeferred': require('./isDeferred'),
		'isPromise': require('./isPromise'),
		'map': require('./map'),
		'mapSeries': require('./mapSeries'),
		'parallel': require('./parallel'),
		'pipe': require('./pipe'),
		'reduce': require('./reduce'),
		'reduceRight': require('./reduceRight'),
		'reject': require('./reject'),
		'rejectSeries': require('./rejectSeries'),
		'series': require('./series'),
		'some': require('./some'),
		'sortBy': require('./sortBy'),
		'until': require('./until'),
		'whilst': require('./whilst')
	};


	return Deferreds;

});

define('Chainable',['require','./forceNew','./anyToDeferred','./Deferred','./Promise','./Deferreds','mout/array/forEach','mout/lang/toArray','mout/function/bind','mout/object/keys'],function(require) {

	var forceNew = require('./forceNew');
	var anyToDeferred = require('./anyToDeferred');
	var Deferred = require('./Deferred');
	var Promise = require('./Promise');
	var Deferreds = require('./Deferreds');
	var forEach = require('mout/array/forEach');
	var toArray = require('mout/lang/toArray');
	var bind = require('mout/function/bind');
	var keys = require('mout/object/keys');


	var _inherits = function(childCtor, parentCtor) {
		var tempCtor = function() {};
		tempCtor.prototype = parentCtor.prototype;
		childCtor.prototype = new tempCtor();
		childCtor.prototype.constructor = childCtor;
	};


	/**
	 * @class
	 * @extends {Deferred}
	 * @param {Any} [wrapped]
	 */
	var Chainable = function(value) {
		if (!(this instanceof Chainable)) {
			return forceNew(Chainable, arguments, 'Chainable');
		}

		this._state = Deferred.State.PENDING;
		this._callbacks = {
			done: [],
			fail: [],
			progress: []
		};
		this._closingArguments = [];
		this._promise = new Promise(this);

		//special: pass "undefined" for internal use in pipe().
		//this prevents resolve() from being called until pipe() has resolved.
		if (arguments.length === 1 && value === undefined) {
			return this;
		}

		anyToDeferred(value).then(bind(function() {
			if (arguments.length) {
				this.resolve.apply(this, arguments);
			}
			else {
				this.resolve();
			}
		}, this));
	};


	_inherits(Chainable, Deferred);


	/**
	 * @override
	 * @return {Chainable}
	 */
	Chainable.prototype.pipe = function(callback) {
		var chain = new Chainable(undefined);
		Deferred.prototype.pipe.call(this, callback).then(function() {
			chain.resolve.apply(chain, arguments);
		});
		return chain;
	};


	var chained = keys(Deferreds).filter(function(key) {
		return key !== 'pipe';
	});


	forEach(chained, function(key) {
		Chainable.prototype[key] = function() {
			var args = toArray(arguments);

			return this.pipe(function(prev) {
				if (prev !== undefined) {
					args.unshift(prev);
				}
				return Deferreds[key].apply(undefined, args);
			});
		};
	});


	/**
	 * @name Deferreds.chain
	 * @method
	 * @param {Any} [wrapped]
	 * @return {Chainable}
	 */
	Deferreds.chain = Chainable;


	return Chainable;


	/**
	 * @name Chainable#every
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#filter
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#filterSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#find
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#findSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#forEach
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#forEachSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#map
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#mapSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#parallel
	 * @method
	 * @param {Any} tasks
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#reduce
	 * @method
	 * @param {Function} iterator
	 * @param {Any} memo
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#reduceRight
	 * @method
	 * @param {Function} iterator
	 * @param {Any} memo
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#reject
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#rejectSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#series
	 * @method
	 * @param {Any} tasks
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#some
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#sortBy
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#pipe
	 * @method
	 * @param {Any} tasks
	 * @return {Chainable}
	 */


});


/*
-----------------------------------------
Global definitions for a built project
-----------------------------------------
*/

return {
	"forceNew": require("forceNew"),
	"mout/lang/kindOf": require("mout/lang/kindOf"),
	"mout/lang/isKind": require("mout/lang/isKind"),
	"mout/lang/isArray": require("mout/lang/isArray"),
	"mout/lang/toArray": require("mout/lang/toArray"),
	"mout/function/bind": require("mout/function/bind"),
	"mout/object/hasOwn": require("mout/object/hasOwn"),
	"mout/object/forIn": require("mout/object/forIn"),
	"mout/object/forOwn": require("mout/object/forOwn"),
	"mout/object/mixIn": require("mout/object/mixIn"),
	"isDeferred": require("isDeferred"),
	"isPromise": require("isPromise"),
	"Promise": require("Promise"),
	"Deferred": require("Deferred"),
	"mout/lang/isFunction": require("mout/lang/isFunction"),
	"anyToDeferred": require("anyToDeferred"),
	"mout/collection/make_": require("mout/collection/make_"),
	"mout/array/forEach": require("mout/array/forEach"),
	"mout/collection/forEach": require("mout/collection/forEach"),
	"mout/object/size": require("mout/object/size"),
	"mout/collection/size": require("mout/collection/size"),
	"forEach": require("forEach"),
	"every": require("every"),
	"mout/lang/isObject": require("mout/lang/isObject"),
	"mout/object/values": require("mout/object/values"),
	"mout/array/map": require("mout/array/map"),
	"mout/collection/map": require("mout/collection/map"),
	"mout/collection/pluck": require("mout/collection/pluck"),
	"filter": require("filter"),
	"mout/object/keys": require("mout/object/keys"),
	"forEachSeries": require("forEachSeries"),
	"filterSeries": require("filterSeries"),
	"find": require("find"),
	"findSeries": require("findSeries"),
	"map": require("map"),
	"mapSeries": require("mapSeries"),
	"parallel": require("parallel"),
	"mout/function/partial": require("mout/function/partial"),
	"pipe": require("pipe"),
	"reduce": require("reduce"),
	"reduceRight": require("reduceRight"),
	"reject": require("reject"),
	"rejectSeries": require("rejectSeries"),
	"series": require("series"),
	"some": require("some"),
	"sortBy": require("sortBy"),
	"until": require("until"),
	"whilst": require("whilst"),
	"Deferreds": require("Deferreds"),
	"Chainable": require("Chainable")
};


})();