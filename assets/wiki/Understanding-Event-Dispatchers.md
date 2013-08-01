# Event-Driven Architecture
You should already be familiar with at least one event model–DOM events, like `mouseover` and `click`, are a key part of JavaScript programming. In any event-driven architecture, different parts of the program are called asynchronously in response to a change in state. With the click event, for instance, a change in the state of the mouse button may set off a series of different actions in your program. Without events, programs would have to run in a very linear way.

The idea of an event model can be applied not only to user interaction, but also to the state of individual objects in the application. For example, a data model could have several properties with different validation rules associated with them. When one of those properties was judged to be invalid, the data model could dispatch an event.

The best part of an event-driven architecture is that it allows a clean compartmentalization of code. In the above example, when using events, anything that cares whether or not the data model is in a valid state can simply listen for valid and invalid events from the model and be notified of any change. Without using events, the model object itself has to be aware of every other part of the application that might care about the model's state.

# The Lifecycle of an Event

1. Some sort of state change occurs, usually user input or a method being called, triggering an event
1. The subject of the state change, the event dispatcher, creates an event object using data related to the state change
1. The event dispatcher invokes each callback function, event listener, that's registered for that type of event, and passes each of them the event object
1. The program resumes its regular flow

# Creating an Event Dispatcher
The event dispatcher module in Lavaca lives in `lavaca/events/EventDispatcher`. It extends from the [disposable](Understanding-Disposables) type. The majority of the classes within the core mvc modules in Lavaca extend from EventDispatcher, such as Model, View, and Application. On it's own, an EventDispatcher module can be used to facilitate communication between other modules.  

    var EventDispatcher = require('lavaca/events/EventDispatcher');
    var MyEventDispatcher = EventDispatcher.extend(function(){
      EventDispatcher.apply(this, arguments);
      //any other constructor specific code
      },{
      //add new methods, or override existing methods
      });

To then instantiate an event dispatcher:
    var MyEventDispatcher = require('location/of/new/eventdispatcher');
    var dispatcher = new MyEventDispatcher();

# Using an Event Dispatcher
An event dispatcher has a handful of basic methods that allow you to interact with the event system.

## Triggering an Event
In order to cause an event, the dispatcher's `trigger()` method must be invoked.

    dispatcher.trigger('invalid');

This will create an event object and cause all of the event's listeners to execute in order. The above code passes an event object to handlers that looks like this:

    {
      type: 'invalid',
      target: dispatcher,
      currentTarget: dispatcher
    }

The `type` property of an event object describes the kind of event it is. The `target` property of an event object contains the dispatcher that originally caused the event. The `currentTarget` property of the event object contains the dispatcher that caused the most recent iteration of the event.

In most cases, the `target` and `currentTarget` properties should be the same. There may be instances where you want to "bubble up" an event from one dispatcher to another, however, where the two would differ. For example, `lavaca/mvc/Collection` bubbles up validation and change events from the `lavaca/mvc/Model` objects that it contains. In these instances, `target` would refer to the model causing the event, and `currentTarget` would refer to the collection bubbling the event up.

You can supply additional data to the event object by passing in parameters when you trigger an event:

    dispatcher.trigger('invalid', {field: 'name', value: '1234'});

This places data directly on the event object:

    {
      type: 'invalid',
      target: dispatcher,
      currentTarget: dispatcher,
      field: 'name',
      value: '1234'
    }

Listeners can then use that data to change the way that they execute.

## Listening for an Event
Use the dispatcher's `on()` method to register a function to execute whenever a specific type of event occurs.

    dispatcher.on('invalid', function(e) {
      alert('Something was invalid!');
    });

By default, the execution context of the listener (the `this` keyword) is scoped to be the event dispatcher. You can specify an alternate value for the execution context when you register the listener.

    var thisp = {foo: 'bar'};
    dispatcher.on('invalid', function(e) {
      alert(this.foo); // alerts "bar"
    }, thisp);

To remove an event listener, use the dispatcher's `off()` method.

    dispatcher.off('invalid', callback);

## Suppressing Events
All dispatchers feature a `suppressEvents` property. When this property is set to `true`, that dispatcher does not trigger events.

    dispatcher.on('invalid', function(e) {
      alert(e.field);
    });
    dispatcher.suppressEvents = true;
    dispatcher.trigger('invalid', {field: 'foo'}); // does nothing
    dispatcher.suppressEvents = false;
    dispatcher.trigger('invalid', {field: 'foo'}); // alerts "foo"

You can restore event triggering by setting `suppressEvents` to `false`.