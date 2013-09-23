A {Deferred} object is a flexible way of registering an arbitrary number of
callbacks which can continue to be registered and invoked after the original
callback dispatch ({Deferred#resolve} or {Deferred#reject}) has occurred. The
spec is known as [CommonJS
Promises/A](http://wiki.commonjs.org/wiki/Promises/A). Deferreds.js'
implementation also provides several extensions present in [jQuery's Deferred
object spec](http://api.jquery.com/category/deferred-object/) such as
{Deferred#done} and {Deferred#fail}. An example:

```js
//let's make a function which retrieves a list of users from
//a server asynchronously using AJAX.

//the callback approach
var getUsers = function(callback) {
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		//in callback-centered style, the first argument to
		//a callback is often an error argument (which is
		//null if there is no error)
		if (request.status === 200) {
			callback(null, JSON.parse(request.responseText));
		}
		else {
			callback('There was a problem with the request.');
		}
	};

    request.open('GET', '/users');
    request.send();
};

getUsers(function(err, users) {
	if (err) {
		console.error(err);
		return;
	}

	users.forEach(function(user) {
		//...
	});
});


//the Deferred object approach
var getUsers = function() {
	var defer = new Deferred();
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		//Deferreds have separate callback mechanisms for
		//the notions of success and failure
		if (request.status === 200) {
			defer.resolve(JSON.parse(request.responseText));
		}
		else {
			defer.reject('There was a problem with the request.');
		}
	};

    request.open('GET', '/users');
    request.send();

	//returning just `defer` would work fine, but would
	//allow consumers of this function to call `resolve` or
	//`reject` on it
	return defer.promise();
};

getUsers()
	.fail(function(err) {
		console.error(err);
	})
	//callback methods are chainable
	.then(function(users) {
		users.forEach(function(user) {
			//...
		});
	})
	//multiple callbacks of the same type (then/success,
	//fail/failure) can be added
	.then(function(users) {
		//...
	});
```


### States

There are three states a {Deferred} object can have: "pending" (the starting
state), "resolved" (indicating success), and "rejected" (indicating failure).
{Deferred#resolve} and {Deferred#reject} are used to change the state. A
{Deferred} object is only allowed to change state once, so multiple calls to
{Deferred#resolve} or {Deferred#reject} will have no effect after the first
call. Note that {Deferred#notify} does not change state. It may be called as
many times as desired in order to immediately invoke all `progressCallbacks`.


### Callbacks

There are three types of callbacks which can be registered on a {Deferred}
object: `doneCallbacks`, `failCallbacks`, and `progressCallbacks`. All three of
these are registered through {Deferred#then} and added to a first-in first-out
queue. {Deferred#done} (add a `doneCallback`), {Deferred#fail} (add a
`failCallback`), {Deferred#progress} (add a `progressCallback`), and
{Deferred#always} (add the same callback as a `doneCallback` and
`failCallback`) merely forward calls to {Deferred#then}.

Callbacks are first invoked when the {Deferred}'s state is changed, and then
immediately upon registration thereafter. Changing state to "resolved" will
invoke all `doneCallbacks`, while changing state to "rejected" will invoke all
`failCallbacks`. After a state change to "resolved", all `doneCallbacks` added
will be invoked immediately as they're added and with the same arguments first
passed to {Deferred#resolve}. Other types of callbacks will be ignored.
Similarly, after a state changed to "rejected", all `failCallbacks` added will
be invoked immediately as they're added and other types of callbacks will be
ignored.




## promise

Return a {Promise} object, which is an object containing a restricted set of
methods, all of which delegate to this {Deferred}. You will normally want
return this {Promise} object instead of the {Deferred} in order to guarantee
that downstream code cannot alter the {Deferred}'s state. See {Promise} for
more information.




## state

Returns the {Deferred.State} of this Deferred object.




## resolve

Mark the {Deferred.State} as "resolved" and call any `doneCallbacks`.




## reject

Mark the {Deferred.State} as "rejected" and call any `failCallbacks`.




## notify

As long as the Deferred has not been resolved or rejected, call any
`progressCallbacks`.




## then

Add a `doneCallback`, `failCallback`, and/or a `progressCallback` to the
{Deferred} object's queues.




## done

Add a `doneCallback` to the {Deferred} object's queue. Equivalent to calling
`then(callback);`




## fail

Add a `failCallback` to the {Deferred} object's queue. Equivalent to calling
`then(null, callback);`




## always

Add a callback to both the `doneCallback` and `failCallback` queue. Equivalent
to calling `then(callback, callback);`




## progress

Add a `progressCallback` to the {Deferred} object's queue. Equivalent to
calling `then(null, null, callback);`




## pipe

Chains functions in series, each one waiting for the {Deferred} object returned
from the previous function to resolve. This is done by passing the result of a
resolved {Deferred} object through the given `callback`, returning the
{Promise} object of a **new** {Deferred} object. The new {Deferred} object is
either returned from `callback` or constructed as an immediately-resolved
{Deferred} object from the return value of `callback`.

{Deferred#pipe} is mostly used in situations where multiple steps exist, each
step depending on the result of the last. Normally each step would be nested
one level deeper than the last, or an intermediary {Deferred} object would be
used at each step to redirect the output. Here's what that looks like:

```js
var step1 = function() {
	var deferred = new Deferred();
	setTimeout(function(){
		deferred.resolve([1, 2, 3, 4, 5]);
	}, 10);
	return deferred.promise();
};

var step3 = function(val) {
	alert('Maximum value: ' + val);
};


//without pipe
//------------

//use an intermediary Deferred object
var defer = new Deferred();
step1().then(function(list) {
	defer.resolve(Math.max(list));
});
defer.then(step3);


//with pipe
//---------

step1().pipe(function(list) {
	//values returned from "pipe" are converted to resolved
	//Deferred objects
	return Math.max(list);
}).then(step3);
```

In a nutshell, {Deferred#pipe} maintains chainability. In fact, it's the heart
of the {Chainable} class. See {Chainable}'s overview for a longer example of
what chained functions look like with and without {Deferred#pipe}.
