Controllers and routes are the glue that holds the application together.

# Understanding Routing

## What is a Route?
A **route** is a combination of three things:

* **URL pattern** - A string pattern used to test the route against a URL string
* **Action** - The controller type and method that's executed when the user navigates to the route
* **Parameters** - A hash of key-value pairs that are passed along to the action

In `lavaca/mvc`, routes are created as `lavaca/mvc/Route` objects and registered with the router. Applications will use many different routes, one for each possible URL pattern.

## URL Patterns and Parameters
A **URL pattern** is a string in a special format that a route can use to see if it matches a URL and then break that URL into data. All routes are registered according to their URL pattern, so only one route can have a specific URL pattern.

A URL pattern might be:

    /profile/{userName}/on/{date}

When a route is registered with the above pattern and the router is sent to `/profile/foo/on/2012-01-01`, the URL pattern is tested against the URL, found to match, and then the matching route is executed.

One of the more powerful parts of routing is its ability to break a URL into parameterized data. In the above scenario, the route would automatically glean this data from the URL:

    {
      userName: 'foo',
      date: new Date(2012, 0, 1)
    }

Routes will also merge query string parameters into this data. If the router is passed `/profile/foo/on/2012-01-01?bar=xyz&zed=1&zed=2&zed=3&full=true`, the route would find this data:

    {
      userName: 'foo',
      date: new Date(2012, 0, 1),
      bar: 'xyz',
      zed: [1, 2, 3],
      full: true
    }

You'll notice that the route has automatically inferred the types of some of the parameters. The `date` parameter matches the format `YYYY-MM-DD` and so was interpreted as a Date. The `zed` parameter was found multiple times and each instance was numeric, so it was interpreted as an `Array` of `Number`s. The full parameter was the string `"true"` so it was interpreted to be a `Boolean`.

Routes may also be registered with extra preset parameters. In the above scenario, if the route was registered with the parameters `{cat: 'meow', dog: 'woof'}`, then the route would find this data:

    {
      userName: 'foo',
      date: new Date(2012, 0, 1),
      bar: 'xyz',
      zed: [1, 2, 3],
      full: true,
      cat: 'meow',
      dog: 'woof'
    }

The parameters registered with a route can be used as default values for when a URL doesn't supply a value. For example, if the route was registered with `{cat: 'meow', dog: 'woof'}`, and the router was sent to `/profile/foo/on/2012-01-01`, the route would find:

    {
      userName: 'foo',
      date: new Date(2012, 0, 1),
      cat: 'meow',
      dog: 'woof'
    }

If the router was sent to `/profile/foo/on/2012-01-01?dog=bark`, the route would find:

    {
      userName: 'foo',
      date: new Date(2012, 0, 1),
      cat: 'meow',
      dog: 'bark'
    }

## What is a Router?
The **router** is an object that allows the user to navigate the application. The router maintains a registry of different routes available to the application and gives other parts of the application the ability to navigate to a route.

## Creating Your Application's Router
The Router is a singleton like the View Manager. In order to setup a router, you will need to have previously instantiated a view manager. `lavaca/mvc/Application` does this for you (see [Views and the View Manager](Views-and-the-View-Manager)).

    var router = require('lavaca/mvc/Router'),
        viewManager = require('lavaca/mvc/ViewManager');
    router.setViewManager(viewManager);

Before the router can be used, you'll need to register the routes that will be used by your application.
  
    var router = require('lavaca/mvc/Router'),  
        HomeController = require('app/net/HomeController');
        AccountController = require('app/net/AccountController');
    router.add({
      '/': [HomeController, 'home'],
      '/account/login', [AccountController, 'login'],
      '/account/logout', [AccountController, 'logout'],
      '/account/profile': [AccountController, 'profile']
    });

By default, `lavaca/mvc/Application` will create a router for you and navigate to the `initRoute` on page load. You'll just need to register routes. See [MVC in Lavaca](MVC-in-Lavaca) for more information about setting up with `lavaca/mvc/Application`.

## Navigating Using a Router
When `router.exec(url)` is called, this sequence of events occurs:

1. Each registered route is tested against the URL
1. Assuming a matching route is found, the first matching route will:
1. Create a data object using the URL pattern and its parameters
1. Create a new instance of its action's controller type
1. Execute the method on the controller whose name matches the route action's name, passing to it the route's parameters and the parameters derived from the URL
1. Dispose of the controller

When you call `router.exec(url, state=null, parameters=null)`, you can pass in up to three arguments:

