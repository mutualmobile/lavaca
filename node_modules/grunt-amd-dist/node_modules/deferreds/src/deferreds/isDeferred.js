define(function() {

	var isDeferred = function(obj) {
		return obj && obj.promise;
	};

	return isDeferred;

});
