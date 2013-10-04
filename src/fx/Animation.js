define(function(require) {

  var $ = require('$'),
      Transform = require('./Transform');

  var Animation = {};

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
   * Static utility type for working with CSS keyframe animations
   * @class lavaca.fx.Animation
   */

  /**
   * Whether or not animations are supported by the browser
   * @method isSupported
   * @static
   *
   * @return {Boolean}  True if CSS keyframe animations are supported
   */
  Animation.isSupported = function() {
    return !!_prop;
  };

  /**
   * Gets the name of the animation end event
   * @method animationEndEvent
   * @static
   *
   * @return {String}  The name of the event
   */
  Animation.animationEndEvent = function() {
    return _event;
  };

  /**
   * Converts a list of keyframes to a CSS animation
   * @method keyframesToCSS
   * @static
   *
   * @param {String} name  The name of the keyframe animation
   * @param {Object} keyframes  A list of timestamped keyframes in the form {'0%': {color: 'red'}, '100%': 'color: blue'}
   * @return {String}  The CSS keyframe animation declaration
   */
  Animation.keyframesToCSS = function(name, keyframes) {
    var css = ['@', _declaration, ' ', name, '{'],
    time,
    keyframe,
    prop,
    value;
    for (time in keyframes) {
      css.push(time, '{');
      keyframe = keyframes[time];
      if (typeof keyframe === 'string') {
        css.push(keyframe);
      } else {
        for (prop in keyframe) {
          value = keyframe[prop];
          if (prop === 'transform' && Transform) {
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
   * Generates a keyframe animation
   * @method generateKeyframes
   * @static
   *
   * @param {Object} keyframes  A list of timestamped keyframes in the form {'0%': {color: 'red'}, '100%': 'color: blue'}
   * @return {String}  The name fo the animation
   */
  /**
   * Generates a keyframe animation
   * @method generateKeyframes
   * @static
   * @param {String} name  The name of the animation
   * @param {Object} keyframes  A list of timestamped keyframes in the form {'0%': {color: 'red'}, '100%': 'color: blue'}
   * @return {String}  The name fo the animation
   */
  Animation.generateKeyframes = function(name, keyframes) {
    if (typeof name === 'object') {
      keyframes = name;
      name = 'a' + new Date().getTime();
    }
    var css = Animation.keyframesToCSS(name, keyframes);
    $('<style>' + css + '</style>').appendTo('head');
    return name;
  };

  /**
   * Gets the name of the animation CSS property
   * @method cssProperty
   * @static
   *
   * @return {String}  The name of the CSS property
   */
  Animation.cssProperty = function() {
    return _cssProp;
  };

  /**
   * Applies a keyframe animation to an element
   * @method $.fn.keyframe
   *
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
   */
  /**
   * Applies a keyframe animation to an element
   * @method $.fn.keyframe
   *
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
   */
  /**
   * Applies a keyframe animation to an element
   * @method $.fn.keyframe
   *
   * @param {String} name  The name of the animation
   * @param {Number} duration  The number of milliseconds that the animation lasts
   * @param {String} easing  The name of a CSS easing function
   * @param {Number} delay  The number of milliseconds before the animation should start
   * @param {Object} iterations  Either the number of iterations to play the animation or 'infinite'
   * @param {String} direction  The name of a CSS animation direction
   * @param {Function} callback  A function to execute when the animation has completed
   * @return {jQuery}  The jQuery object, for chaining
   *
  */
  /**
   * Applies a keyframe animation to an element
   * @method $.fn.keyframe
   *
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
    if (Animation.isSupported()) {
      if (typeof name === 'object') {
        name = Animation.generateKeyframes(name);
      }
      if (typeof duration === 'object') {
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
      if (typeof duration === 'number') {
        duration += 'ms';
      }
      if (typeof delay === 'number') {
        delay += 'ms';
      }
      if (callback) {
        this.nextAnimationEnd(callback);
      }
      this.css(Animation.cssProperty(), [name, duration, easing, delay, iterations, direction].join(' '));
    }
    return this;
  };

  /**
   * Binds an animation end handler to an element.
   * @method $.fn.animationEnd
   *
   * @param {Function} callback  Callback for when the animation ends
   * @return {jQuery}  This jQuery object, for chaining
   *
  /**
   * Binds an animation end handler to an element.
   * @method $.fn.animationEnd
   *
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
   * Binds an animation end handler to an element's next animation end event
   * @method $.fn.nextAnimationEnd
   *
   * @param {Function} callback  Callback for when the animation ends
   * @return {jQuery}  This jQuery object, for chaining
   */
  /**
   * Binds an animation end handler to an element's next animation end event
   * @method $.fn.nextAnimationEnd
   *
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

  return Animation;

});
