A {Promise} object is merely a "view" of the methods on a {Deferred} object
which do not alter state.  All of its methods delegate directly to a wrapped
{Deferred} object, and it contains no state of its own. {Deferred} methods
exposed by a {Promise} object are:

* {Deferred#always}
* {Deferred#done}
* {Deferred#fail}
* {Deferred#progress}
* {Deferred#state}
* {Deferred#then}

{Deferred} methods which alter state and therefore do not exist on a {Promise}
object are:

* {Deferred#resolve}
* {Deferred#reject}
* {Deferred#notify}

It's considered good practice to return a {Promise} object from your own
functions rather than a full {Deferred} object. This is done in order to
guarantee that downstream code cannot alter the {Deferred}'s state by calling
{Deferred#resolve} or {Deferred#reject} on it.

{Promise}s are not intended to be constructed directly. Rather, they are
created along with {Deferred} objects and can be accessed via
{Deferred#promise}.


## state

Return the wrapped {Deferred} object's {Deferred.State}.


## then

Delegates to the wrapped {Deferred} object's {Deferred#then}.


## done

Delegates to the wrapped {Deferred} object's {Deferred#done}.


## fail

Delegates to the wrapped {Deferred} object's {Deferred#fail}.


## always

Delegates to the wrapped {Deferred} object's {Deferred#always}.


## progress

Delegates to the wrapped {Deferred} object's {Deferred#progress}.