* `url` - The URL string to use to find a route
* `state` - (Optional) A data object to pass to the route's action
* `parameters` - (Optional) Additional parameters to pass to the route's action

What happens next is up to the action (controller and method) associated with the route.

Ultimately, the `exec()` call will return a `lavaca/util/Promise` object. Using that promise, you can setup behaviors for when the action succeeds or fails.

    var router = require('lavaca/mvc/Router');
    router.exec('/foo/bar')
      .success(function(value) { alert('Success! ' + value); })
      .error(function(err) { alert('Error! ' + err); });

See [Promises Pattern](Promises-Pattern) for more details on using promises.

# Understanding Controllers

## What is a Controller?
A controller is an object that's dedicated to managing application-level behavior. A controller has three main responsibilities:

* Control the user's flow through the application
* Control when data is loaded from, saved to, or modified on the server
* Supply the data (model) to the visual presentation (view)

Controllers in `lavaca/mvc` are all derived from the type `lavaca/mvc/Controller`.

## What is an Action?
The methods found on a controller that are associated with a route can be referred to as **actions**. Actions may perform any kind of behavior, but they almost always cause the application to switch to a new screen. Some examples of things an action might do would be loading the home page, handling a form submit, or logging the user into the app.

In `lavaca/mvc`, actions always have the same method signature. Actions always accept two parameters: a parameters object that they receive from the route and a history state object. Actions always return an `lavaca/util/Promise`, so that they can safely perform asynchronous behaviors. See [Promises Pattern](Promises-Pattern) for more information on using promises.

Controllers may have other helper methods on them as well, but actions are the only controller methods that should be called externally.

## Creating a Controller
Controller types that you create will usually contain only actions and should all extend `lavaca/mvc/Controller`. You may find it useful to first create a base controller type with application-specific helper methods and extend your other controllers from the base controller.

Your controllers should usually be created under `app/net`. Each controller type should have its own file, and you'll generally want to include `Controller` at the end of the type's name.

Here's an example of a very basic controller, `app/net/HomeController`:

    define(function(require) {
    
      var Controller = require('lavaca/mvc/Controller'),
          HomeView = require('app/ui/views/HomeView');  

      var HomeController = Controller.extend({
        home: function(params, historyState) {
          var model = historyState;
          if (!model) {
            model = {foo: 'bar'};
          }
          return this
            .view('home', HomeView, model)
            .then(this.history(model, 'Home Page', params.url);
        }
      });

      return HomeController;
    
    });

This controller has one action, `home`. The first argument, `params`, is the data object that's put together by the route that will call the action. The second argument, `historyState`, is history state data that is passed to the action when the user arrives at the route through back button browsing.

The first thing that this action does is check to see if a historyState from the history was passed in. If it wasn't, then the method needs to create a new model. This becomes very important in network and AJAX operations or in situations where it's very computationally expensive to recreate the data model. In some cases, when you don't want to support history for the action, you can ignore making this check and just always create the model.

Next, the home action sets up the promise that it will return and queues a view transition using the `view()` helper method. After the view changes, the action records a new history state using the `history()` helper method.

## Controller Helper Methods
The base `lavaca/mvc/Controller` supplies a few different helper methods that cover the most common controller tasks.

### `view(cacheKey, TView, model, layer=0)`
This method returns a promise and loads a page view using the `lavaca/mvc/ViewManager`.

* `cacheKey` - A key under which the view manager caches the page view (or retrieves the cached view)
* `TView` - The type of page view to load
* `model` - The data model to feed the page view
* `layer` - (Optional) The UI layer on which the page view should sit. Defaults to `0`.

See [Views and the View Manager](Views-and-the-View-Manager) for more information on using views.

### `redirect(url, args=null)`
This method returns a promise and sends the user to another route.

* `url` - The URL to use to find the new route
* `args` - (Optional) A list of arguments to be substituted into the string (see the url helper method)

### `history(state, title, url)`
This method records a history state if the action wasn't fired as the result of a history state change.

* `state` - The data object to store with the history state, usually the model that the controller puts together
* `title` - The window title
* `url` - The URL of the history state, usually coming from the value of `params.url`

### `url(str, args)`
This method returns a string usable as a URL with arguments substituted into it using `lavaca/util/StringUtils.format()`.

* `str` - The string into which arguments will be substituted
* `args` - A list of arguments to be substituted into the string. These values will be encoded using `encodeURIComponent` during formatting.