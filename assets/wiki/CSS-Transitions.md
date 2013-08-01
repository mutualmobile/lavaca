# Introduction
One of the most powerful features that's part of CSS3 is the `transition` property. Transitions allow browsers to use a hardware graphics card to animate CSS value changes, resulting in a much smoother animation than you might otherwise get.

The `transition` property itself though, is mired in vendor prefixes and difficult to work with dynamically. Lavaca includes several helpers that abstract cross-browser differences with transitions and allow you to work with transitions in a convenient way.

# Detecting Transition Support
The `lavaca/fx/Transition` module works in a backward compatible way with browsers that don't support CSS transitions. Instead of an animation, CSS properties are just immediately set. To check whether or not `lavaca/fx/Transition` has detected support and is using transitions, you can use the `isSupported()` method.

    var Transition = require('lavaca/fx/Transition');
    if (Transition.isSupported()) {
      alert('Your browser uses transitions');
    } else {
      alert('Your browser doesn't use transitions');
    }

# Transition Helper Methods
The `lavaca/fx/Transition` module adds several helper methods to jQuery objects.

## Creating an Animated Transition
You can use the `$.fn.transition()` method to cause an element to undergo an animated transition. Much like the jQuery CSS method, simply pass in a hash of CSS properties to transition and their new values and a duration of how long the animation should play.

    $('.animateable').transition({width: '0px', height: '0px', opacity: 0}, 1000);

By default, linear easing is used to interpolate values. You can pass in the name of a CSS easing function to change this. Note: jQuery easing functions are not the same as CSS transition easing functions and are not valid values.

    $('.animateable').transition({opacity: 0}, 1000, 'ease-in-out');

You can also pass in a callback function that will execute once the transition has finished.

    $('.animateable').transition({opacity: 0}, 1000, 'ease-in-out', function(e) { alert('All done!'); });

## Binding a Transition End Callback
Just as they each have their own vendor prefix for the transition CSS property, browsers also commonly prefix transition events. Two helper functions are included to help you bind transition events.

`$.fn.transitionEnd()` allows you to bind a callback that executes whenever a transition completes.

    $('.animateable').transitionEnd(function(e) {
      alert('A transition completed');
    });

You can also supply a delegate to the `transitionEnd()` helper.

    $('.animateable').transitionEnd('.animateable', function(e) {
      alert('A transition completed');
    });

In many cases, it may be desirable to only listen for the next time a transition completes. `$.fn.nextTransitionEnd` binds a transition end handler that will execute a maximum of once.

    $('.animateable').nextTransitionEnd(function(e) {
      alert('The transition has ended. You will never see this function again.');
    });