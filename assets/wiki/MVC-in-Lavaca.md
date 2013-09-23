# What is MVC?
MVC (Model/View/Controller) is a design pattern that enforces a separation of concerns, similarly to how HTML, CSS, and JavaScript break apart the content, presentation, and behavior of a web page. In an MVC pattern, your models are responsible for carrying data, your views are responsible for transforming data into a presentable screen, and your controllers are responsible for gluing the two together and managing the application's flow.

# What is Client-Side MVC?
MVC patterns have been popular in server-side programming since the mid-2000's. In recent years, more and more of the application's logic has been shifting towards the client, and we've seen rich, single-page internet applications, like Gmail and Facebook, spring up. As more work moves to the client, more JavaScript code is needed to manage that workload.

By using an MVC structure, you cleanly compartmentalize your code, making your code more stable and easier to extend - exactly the problems that complex JavaScript apps often face.

Lavaca comes complete with its own JavaScript MVC framework, `lavaca/mvc`.

# Components of `lavaca/mvc`
The `lavaca/mvc` framework contains several base components that can be extended (or used directly) and then assembled to create your own application.

## Models and Collections
`lavaca/mvc` features two base types for data objects: `lavaca/mvc/Model`, for individual data objects, and `lavaca/mvc/Collection`, for sets of data objects. These model types contain methods for getting, setting, validating, and submitting data in an intelligent, event-driven manner.

For more about models and collections, see [Models and Collections](Models-and-Collections).

## Views and the View Manager
The base view type, `lavaca/mvc/View`, is responsible for rendering a template to the DOM and managing the user interactions associated with that specific region. Views support nesting multiple views instances inside each other, called `childViews`. A `childView` can all also have its own `childViews`, and those `childViews` can have children of their own etc.
 
Any view type can also be used as a Page View. A Page View is used to represent each screen in your application. Each Page View interfaces with the View Manager to control the entering and exiting of different pages.

The `lavaca/mvc/ViewManager` is responsible for managing what Page Views are shown at any given time, and orchestrating the traffic as different Page Views need to come and go.

For more about Views and the View Manager, see [Views and the View Manager](Views-and-the-View-Manager).

## Controllers and Routes
`lavaca/mvc/Controller`-derived types are responsible for setting off series of actions, like showing a view and saving a history state or logging the user in and out. Controllers combine the different components of the `lavaca/mvc` framework together into a cohesive application. Like with views, you'll always want to extend `lavaca/mvc/Controller` to create your own controllers.

Web apps are usually driven by URLs, we are talking about the Web here, and `lavaca/mvc`-based apps are no exception. The `lavaca/mvc/Router` is responsible for associating controller methods with URL patterns (a "route" of the type `lavaca/mvc/Route`), detecting URL changes, breaking the URL into data parameters, and executing controller methods. The router plays a similar role with controllers as the view manager does with views.

For more about controllers and routes, see [Controllers and Routes](Controllers-and-Routes).

# Implementing `lavaca/mvc` in Your Application
To use `lavaca/mvc` in your app, you'll need to do a few things:

1. Create model types for each API data object
1. Create view types for each screen
1. Create controller types and methods for each action
1. Register your controller methods with the router
1. Navigate to your home page

## Recommended Structure
You should keep your application's code separate from the `lavaca/mvc` code. Under `js/app` (your application-specific JavaScript folder) create these subfolders:

* `js/app/models` - This folder will contain your custom model types
* `js/app/net` - This folder will contain your custom controller types
* `js/app/ui/views` - This folder will contain your custom view types

Every MVC type in your application should have its own distinct file and should extend the base `lavaca/mvc` types.

Additionally, you should have a file `js/app/app.js`. This file will be responsible for conducting all initial setup activity for your application.

## Creating Your Model Types
You'll find that, of the `lavaca/mvc` core types, you'll need the fewest `lavaca/mvc/Model`-derived types in your app. You might create addition model and collection types too:

* Override server communication operations, like the `fetch()` and `saveToServer()` methods
* Setup default validation rules
* Add helper or convenience methods

See [Models and Collections](Models-and-Collections) for more information about and best practices for using `lavaca/mvc/Model` and `lavaca/mvc/Collection`.

## Creating Your View Types
You'll typically want to create a base view from which all other page views in your app extend. This base view type should contain all of the basic entry/exit transition logic, common UI elements, and any custom templating or rendering logic needed for your app.

A good rule of thumb for your other page view types is that they should stay as lean as possible. Try to think of them more as configurations for templates than as full-blown types. At a minimum, you should end up with at least one view type for every page template.

An example of a simple view:

    define(function(require) {
    
      var BaseView = require('app/ui/views/BaseView');
      require('rdust!templates/home');

      var HomeView = BaseView.extend(function() {
        BaseView.apply(this, arguments);
        this.mapEvent('button', 'tap', this.onClickButton);
      }, {
        template: 'templates/home',
        onTapButton: function(e) {
          e.preventDefault();
          alert('You tapped the button!');
        }
      });

      return HomeView;
    
    });

See [Views and the View Manager](Views-and-the-View-Manager) for more information about and best practices for extending `lavaca/mvc/View`.

## Creating Your Controller Types
You may want to create a base controller type for your app (similar to a base view type), but it's not required in all cases. A base controller could override basic behaviors or provide helper methods for all its subtypes.

Controller types should usually contain only action methods. These are the methods that are registered with URLs and kick off sequences of functionality in your app. All controller actions should return an `lavaca/util/Promise`, so be sure that you've read up on the [Promises Pattern](Promises-Pattern).

As you write your controllers, keep supporting a history state as well as new navigation in mind.

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

See [Controllers and Routes](Controllers-and-Routes) for more information about and best practices for extending `lavaca/mvc/Controller`.

## Instantiate the Application
You will generally use `lavaca/mvc/Application` out-of-the-box for your project (though you can extend it to modify its functionality if necessary).

In your `app/app.js`, you should see a variable `app` being instantiated from `lavaca/mvc/Application` and passing in a callback function to the constructor. This callback executes when the document and all API's are ready for use. Inside this callback is where your app's routes should be assigned and where other high-level objects should be instantiated.

For example:

    define(function(require) {

      var Application = require('lavaca/mvc/Application'),
          History = require('lavaca/net/History'),
          HomeController = require('app/net/HomeController'),
          AuthenticationController = require('app/net/AuthenticationController');
      // Enable Hash URLs
      History.overrideStandardsMode();    
  
      var app = new Application(function() {
        this.router.add({
          '/': [HomeController, 'home'],
          '/sign-in': [AuthenticationController, 'signIn'],
          '/sign-in/submit': [AuthenticationController, 'signInSubmit'],
          '/sign-out': [AuthenticationController, 'signOut']
        });
      });
    
      return app;
    
    });

You can fully customize the behavior of your application by extending and overriding the different properties and methods of `lavaca/mvc/Application`.

## Triggering a Route
The `lavaca/mvc/Router` module returns a singleton instance of the Router object. Using the router directly by calling its `exec()` method (or the `Lavaca.mvc.Controller` routing helper methods) should be the main way that you manage the user's flow through the application.

Here is an example of routing to `/sign-in`

    var router = require('lavaca/mvc/Router');
    // the route to execute, the history state, and params to pass to the controller action
    router.exec('/sign-in', null, {rememberMe: true});

For more information about `lavaca/mvc/Router`, see [Controllers and Routes](Controllers-and-Routes).