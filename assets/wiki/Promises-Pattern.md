# What is the Promises Pattern?
Asynchronous programming has become a more and more important tool in a JavaScript developer's arsenal. The two biggest challenges in shifting from a synchronous to asynchronous mindset are (1) being able to read the code and understand the flow, and (2) smoothly tying together all of the different callbacks involved in your program.

The **Promises Pattern** (also called the **Deferred Pattern**) aims to provide a uniform, structured way to plug callbacks into asynchronous actions (like AJAX requests or WebWorkers).

With promises, a function that performs asynchronous actions (like jQuery's `$.ajax`) returns a promise object. You can then call a method on the promise object to queue up a callback that will execute when the asynchronous action is completed. As you get into more advanced promises programming, the promise object can be used to bring together two asynchronous flows, handle errors, and more.

The IEBlog wrote a great [tutorial to get started working with the Promise Pattern](http://blogs.msdn.com/b/ie/archive/2011/09/11/asynchronous-programming-in-javascript-with-promises.aspx). There's another excellent roundup from [Script Junkie](http://msdn.microsoft.com/en-us/magazine//gg723713.aspx), as well as the [Promises/A specification](http://wiki.commonjs.org/wiki/Promises/A). Many libraries have also begun to incorporate promises, and have their own baked-in solutions, like [jQuery Deferred](http://api.jquery.com/category/deferred-object/).

In previous releases Lavaca had it own implementation of the promises patern, but we are now recommending to use either [ES6 standard promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) or [jQuery Deffered](https://api.jquery.com/jquery.deferred/).

