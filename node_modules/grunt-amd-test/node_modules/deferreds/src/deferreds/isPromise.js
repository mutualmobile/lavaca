define(function() {

	var isPromise = function(obj) {
		return obj && typeof obj.then === 'function';
	};


	return isPromise;

});
