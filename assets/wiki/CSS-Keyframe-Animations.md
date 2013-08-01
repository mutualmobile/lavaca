# Introduction
In addition to transitions, keyframe animations were also introduced with CSS3. CSS keyframe animations often take advantage of a device's graphics card, resulting in a smoother animation than you might get using JavaScript. In contrast to CSS transitions, CSS keyframe animations allow you to set multiple states along a timeline, rather than just transitioning from one state to another.

Like transitions, each browser typically requires vendor prefixes for keyframe animation properties. It's normally quite arduous to include variants for each prefix, so `lavaca/fx/Animation` abstracts much of the process.

# Detecting Keyframe Animation Support
To check whether or not `lavaca/fx/Animation` has detected support and is using transitions, you can use the `isSupported()` method.

    var Animation = require('lavaca/fx/Animation');
    if (Animation.isSupported()) {
      alert('Your browser supports animations');
    } else {
      alert('Your browser doesn't support animations');
    }

# Keyframe Animation Helper Methods
The `lavaca/fx/Animation` module adds several helper methods to jQuery objects.

## Creating a Keyframe Animation
If you want to generate a keyframe animation that can be reused throughout your application, you can use the `generateKeyframes()` function, passing in a name for the animation and keyframe values:

    var Animation = require('lavaca/fx/Animation');
    Animation.generateKeyframes('my-animation', {
      '0%': {top: '0px'},
      '85%': {top: '55px'},
      '100%': {top: '50px'}
    });

If you don't pass in an animation name, one will be automatically generated:

    var Animation = require('lavaca/fx/Animation');
    var animationName = Animation.generateKeyframes({
      '0%': {top: '0px'},
      '85%': {top: '55px'},
      '100%': {top: '50px'}
    });

You can use the `$.fn.keyframe()` method to cause an element to animate. In its simplest form, pass in the name of your animation and a duration in milliseconds:

    $('.animateable').keyframe('my-animation', 2000);

There's a full range of options you can pass to the `$.fn.keyframe()` function in the form of a settings hash:

    $('.animateable').keyframe('my-animation', {
      duration: 2000,
      easing: 'linear',
      delay: 0,
      iterations: 1,
      direction: 'normal'
    });

If you want to dynamically generate a keyframe animation, you can pass in an object containing CSS keyframe data instead of an existing animation's name:

    $('.animateable').keyframe({
      '0%': {top: '0px'},
      '85%': {top: '55px'},
      '100%': {top: '50px'}
    }, {
      duration: 2000,
      easing: 'linear',
      delay: 0,
      iterations: 1,
      direction: 'normal'
    });

The `lavaca/fx/Animation` module also takes advantage of the `lavaca/fx/Animation` module's abstractions to simplify complex animations:

    $('.animateable').keyframe({
      '0%': {
        opacity: 0,
        transform: {translateY: 0}
      },
      '85%': {
        opacity: 0.85,
        transform: {translateY: 55}
      },
      '100%': {
        opacity: 1,
        transform: {translateY: 50}
      }
    }, {
      duration: 2000,
      easing: 'ease-in-out'
    });

You can also pass in a callback function that will execute once the animation has finished.

    $('.animateable').keyframe('my-animation', {
      complete: function(e) {
        alert('All done!');
      }
    });

## Binding an Animation End Callback
Just as they each have their own vendor prefix for the animation CSS property, browsers also commonly prefix animation events. Two helper functions are included to help you bind animation events.

`$.fn.animationEnd()` allows you to bind a callback that executes whenever an animation completes.

    $('.animateable').animationEnd(function(e) {
      alert('An animation completed');
    });

You can also supply a delegate to the `animationEnd()` helper.

    $('.animateable').animationEnd('.animateable', function(e) {
      alert('An animation completed');
    });

In many cases, it may be desirable to only listen for the next time an animation completes. `$.fn.nextAnimationEnd` binds an animation end handler that will execute a maximum of once.

    $('.animateable').nextAnimationEnd(function(e) {
      alert('The animation has ended. You will never see this function again.');
    });
