/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $) {

var _props = {
      animation: ['animation', 'animationend', 'keyframes'],
      webkitAnimation: ['-webkit-animation', 'webkitAnimationEnd', '-webkit-keyframes'],
      MozAnimation: ['-moz-animation', 'animationend', '-moz-keyframes'],
      OAnimation: ['-o-animation', 'oAnimationEnd', '-o-keyframes'],
      MSAnimation: ['-ms-animation', 'MSAnimationEnd', '-ms-keyframes']
    },
    _prop,
    _cssProp,
    _declaration,
    _event;

(function() {
  var style = document.createElement('div').style,
      s,
      opts;
  for (s in _props) {
    if (s in style) {
      opts = _props[s];
      _prop = s;
      _cssProp = opts[0];
      _event = opts[1];
      _declaration = opts[2];
      break;
    }
  }
})();

/**
 * @class Lavaca.fx.Animation
 * Static utility type for working with CSS keyframe animations
 */

/**
 * @method isSupported
 * @static
 * Whether or not animations are supported by the browser
 *
 * @return {Boolean}  True if CSS keyframe animations are supported
 */
ns.isSupported = function() {
  return !!_prop;
};

/**
 * @method keyframesToCSS
 * @static
 * Converts a list of keyframes to a CSS animation
 *
 * @param {String} name  The name of the keyframe animation
 * @param {Object} keyframes  A list of timestamped keyframes in the form {'0%': {color: 'red'}, '100%': 'color: blue'}
 * @return {String}  The CSS keyframe animation declaration
 */
ns.keyframesToCSS = function(name, keyframes) {
  var Transform = Lavaca.fx.Transform,
      css = ['@', _declaration, ' ', name, '{'],
      time,
      keyframe,
      prop,
      value;
  for (time in keyframes) {
    css.push(time, '{');
    keyframe = keyframes[time];
    if (typeof keyframe == 'string') {
      css.push(keyframe);
    } else {
      for (prop in keyframe) {
        value = keyframe[prop];
        if (prop == 'transform' && Transform) {
          prop = Transform.cssProperty();
          value = Transform.toCSS(value);
        }
        css.push(prop, ':', value, ';');
      }
    }
    css.push('}');
  }
  css.push('}');
  return css.join('');
};

/**
 * @method generateKeyframes
 * @static
 * Generates a keyframe animation
 *
 * @sig
 * @param {Object} keyframes  A list of timestamped keyframes in the form {'0%': {color: 'red'}, '100%': 'color: blue'}
 * @return {String}  The name fo the animation
 *
 * @sig
 * @param {String} name  The name of the animation
 * @param {Object} keyframes  A list of timestamped keyframes in the form {'0%': {color: 'red'}, '100%': 'color: blue'}
 * @return {String}  The name fo the animation
 */
ns.generateKeyframes = function(name, keyframes) {
  if (typeof name == 'object') {
    keyframes = name;
    name = 'a' + (new Date).getTime();
  }
  var css = ns.keyframesToCSS(name, keyframes);
  $('<style>' + css + '</style>').appendTo('head');
  return name;
};

/**
 * @method cssProperty
 * @static
 * Gets the name of the animation CSS property
 *
 * @return {String}  The name of the CSS property
 */
ns.cssProperty = function() {
  return _cssProp;
};

/**
 * @method $.fn.keyframe
 * Applies a keyframe animation to an element
 *
 * @sig
 * @param {String} name  The name of the animation
 * @param {Object} options  Options for the animation
 * @opt {Number} duration  The number of milliseconds that the animation lasts
 * @opt {String} easing  The name of a CSS easing function
 * @default 'linear'
 * @opt {Number} delay  The number of milliseconds before the animation should start
 * @default 0
 * @opt {Object} iterations  Either the number of iterations to play the animation or 'infinite'
 * @default 1
 * @opt {String} direction  The name of a CSS animation direction
 * @default 'normal'
 * @opt {Function} complete  A function to execute when the animation has completed
 * @default null
 * @return {jQuery}  The jQuery object, for chaining
 *
 * @sig
 * @param {Object} keyframes  A list of timestamped keyframes in the form {'0%': {color: 'red'}, '100%': 'color: blue'}
 * @param {Object} options  Options for the animation
 * @opt {Number} duration  The number of milliseconds that the animation lasts
 * @opt {String} easing  The name of a CSS easing function
 * @default 'linear'
 * @opt {Number} delay  The number of milliseconds before the animation should start
 * @default 0
 * @opt {Object} iterations  Either the number of iterations to play the animation or 'infinite'
 * @default 1
 * @opt {String} direction  The name of a CSS animation direction
 * @default 'normal'
 * @opt {Function} complete  A function to execute when the animation has completed
 * @default null
 * @return {jQuery}  The jQuery object, for chaining
 *
 * @sig
 * @param {String} name  The name of the animation
 * @param {Number} duration  The number of milliseconds that the animation lasts
 * @param {String} easing  The name of a CSS easing function
 * @param {Number} delay  The number of milliseconds before the animation should start
 * @param {Object} iterations  Either the number of iterations to play the animation or 'infinite'
 * @param {String} direction  The name of a CSS animation direction
 * @param {Function} callback  A function to execute when the animation has completed
 * @return {jQuery}  The jQuery object, for chaining
 *
 * @sig
 * @param {Object} keyframes  A list of timestamped keyframes in the form {'0%': {color: 'red'}, '100%': 'color: blue'}
 * @param {Number} duration  The number of milliseconds that the animation lasts
 * @param {String} easing  The name of a CSS easing function
 * @param {Number} delay  The number of milliseconds before the animation should start
 * @param {Object} iterations  Either the number of iterations to play the animation or 'infinite'
 * @param {String} direction  The name of a CSS animation direction
 * @param {Function} callback  A function to execute when the animation has completed
 * @return {jQuery}  The jQuery object, for chaining
 */
$.fn.keyframe = function(name, duration, easing, delay, iterations, direction, callback) {
  if (ns.isSupported()) {
    if (typeof name == 'object') {
      name = ns.generateKeyframes(name);
    }
    if (typeof duration == 'object') {
      callback = duration.complete;
      direction = duration.direction;
      iterations = duration.iterations;
      delay = duration.delay;
      easing = duration.easing;
      duration = duration.duration;
    }
    direction = direction || 'normal';
    iterations = iterations || 1;
    delay = delay || 0;
    easing = easing || 'linear';
    duration = duration || 1;
    if (typeof duration == 'number') {
      duration += 'ms';
    }
    if (typeof delay == 'number') {
      delay += 'ms';
    }
    if (callback) {
      this.nextAnimationEnd(callback);
    }
    this.css(ns.cssProperty(), [name, duration, easing, delay, iterations, direction].join(' '));
  }
  return this;
};

/**
 * @method $.fn.animationEnd
 * Binds an animation end handler to an element.
 *
 * @sig
 * @param {Function} callback  Callback for when the animation ends
 * @return {jQuery}  This jQuery object, for chaining
 *
 * @sig
 * @param {String} delegate  Selector for the descendant elements to which the handler will be bound
 * @param {Function} callback  Callback for when the animation ends
 * @return {jQuery}  This jQuery object, for chaining
 */
$.fn.animationEnd = function(delegate, callback) {
  if (_event) {
    return this.on(_event, delegate, callback);
  } else {
    return this;
  }
};

/**
 * @method $.fn.nextAnimationEnd
 * Binds an animation end handler to an element's next animation end event
 *
 * @sig
 * @param {Function} callback  Callback for when the animation ends
 * @return {jQuery}  This jQuery object, for chaining
 *
 * @sig
 * @param {String} delegate  Selector for the descendant elements to which the handler will be bound
 * @param {Function} callback  Callback for when the animation ends
 * @return {jQuery}  This jQuery object, for chaining
 */
$.fn.nextAnimationEnd = function(delegate, callback) {
  if (_event) {
    return this.one(_event, delegate, callback);
  } else {
    return this;
  }
};

})(Lavaca.resolve('Lavaca.fx.Animation', true), Lavaca.$);