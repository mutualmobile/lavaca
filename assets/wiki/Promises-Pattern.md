# What is the Promises Pattern?
Asynchronous programming has become a more and more important tool in a JavaScript developer's arsenal. The two biggest challenges in shifting from a synchronous to asynchronous mindset are (1) being able to read the code and understand the flow, and (2) smoothly tying together all of the different callbacks involved in your program.

The **Promises Pattern** (also called the **Deferred Pattern**) aims to provide a uniform, structured way to plug callbacks into asynchronous actions (like AJAX requests or WebWorkers).

With promises, a function that performs asynchronous actions (like jQuery's `$.ajax`) returns a promise object. You can then call a method on the promise object to queue up a callback that will execute when the asynchronous action is completed. As you get into more advanced promises programming, the promise object can be used to bring together two asynchronous flows, handle errors, and more.

The IEBlog wrote a great [tutorial to get started working with the Promise Pattern](http://blogs.msdn.com/b/ie/archive/2011/09/11/asynchronous-programming-in-javascript-with-promises.aspx). There's another excellent roundup from [Script Junkie](http://msdn.microsoft.com/en-us/magazine//gg723713.aspx), as well as the [Promises/A specification](http://wiki.commonjs.org/wiki/Promises/A). Many libraries have also begun to incorporate promises, and have their own baked-in solutions, like [jQuery Deferred](http://api.jquery.com/category/deferred-object/).

In this article, we'll cover the Lavaca implementation of the promises pattern.

# Making a Promise
When you write a function that may perform asynchronously (because of something like animation or network requests), the function should return a promise. When your function resolves a promise, it means that the operation has completed successfully. When your function rejects a promise, it means that the operation has failed.

Here's a simple function that fades an element in:

    function fadeIn(element) {
      element.style.cssText = 'opacity: 0; -webkit-transition: opacity 1s linear;';
      setTimeout(function() {
        element.style.opacity = 1;
        element = null;
      }, 0);
    }

The function is fine on its own, but what if you wanted to perform another action once the element's finished fading in? What if you wanted to perform a whole series of different actions?

That's where promises come in. Let's look at the method rewritten to use promises:

    function fadeIn(element) {
      var Promise = require('lavaca/util/Promise');
      var promise = new Promise(element);
      element.style.cssText = 'opacity: 0; -webkit-transition: opacity 1s linear;';
      element.addEventListener('webkitTransitionEnd', function(e) {
        promise.resolve();
        this.removeEventListener(e.type, arguments.callee);
      }, false);
      setTimeout(function() {
        element.style.opacity = 1;
        element = null;
      }, 0);
      return promise;
    }

The function needed three things to start using promises:

* Initialize a `lavaca/util/Promise` and give it an execution context (in this case, the element being animated)
* Resolve the promise once the animation is finished, using an event handler
* Return the promise so that other code can use it

Now, you can set a handler to execute after the promise resolves:

    var element = document.getElementById('#fade-me');
    fadeIn(element)
      .then(function() {
        alert('The element faded in');
      });

You can chain multiple handlers and promises together as well. The following code fades the first element in, then alerts, then fades a second element in, and then alerts again:

    var element = document.getElementById('#fade-me');
    fadeIn(element)
      .then(function() {
        alert('The element faded in');
      })
      .then(function() {
        var other = document.getElementById('#fade-me-too');
        fadeIn(other)
          .then(function() {
            alert('Now BOTH elements have faded in');
          });
      });

Promises help simplify the code required to perform complex chains of actions. The following code fades in each `<li>` element on a page one after another:

    var elements = document.getElementsByTagName('li'),
        i = -1;
    function processNext() {
      var element = elements[++i];
      if (element) {
        fadeIn(element)
          .then(processNext);
      }
    }
    processNext();

Promises are used here to make the `<li>` elements fade in sequential order, so that one never starts fading in until the previous has finished.

We could take this example further, and create a promise that resolves when the last element has faded in, so that we can chain sequences together:

    function fadeInSequence(elements) {
      var Promise = require('lavaca/util/Promise');
      var i = -1,
        promise = new Promise(elements);
      function processNext() {
        var element = elements[++i];
        if (element) {
          fadeIn(element)
            .then(processNext);
        } else {
          promise.resolve();
        }
      }
      processNext();
      return promise;
    }
    fadeInSequence(document.getElementsByTagName('li'))
      .then(function() {
        fadeInSequence(document.getElementsByTagName('a'));
      });

The above code sequentially fades all `<li>` elements in and then sequentially fades all `<a>` elements in.

# Rejection and Resolution
There are two ways for a promise to end: It can either be **resolved**, meaning that the desired action completed successfully, or it can be **rejected**, meaning that the desired action did not occur or did not complete.

To resolve a promise, call it's `resolve()` method:

    promise.resolve();

To reject a promise, call it's `reject()` method:

    promise.reject();

Calling `resolve()` causes all of the promise's success handlers to execute in the order that they were added. Calling `reject()` causes all of the promise's error handlers to execute in the order that they were added.

If you add a success handler after a promise has already been resolved, that handler is immediately executed. The same is true of error handlers and rejection.

A promise can never go from being rejected to being resolved, and vice versa.

## Adding Success/Error Handlers
You can add a success handler to a promise using the promise's `success()` method:

    promise.success(resolvedCallback);

You can add an error handler to a promise using the promise's `error()` method:

    promise.error(rejectedCallback);

For convenience, you can assign a success handler and an error handler at the same time using the promise's `then()` method:

    promise.then(resolvedCallback, rejectedCallback);

These methods can also be chained together:

    promise
      .success(resolvedCallback)
      .error(rejectedCallback)
      .then(anotherResolvedCallback, anotherRejectedCallback);

When a promise is resolved, each of its success handlers is called in the order that it was assigned. If you add a success handler after a promise has already been resolved, the success handler is immediately executed. The same is true of rejected promises and their error handlers.

## Passing Values to Success/Error Handlers
When you resolve or reject a promise, you can also pass in any number of arguments that will be passed to the success/error handlers.

The below function makes an AJAX request, and resolves or rejects a promise based on whether or not the AJAX request succeeded. When the promise is resolved, it's passed the data that was loaded. When the promise is rejected, it's passed an error message.

    function loadData(url) {
      var Promise = require('lavaca/util/Promise');
      var promise = new Promise();
      $.ajax({
        url: url,
        success: function(response) {
          promise.resolve(response);
        },
        error: function(response) {
          promise.reject(response);
        }
      });
      return promise;
    }

For simple resolution and rejection, you can use the promise's `resolver()` and `rejector()` convenience methods that create a function that resolves/rejects a promise and passes all arguments on to the success/error handlers.

    function loadData(url) {
      var promise = new Lavaca.util.Promise();
      $.ajax({
        url: url,
        success: promise.resolver(),
        error: promise.rejector()
      });
      return promise;
    }

## Handlers that Always Execute
You can use the promise's `always()` method to add a handler that executes when the promise is resolved or when the promise is rejected.

    loadData('http://api.test.test/test')
      .success(function(data) {
        alert('Loaded ' + data + ' from ' + url);
      })
      .error(function(message) {
        alert('Got this error message ' + message + ' from ' + url);
      })
      .always(function() {
        alert('The promise was either resolved or rejected');
      });

In the above code, when the request succeeds, the success handler will execute and then the always handler will execute. When the request fails, the error handler will execute and then the always handler will execute.

# Synchronizing Multiple Methods
In many cases, it may be desirable to perform an action after two asynchronous events have occurred. To handle this scenario, you can use a promise's `when()` method. A promise uses its `when()` method to follow the results of one or more other promises. When one of the followed promises is rejected, the follower is immediately rejected. When all of the followed promises are resolved, the follower is resolved and passed all of their resolution values.

Let's take our two example functions from earlier sections, `fadeIn` and `loadData`. Say that, when the application loads, you want to load a user's profile info, load the user's recent activity, and then after those two actions are complete, add the data to the page, fade in the block showing the profile and then fade in the block showing activity.

    var Promise = require('lavaca/util/Promise');
    var promise = new Promise();
    promise
      .when(loadData('/api/test/profile'), loadData('/api/test/activity'))
      .success(function(profileData, activityData) {
        var profileElement = document.getElementById('profile'),
            activityElement = document.getElementById('activity');
        profileElement.innerHTML = profileData;
        activityElement.innerHTML = activityData;
        fadeIn(profileElement)
          .then(function() {
            fadeIn(activityElement);
          });
      })
      .error(function() {
        alert('Failed to load user data');
      });

The above code creates a new promise object and uses its `when()` method to follow the two AJAX promises. A success handler is defined to setup the app after all the data is loaded. An error handler is defined to alert the user when one of the AJAX calls failed.

You can also use the static convenience version of `when()` to create a new promise that follows other promises:

    Promise
      .when(otherPromise1, otherPromise2, otherPromiseN)
      .then(successCallback, errorCallback);