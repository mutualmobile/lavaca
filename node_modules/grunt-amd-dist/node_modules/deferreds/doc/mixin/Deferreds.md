{Deferreds} is a static collection of higher-order functions which operate on
Deferred objects. These functions fall into one of two categories: *Collection*
functions and *Control Flow* functions. They can be further split into
functions which operate on inputs in *parallel* and ones which operate in
*series*.


### Collection

#### Parallel

* {Deferreds.every}
* {Deferreds.filter}
* {Deferreds.find}
* {Deferreds.forEach}
* {Deferreds.map}
* {Deferreds.reject}
* {Deferreds.some}

#### Series

* {Deferreds.filterSeries}
* {Deferreds.findSeries}
* {Deferreds.forEachSeries}
* {Deferreds.mapSeries}
* {Deferreds.reduce}
* {Deferreds.reduceRight}
* {Deferreds.rejectSeries}


### Control Flow

* {Deferreds.until}
* {Deferreds.whilst}

#### Parallel

* {Deferreds.parallel}

#### Series

* {Deferreds.series}
* {Deferreds.pipe}


In most methods, `iterator` is expected to be an asynchronous method which
returns a {Deferred} or {Promise} object. This is not a requirement, but you
**are** using this library to work with asynchronous code, right? Good. All
methods return a {Promise} object referencing a "master" {Deferred} object
which will resolve with a value which would normally be returned in common
higher-order function libraries. {Deferreds}' methods can all accept
asynchronous functions, so the final result is not always known at return time.
Therefore we supply output within the resolved values of {Deferred} objects
rather than returning them.


#### Parallel Methods

**Parallel** methods will call `iterator` for all items in the `list` in
parallel, not guaranteeing the order in which items are processed. They return
a {Promise} referencing a "master" {Deferred} object which will be resolved
when all {Deferred} objects returned from `iterator` (or the {Deferred} objects
referenced from the {Promise} objects returned from `iterator`) are resolved.
If any {Deferred} object referenced in `iterator` is rejected, the "master"
{Deferred} object will immediately be rejected. However, because `iterator` was
initially called for all items in parallel, those calls will continue to run
(by necessity, not by design) in the background.


#### Series Methods

**Series** methods will call `iterator` for each item in the `list`
one-at-a-time, each time waiting for the {Deferred} object returned from
`iterator` (or referenced from the {Promise} object returned from `iterator`)
to resolve. If `list` is an {Array}, order of iteration is guaranteed. They
return a {Promise} object referencing a "master" {Deferred} object which will
be resolved when the {Deferred} object returned from the last call to
`iterator` (or the {Deferred} object referenced from the {Promise} object
returned from the last call to `iterator`) is resolved.  If any {Deferred}
object returned from `iterator` is rejected, series methods will fail fast,
skipping any remaining items and rejecting the "master" {Deferred} object.


#### Failing Fast

All methods will cease processing and immediately reject their returned
{Deferred} object if any `iterator` (for collection functions) or `task` (for
flow control functions) evaluates to a {Deferred} object which is rejected.
This is especially useful for *series* methods because they process in order,
making skipping further processing possible when failing fast.




## chain

Convenience method to create a new {Chainable} object, starting a new chain
with the value of `wrapped` to be passed to the next function in the chain.




## forEach

Invoke `iterator` once for each item in `list`. `iterator` is called on all
items within `list` in parallel, so there is no guarantee that the items will
be processed in order.

`iterator` has the signature:

`function(element, index, list)` if `list` is an {Array}  
`function(value, key, list)` if `list` is an {Object}

* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:** {void}, to indicate that the current iteration is finished

The returned {Promise} object resolves when `iterator` has resolved for every
item in the `list`.

**Resolves:** {void}

```js
forEach([1, 3, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		args.push(num);
		deferred.resolve();
	}, num * 10);
	return deferred.promise();
}).then(function() {
	//timeouts were 10ms for 1, 20ms for 2, and 30ms for 3
	console.log(args); //> [1, 2, 3]
});
```




## forEachSeries

Invoke `iterator` once for each item in `list`. `iterator` is called on each
item in the list in order, waiting for the {Deferred} object returned from
`iterator` (or referenced from the {Promise} object returned from `iterator`)
to resolve before proceeding.

`iterator` has the following signature:

`function(element, index, list)` if `list` is an {Array}  
`function(value, key, list)` if `list` is an {Object}

* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:** {void}, to indicate that the current iteration is finished

The returned {Promise} object resolves when `iterator` has resolved for every
item in the `list`.

