# Understanding Views

## What is a View?
A **view** is a type that's used to present data and to capture the user's input. Views should organize your DOM into logical divisions that can update independently as the model changes.
  
Views are constructed from four main components:

* **A model** - The data used to render the view
* **A template** - A layout used to format and render the model as HTML
* **Event handlers** - Functions that handle user input or model events
* **Child Views** - Other view types bound to elements within the parent view's template
* **Widgets** - Rich UI elements that function as self-contained units, like an image loader (see [Understanding and Creating Widgets](Understanding-and-Creating-Widgets))

## Views and Models
Views should be dumb. As little business logic as possible should be placed in the view layer (put the validation logic into your models and the rest into your controllers). Views should focus primarily on presenting data, not on managing it.

Your application should always feature clean models that structure data in a way that's easy for the view to consume. When using an API, your application's model types should do the work of translating the API's data model to your application's view data model.

This approach also helps your application be more stable and resistant to changes that are introduced in an API. When you use your API data models directly as your view data models, any change to the API data model forces you to modify not only your business logic, but also impacts your views and templates. By adding view data model types to your app, you provide a buffer against these kinds of issues.

View types should be built expecting the model to be structured in a specific way, and it's the job of the controller to supply views with a model matching that structure. Views should never be concerned with getting the model or reformatting the model and should always expect to receive a model in the desired structure.

For more information on models, see [Models and Collections](Models-and-Collections).

For more information on controllers, see [Controllers and Routes](Controllers-and-Routes).

## Templates
Templates are the tools that views use to build out their HTML code. Templates are separate entities from views, and the same template may be used by multiple view types.

Templates all derive from `lavaca/ui/Template`. The view feeds its template the view data model, and the template is renders the HTML code. The view is agnostic to the specific mechanisms that the template uses to do this, so you can use any client-side templating engine you like with `lavaca/mvc`.

By default, `lavaca/mvc` is setup to use dust.js templates. For more information about templates, see [Using Templates to Generate HTML](Using-Templates-to-Generate-HTML).

## Page Views
Page Views are views that interface with the View Manager to control page transitions. Any View can be used as a Page View. Generally, there will be one page view type for every different kind of screen that your user will encounter. In your application, you might have a page view for the home screen, a page view for a sign-in screen, a page view for a profile screen, and so on. It's not just pages though: even dialogs in your application can be thought of as page views.

## Entering and Exiting
Every page view is responsible for managing the visual transitions involved when it enters the screen or exits the screen. When the view manager adds a page view, it will call that view's `enter()` method. When the view manager wants to remove a page view, it will call that view's `exit()` method.

The `enter()` and `exit()` methods of a page view should return promises that resolve when that view's transition is complete. This allows the view manager to coordinate the actions of the page views with one another.

For more information about promises, see [Promises Pattern](Promises-Pattern).

# Creating a View

## Using a Base View Type
You'll generally want to create a view type for your application from which all other page views extend. By default, the boilerplate project includes `app/ui/views/BaseView`, which extends the basic `lavaca/mvc/View` type to support animated transitions.

Using a base view type allows you to share common behaviors between page views and makes them work in a consistent way. You can also use a base view type to initialize common types of widgets and universal event handlers. For instance, if you had a help button that displayed a popover when tapped, you could create a widget/view type for this and put its initialization logic into your base view.

## Extending `lavaca/mvc/View` or `app/ui/views/BaseView`
Beyond the base view, you should try to keep your page views as lean as possible - more like configurations than full-blown types. You'll usually have at least one page view type for every page used by your app.

The directory structure is merely convention, but a common pattern is to add view types in the source folder `js/app/ui/views`. Every view type should have its own file, and the name of the type should end in `View`. It also common to further separate other view types in sub folders `app/ui/views/controls` or `app/ui/views/pageviews`

A typical view type might look like this:

    define(function('require') {

      var BaseView = require('app/ui/views/BaseView'),
          FormWidget = require('app/ui/FormWidget'),
          VideoView = require('app/ui/views/VideoView');
      require('rdust!templates/home');

      var HomeView = BaseView.extend(function() {
        BaseView.apply(this, arguments);
        this
          .mapChildView('video', VideoView, new Model())
          .mapWidget('form', FormWidget)
          .mapEvent('button', 'click', this.onClickButton);
      }, {
        template: 'home',
        onClickButton: function(e) {
          e.preventDefault();
          alert('You clicked the button!');
        }
      });
    
    });

The above page view uses the template named `home`, sets up a `app/ui/views/VideoView` child view on the `<video>` elements, sets up the `lavaca/ui/FormWidget` widget on `<form>` elements, and sets up a click event handler for `<button>` elements.

When a view is instantiated, it's not necessarily rendered right away. Because of this fact, you can't rely on the view's root element and content existing inside of the view's constructor function. To work around this, views use an `eventMap`, `childViewMap`, and a `widgetMap` to register the events, child views, and widgets that must be bound and instantiated after the view is rendered.

