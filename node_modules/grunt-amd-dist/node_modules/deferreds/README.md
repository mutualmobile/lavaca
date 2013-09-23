Deferreds.js
============

[![Build Status](https://travis-ci.org/zship/deferreds.js.png?branch=develop)](https://travis-ci.org/zship/deferreds.js)

Main documentation is [right here](http://zship.github.com/deferreds.js/)!

Deferreds.js is a utility library centered around working with [Deferred
objects](http://wiki.commonjs.org/wiki/Promises/A). The main goal is to do for
Deferred objects what [async.js](https://github.com/caolan/async) does for
Node-style asynchronous functions&mdash;that is, provide many common
higher-order functions (map, reduce, filter, etc.) accepting
potentially-asynchronous Deferred objects as arguments.

Just like async.js, deferreds.js provides several flow control functions. To
give you an idea of what these look like, here's perhaps the most useful
function, **pipe** (called "waterfall" in async.js):

```js
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
```