**Resolves:** {void}

```js
forEachSeries([1, 3, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		args.push(num);
		deferred.resolve();
	}, num * 10);
	return deferred.promise();
}).then(function() {
	console.log(args); //> [1, 3, 2]
});
```




## every

Determines whether all values in `list` pass the truth test provided by
`iterator`. `iterator` is called on all items within `list` in parallel, so
there is no guarantee that the items will be processed in order.

`iterator` has the following signature:

`function(element, index, list)` if `list` is an {Array}  
`function(value, key, list)` if `list` is an {Object}

* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:**
  [Truthy/Falsy](http://www.sitepoint.com/javascript-truthy-falsy/) value
  indicating whether current item passes

The returned {Promise} object can resolve:

* `false` - the first time `iterator` has resolved `false` for any item in `list`, **or**
* `true` - when `iterator` has resolved `true` for every item in `list`

**Resolves:** {Boolean} value indicating whether or not every item in
`list` passed `iterator`'s test

```js
every([1,2,3], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		deferred.resolve(num === 1 || num === 2 || num === 3);
	}, 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> true
});
```




## filter

Builds an {Array} containing all values in `list` which pass the truth test
provided by `iterator`. `iterator` is called on all items within `list` in
parallel, so there is no guarantee that the items will be processed in order.
However, the final list will retain the ordering of the passed `list`.

`iterator` has the following signature:

`function(element, index, list)` if `list` is an {Array}  
`function(value, key, list)` if `list` is an {Object}

* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:**
  [Truthy/Falsy](http://www.sitepoint.com/javascript-truthy-falsy/) value
  indicating whether current item passes

The returned {Promise} object resolves when `iterator` has resolved for every
item in the `list`.

**Resolves:** {Array} value containing all values in `list` which passed
`iterator`'s truth test

```js
var order = [];

filter([3, 1, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		var isOdd = (num % 2 !== 0);
		deferred.resolve(isOdd);
	}, num * 10);
	return deferred.promise();
}).then(function(result) {
	//filter() re-orders the final list to match the index order of the first
	//list
	console.log(result); //> [3, 1]
	console.log(order); //> [1, 2, 3]
});
```




## filterSeries

Builds an {Array} containing all values in `list` which pass the truth test
provided by `iterator`. `iterator` is called on each item in the list in order,
waiting for the {Deferred} object returned from `iterator` (or referenced from
the {Promise} object returned from `iterator`) to resolve before proceeding.

`iterator` has the following signature:

`function(element, index, list)` if `list` is an {Array}  
`function(value, key, list)` if `list` is an {Object}

* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:**
  [Truthy/Falsy](http://www.sitepoint.com/javascript-truthy-falsy/) value
  indicating whether current item passes

The returned {Promise} object resolves when `iterator` has resolved for every
item in the `list`.

**Resolves:** {Array} value containing all values in `list` which passed
`iterator`'s truth test

```js
var order = [];

filterSeries([3, 1, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		var isOdd = (num % 2 !== 0);
		deferred.resolve(isOdd);
	}, num * 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> [3, 1]
	console.log(order); //> [3, 1, 2]
});
```




## find

Determines the first value in `list` for which `iterator` resolves to `true`.
`iterator` is called on all items within `list` in parallel, so there is no
guarantee that the items will be processed in order.

`iterator` has the following signature:

`function(element, index, list)` if `list` is an {Array}  
`function(value, key, list)` if `list` is an {Object}

* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:**
  [Truthy/Falsy](http://www.sitepoint.com/javascript-truthy-falsy/) value
  indicating whether current item passes

The returned {Promise} object can resolve:

* The first time `iterator` resolves to `true` for an item
* When `iterator` has resolved to `false` for every item

**Resolves:**

* {Any} - the first value in `list` which passed `iterator`'s truth test, **or**
* {void} - if no value passed


```js
var order = [];

find([3, 1, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		var isEven = (num % 2 === 0);
		deferred.resolve(isEven);
	}, num * 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> 2
	console.log(order); //> [1, 2, 3]
});
```




## findSeries

Determines the first value in `list` for which `iterator` resolves to `true`.
`iterator` is called on each item in the list in order, waiting for the
{Deferred} object returned from `iterator` (or referenced from the {Promise}
object returned from `iterator`) to resolve before proceeding.

`iterator` has the following signature:

`function(element, index, list)` if `list` is an {Array}  
`function(value, key, list)` if `list` is an {Object}

* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:**
  [Truthy/Falsy](http://www.sitepoint.com/javascript-truthy-falsy/) value
  indicating whether current item passes

The returned {Promise} object can resolve:

* The first time `iterator` resolves to `true` for an item
* When `iterator` has resolved to `false` for every item

**Resolves:**

* {Any} - the first value in `list` which passed `iterator`'s truth test, **or**
* {void} - if no value passed


```js
var order = [];

findSeries([3, 1, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		var isEven = (num % 2 === 0);
		deferred.resolve(isEven);
	}, num * 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> 2
	console.log(order); //> [3, 1, 2]
});
```




## map

Produces a new {Array} by mapping each item in `list` through the
transformation function `iterator`. `iterator` is called on all items within
`list` in parallel, so there is no guarantee that the items will be processed
in order. However, the final list will retain the ordering of the passed
`list`.

`iterator` has the following signature:

`function(element, index, list)` if `list` is an {Array}  
`function(value, key, list)` if `list` is an {Object}

* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:** the current item, transformed

The returned {Promise} object resolves when `iterator` has resolved for every
item in the `list`.

**Resolves:** {Array} of transformed items


```js
var order = [];

map([3, 1, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		deferred.resolve(num * 2);
	}, num * 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> [6, 2, 4]
	console.log(order); //> [1, 2, 3]
});
```




## mapSeries

Produces a new {Array} by mapping each item in `list` through the
transformation function `iterator`. `iterator` is called on each item in the
list in order, waiting for the {Deferred} object returned from `iterator` (or
referenced from the {Promise} object returned from `iterator`) to resolve
before proceeding.

`iterator` has the following signature:

`function(element, index, list)` if `list` is an {Array}  
`function(value, key, list)` if `list` is an {Object}

* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:** the current item, transformed

The returned {Promise} object resolves when `iterator` has resolved for every
item in the `list`.

**Resolves:** {Array} of transformed items


```js
var order = [];

mapSeries([3, 1, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		deferred.resolve(num * 2);
	}, num * 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> [6, 2, 4]
	console.log(order); //> [3, 1, 2]
});
```




## parallel

Evaluates all passed arguments in parallel, resolving when all arguments have
resolved. The result of evaluting each argument is stored and resolved (see
"Resolves" section).

The most common usage of {Deferreds.parallel} is to pass an {Array<Function>},
with each {Function} returning a {Promise} object. Used this way,
{Deferreds.parallel} will resolve with an {Array} of the resolved values of
each {Function}, ordered by each {Function}'s original index.

However, `tasks` is a highly dynamic parameter:

* May be an {Array}, {Object}, or varargs (comma-separated)
* {Array} elements, {Object} values, or varargs arguments may be freely mixed
  and matched between:
	* {Function} returning a {Deferred} or {Promise}
		* Resolved value is stored
	* {Function} returning {Any}
		* Resolves immediately; returned value is stored
	* {Deferred} or {Promise} object
		* Resolved value is stored
	* {Any}
		* Resolves immediately; value is stored

The returned {Promise} object resolves when every passed or returned {Deferred}
or {Promise} in `tasks` has resolved.

**Resolves:**

* If `tasks` is an {Array}:
	* in-order {Array} of the stored results of evaluating each element in
	  `tasks`
* If `tasks` is an {Object} of `key => old_value`:
	* {Object} of `key => new_value`, where `new_value` is the stored result of
	  evaluating each `old_value` at the same `key`
* If `tasks` is varargs (comma-separated):
	* Takes the stored result of evaluating each argument, and applies it as
	  arguments in-order to {Deferred#resolve}


```js

//for brevity in examples, _timedDeferred is a Function which returns a Promise
//of a Deferred which resolves with `val` after `t` milliseconds
var _timedDeferred = function(t, val) {
	var deferred = new Deferred();
	setTimeout(function() {
		deferred.resolve(val);
	}, t);
	return deferred.promise();
};


//regular usage: Array of Functions returning Promises
parallel([
	function() {
		return _timedDeferred(20, 'A');
	},
	function(){
		return _timedDeferred(30, 'B');
	},
	function(){
		return _timedDeferred(10, 'C');
	}
]).then(function(result) {
	//the resolve order was C, A, B because of the timeouts, but parallel()
	//maintains original ordering
	console.log(result); //> ['A', 'B', 'C']
});


//Deferred/Promise objects and regular values may be passed as-is, and result
//will still be in order
parallel([
	function() {
		return _timedDeferred(20, 'A');
	},
	_timedDeferred(30, 'B'),
	'C'
]).then(function(result) {
	console.log(result); //> ['A', 'B', 'C']
});


//Object keys point to the correct result
parallel({
	'A': function() {
		return _timedDeferred(20, '1');
	},
	'B': function(){
		return _timedDeferred(30, '2');
	},
	'C': function(){
		return _timedDeferred(10, '3');
	}
}).then(function(result) {
	console.log(result); //> {'A':'1', 'B':'2', 'C':'3'}
});


//passing comma-separated arguments
parallel(
	function() {
		return _timedDeferred(20, 'A');
	},
	function(){
		return _timedDeferred(30, 'B');
	},
	function(){
		return _timedDeferred(10, 'C');
	}
).then(function(first, second, third) {
	console.log(first);  //> 'A'
	console.log(second); //> 'B'
	console.log(third);  //> 'C'
});
```




## reduce

Boils a `list` of values into a single value. `memo` is the initial state of
the reduction, and each call to `iterator` should resolve the next desired
value of `memo`. `iterator` is called on each item in the list in order,
waiting for the {Deferred} object returned from `iterator` (or referenced from
the {Promise} object returned from `iterator`) to resolve before proceeding.

`iterator` has the following signature:

`function(memo, element, index, list)` if `list` is an {Array}  
`function(memo, value, key, list)` if `list` is an {Object}

* `memo` - value from the previous step of the reduction
* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:** next value of `memo`

The returned {Promise} object resolves when `iterator` has resolved for every
item in the `list`.

**Resolves:** {Any} value of `memo`


```js
var order = [];

reduce([3, 1, 2], function(memo, num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		deferred.resolve(num + memo);
	}, num * 10);
	return deferred.promise();
}, 0).then(function(result) {
	console.log(result); //> 6
	console.log(order); //> [3, 1, 2]
});
```




## reduceRight

Boils a `list` of values into a single value, processing from right to left
(reverse order). `memo` is the initial state of the reduction, and each call to
`iterator` should resolve the next desired value of `memo`. `iterator` is
called on each item in the list in order, waiting for the {Deferred} object
returned from `iterator` (or referenced from the {Promise} object returned from
`iterator`) to resolve before proceeding. 

`iterator` has the following signature:

`function(memo, element, index, list)` if `list` is an {Array}  
`function(memo, value, key, list)` if `list` is an {Object}

* `memo` - value from the previous step of the reduction
* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:** next value of `memo`

The returned {Promise} object resolves when `iterator` has resolved for every
item in the `list`.

**Resolves:** {Any} value of `memo`


```js
var order = [];

reduceRight([3, 1, 2], function(memo, num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		deferred.resolve(num + memo);
	}, num * 10);
	return deferred.promise();
}, 0).then(function(result) {
	console.log(result); //> 6
	console.log(order); //> [1, 2, 3]
});
```




## reject

Builds an {Array} containing all values in `list` except the ones which pass
the truth test provided by `iterator`. Inverse of {Deferreds.filter}.
`iterator` is called on all items within `list` in parallel, so there is no
guarantee that the items will be processed in order.  However, the final list
will retain the ordering of the passed `list`.

`iterator` has the following signature:

`function(element, index, list)` if `list` is an {Array}  
`function(value, key, list)` if `list` is an {Object}

* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:**
  [Truthy/Falsy](http://www.sitepoint.com/javascript-truthy-falsy/) value
  indicating whether current item should be rejected

The returned {Promise} object resolves when `iterator` has resolved for every
item in the `list`.

**Resolves:** {Array} value containing all values in `list` which did not pass
`iterator`'s truth test

```js
var order = [];

reject([3, 1, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		var isOdd = (num % 2 !== 0);
		deferred.resolve(isOdd);
	}, num * 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> [2]
	console.log(order); //> [1, 2, 3]
});
```




## rejectSeries

Builds an {Array} containing all values in `list` except the ones which pass
the truth test provided by `iterator`. Inverse of {Deferreds.filterSeries}.
`iterator` is called on each item in the list in order, waiting for the
{Deferred} object returned from `iterator` (or referenced from the {Promise}
object returned from `iterator`) to resolve before proceeding.

`iterator` has the following signature:

`function(element, index, list)` if `list` is an {Array}  
`function(value, key, list)` if `list` is an {Object}

* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:**
  [Truthy/Falsy](http://www.sitepoint.com/javascript-truthy-falsy/) value
  indicating whether current item should be rejected

The returned {Promise} object resolves when `iterator` has resolved for every
item in the `list`.

**Resolves:** {Array} value containing all values in `list` which did not pass
`iterator`'s truth test

```js
var order = [];

rejectSeries([3, 1, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		var isOdd = (num % 2 !== 0);
		deferred.resolve(isOdd);
	}, num * 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> [2]
	console.log(order); //> [3, 1, 2]
});
```




## series

Evaluates all passed arguments one at a time and in order, resolving when all
arguments have resolved. If an argument evaluates to a {Deferred} or {Promise},
the next argument will not be evaluated until the {Deferred} has resolved. The
result of evaluting each argument is stored and resolved (see "Resolves"
section).

The most common usage of {Deferreds.series} is to pass an {Array<Function>},
with each {Function} returning a {Promise} object. Used this way,
{Deferreds.series} will resolve with an {Array} of the resolved values of
each {Function}, ordered by each {Function}'s original index.

However, `tasks` is a highly dynamic parameter:

* May be an {Array}, {Object}, or varargs (comma-separated)
* {Array} elements, {Object} values, or varargs arguments may be freely mixed
  and matched between:
	* {Function} returning a {Deferred} or {Promise}
		* Resolved value is stored
	* {Function} returning {Any}
		* Resolves immediately; returned value is stored
	* {Deferred} or {Promise} object
		* Resolved value is stored
	* {Any}
		* Resolves immediately; value is stored

The returned {Promise} object resolves when every passed or returned {Deferred}
or {Promise} in `tasks` has resolved.

**Resolves:**

* If `tasks` is an {Array}:
	* in-order {Array} of the stored results of evaluating each element in
	  `tasks`
* If `tasks` is an {Object} of `key => old_value`:
	* {Object} of `key => new_value`, where `new_value` is the stored result of
	  evaluating each `old_value` at the same `key`
* If `tasks` is varargs (comma-separated):
	* Takes the stored result of evaluating each argument, and applies it as
	  arguments in-order to {Deferred#resolve}


```js

//for brevity in examples, _timedDeferred is a Function which returns a Promise
//of a Deferred which resolves with `val` after `t` milliseconds
var _timedDeferred = function(t, val) {
	var deferred = new Deferred();
	setTimeout(function() {
		deferred.resolve(val);
	}, t);
	return deferred.promise();
};


//regular usage: Array of Functions returning Promises
series([
	function() {
		return _timedDeferred(20, 'A');
	},
	//20ms passes, then:
	function(){
		return _timedDeferred(30, 'B');
	},
	//30ms passes, then:
	function(){
		return _timedDeferred(10, 'C');
	}
]).then(function(result) {
	console.log(result); //> ['A', 'B', 'C']
});


//Deferred/Promise objects and regular values may be passed as-is, and result
//will still be in order
series([
	function() {
		return _timedDeferred(20, 'A');
	},
	_timedDeferred(30, 'B'),
	'C'
]).then(function(result) {
	console.log(result); //> ['A', 'B', 'C']
});


//Object keys point to the correct result
series({
	'A': function() {
		return _timedDeferred(20, '1');
	},
	'B': function(){
		return _timedDeferred(30, '2');
	},
	'C': function(){
		return _timedDeferred(10, '3');
	}
}).then(function(result) {
	console.log(result); //> {'A':'1', 'B':'2', 'C':'3'}
});


//passing comma-separated arguments
series(
	function() {
		return _timedDeferred(20, 'A');
	},
	function(){
		return _timedDeferred(30, 'B');
	},
	function(){
		return _timedDeferred(10, 'C');
	}
).then(function(first, second, third) {
	console.log(first);  //> 'A'
	console.log(second); //> 'B'
	console.log(third);  //> 'C'
});
```




## some

Determines whether any values in `list` pass the truth test provided by
`iterator`. `iterator` is called on all items within `list` in parallel, so
there is no guarantee that the items will be processed in order.

`iterator` has the following signature:

`function(element, index, list)` if `list` is an {Array}  
`function(value, key, list)` if `list` is an {Object}

* `element`/`value` - the current element or value
* `index`/`key` - the current index or key
* `list` - the original {Array} or {Object}
* **returns:** {Deferred} or {Promise} object
* **resolves:**
  [Truthy/Falsy](http://www.sitepoint.com/javascript-truthy-falsy/) value
  indicating whether current item passes

The returned {Promise} object can resolve:

* `true` - the first time `iterator` has resolved `true` for any item in `list`, **or**
* `false` - when `iterator` has resolved `false` for every item in `list`

**Resolves:** {Boolean} value indicating whether or not any item in
`list` passed `iterator`'s test

```js
some([1, 2, 3], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		deferred.resolve(num === 3);
	}, 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> true
});
```




## until

Alternates between calling `test` and `iterator` until the result of `test` is
`true`. Both `test` and `iterator` can optionally return a {Deferred} or
{Promise} object, and {Deferreds.until} will wait for it to resolve before
continuing.

The returned {Promise} object will resolve when `test` returns or resolves to
`true`.

**Resolves:** {void}

```js
var called = [];
var count = 0;

until(
	function() {
		called.push('test ' + count);
		return (count === 2);
	},
	function() {
		var deferred = new Deferred();
		setTimeout(function() {
			called.push('iterator ' + count);
			deferred.resolve();
		}, 10);
		return deferred.promise();
	}
).then(function() {
	console.log(called);
	/*

	> [
		'test 0',
		'iterator 0',
		'test 1',
		'iterator 1',
		'test 2'
	]

	*/
});
```




## pipe

Evaluates all passed arguments one at a time and in order, each time passing
the result as an argument to the next {Function} in the chain. If an argument
evaluates to a {Deferred} or {Promise}, the next argument will not be evaluated
until the {Deferred} has resolved. This is the functional-style equivalent to
{Deferred#pipe}.

The most common usage of {Deferreds.pipe} is to pass an {Array<Function>},
with each {Function} returning a {Promise} object and depending on the result
of the previous {Function} for its own computations.

However, `tasks` is a highly dynamic parameter:

* May be an {Array}, {Object}, or varargs (comma-separated)
* {Array} elements, {Object} values, or varargs arguments may be freely mixed
  and matched between:
	* {Function} returning a {Deferred} or {Promise}
		* Resolved value is passed forward in the chain
	* {Function} returning {Any}
		* Resolves immediately; returned value is passed forward in the chain
	* {Deferred} or {Promise} object
		* Resolved value is passed forward in the chain
	* {Any}
		* Resolves immediately; value passed forward in the chain

The returned {Promise} object resolves when every passed or returned {Deferred}
or {Promise} in `tasks` has resolved.

**Resolves:** the resolved value of the last task in `tasks`

```js
//regular usage: Array of Functions returning Promises
pipe([
	function() {
		var deferred = new Deferred();
		setTimeout(function() {
			deferred.resolve('one', 'two');
		}, 10);
		return deferred.promise();
	},
	function(arg1, arg2) {
		console.log(arg1); //> 'one'
		console.log(arg2); //> 'two'

		var deferred = new Deferred();
		setTimeout(function() {
			deferred.resolve({
				arg1: arg1,
				arg2: arg2,
				arg3: 'three'
			});
		}, 10);
		return deferred.promise();
	},
	function(result) {
		console.log(result.arg1); //> 'one'
		console.log(result.arg2); //> 'two'
		console.log(result.arg3); //> 'three'

		var deferred = new Deferred();
		setTimeout(function() {
			deferred.resolve(['four']);
		}, 10);
		return deferred.promise();
	}
]).then(function(result) {
	console.log(result); //> ['four']
});


//Deferred/Promise objects and regular values may be passed as-is
pipe([
	function() {
		var deferred = new Deferred();
		setTimeout(function() {
			//doesn't matter because next task is not a function
			deferred.resolve('does not matter');
		}, 10);
		return deferred.promise();
	},
	Deferred().resolve('B').promise(),
	function(arg) {
		console.log(arg); //> 'B'
	},
	'C',
	function(arg) {
		console.log(arg); //> 'C'
	},
]);
```




## whilst

Alternates between calling `test` and `iterator` until the result of `test` is
`false`. Inverse of {Deferreds.until}. Both `test` and `iterator` can
optionally return a {Deferred} or {Promise} object, and {Deferreds.whilst} will
wait for it to resolve before continuing.

The returned {Promise} object will resolve when `test` returns or resolves to
`false`.

**Resolves:** {void}

```js
var called = [];
var count = 0;

whilst(
	function() {
		called.push('test ' + count);
		return (count !== 2);
	},
	function() {
		var deferred = new Deferred();
		setTimeout(function() {
			called.push('iterator ' + count);
			deferred.resolve();
		}, 10);
		return deferred.promise();
	}
).then(function() {
	console.log(called);
	/*

	> [
		'test 0',
		'iterator 0',
		'test 1',
		'iterator 1',
		'test 2'
	]

	*/
});
```
