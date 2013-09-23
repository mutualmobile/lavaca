define(function(require) {

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