### Adding Event Handlers to Your View
To bind an event handler, use the view's `mapEvent()` method:

    this.mapEvent(delegate, eventType, callback);

...or alternately, if mapping multiple events:

    this.mapEvent({
      delegate1: {
        eventType1: callback1,
        eventType2: callback2
      },
      delegate2: {
        eventType3: callback3
      }
    });

...where `delegate` is a selector for the elements to which the event handler applies (i.e., `'.foo > button'`), `eventType` is the kind of event to listen for (i.e., `'click'` or `'tap'`), and `callback` is the function that handles the event.

When the view is rendered, all of the mapped events will be delegated from the view's root element using the jQuery `on()` method.

### Adding Widgets to Your View
To instantiate a widget for each element matching a selector, use the view's `mapWidget()` method:

    this.mapWidget(selector, TWidget);

...or alternately, if mapping multiple widgets:

    this.mapWidget({
      selector1: TWidget1,
      selector2: TWidget2
    });

...where `selector` is a jQuery selector string that finds the view's descendant elements that will be come new instances of the widget (i.e., `'.scrollable'`), and `TWidget` is the `lavaca/ui/Widget`-derived type that will be created for each of those widgets.

For more information about widgets, see [Understanding and Creating Widgets](Understanding-and-Creating-Widgets).

### Adding Child Views to Your View
To instantiate a child view for each element matching a selector, use the view's `mapChildView()` method:

    this.mapChildView(selector, TView, model);

...or alternately, if mapping multiple child views:

    this.mapChildView({
      '.video': {TView: VideoView, model: new Model()},
      '.carousel': {TView: CarouselView, model: new Model()}
    });

...where `selector` is a jQuery selector string that finds the view's descendant elements that will be come new instances of the child view (i.e., `'.video'`), `TView` is the `lavaca/mvc/Widget`-derived type that will be created for each of the matched elements, and `model` is the model instance to attach to each view instance.

# Understanding the View Manager

## What is the View Manager?
The **view manager** is an object that's responsible for coordinating all of the different page views in the application. Code in your application should never create a page view directly or try to manually add a page view to the DOM. Instead, your code should instruct the view manager to load a page view. The same is true for removing a page view: Your code should call into the view manager to dismiss the page view from the screen.

`lavaca/mvc/ViewManager` is a singleton module that returns a new instance. By default, `lavaca/mvc/Application` will create a view manager for you and define a selector for its root element.

    var viewManager = require('lavaca/mvc/ViewManager');
    viewManager.setEl('#view-root');

### The View Root
Every view manager has a view root. The **view root** is an element that contains all of the application's page view elements that are displayed on screen. The contents of the view root are prone to changing, so it should typically start out as an empty element.

Because views often go through animated transitions, it's important to factor in absolute positioning when styling your view root and layers.

Generally, you'll want to be sure that the root has these styles:

    #view-root {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

And that the page views have these styles:

    .view {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

## Layers
The view manager organizes page views into layers. A **layer** is an integer assigned to each page view that's currently displayed, indicating where it appears in the stack. Layers help the view manager know where to insert a new page view element and whether or not that view is taking another's place. It is important to note there can be only one active page view per layer. So if you want a page view to render on top of the current page view leaving the current Page View untouched, the new page view should be added to a higher layer. 

## Loading a Page View
To load a pageview, you call the view manager's `load()` method:

    viewManager.load(cacheKey, TPageView, model, layer);

* `cacheKey` - A string value under which the view can be cached (or `null` to disallow caching)
* `TPageView` - The `lavaca/mvc/View`-derived type of the view to load
* `model` - The data to supply to the view
* `layer` - (Optional) The index of the UI layer on which the view will sit. Defaults to `0`.

When a view is loaded, this sequence of events occurs:

If a `cacheKey` is defined and a view is cached under that `cacheKey`:

1. The view object is loaded from cache

If no `cacheKey` was defined or no view was cached for that `cacheKey`:

1. A new `TPageView` object is created
1. The page view is rendered using the model
1. After rendering (or after loading from the cache), all page views with the same or higher layer numbers are told to exit
1. The new page view is told to enter

The `load()` method returns a promise that resolves once the new page view has finished entering and any dismissed page views have finished exiting. For more about promises, see [Promises Pattern](Promises-Pattern).

## View Caching
In some cases, it's desirable to reuse the same object for a page view instead of recreating it. Some examples of cacheable page views might be: A form that the user partially fills out and has to return to, a page with no dynamic content, or a search page that should retain its results when the user navigates away.

Because cache keys are arbitrary strings, you can control how and when page views are cached. For example, you may want to cache the home page under `'home'` and cache a specific profile page under `'profile?id=123'`.

If you wish to remove all cached views, call the view manager's `flush()` method:

    viewManager.flush();

Caching is currently specific to the session, and the cache will be lost if the user navigates away from your app.