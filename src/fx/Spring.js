define(function(require) {

  var $ = require('$'),
      Animation = require('./Animation');

  var Springer = {};

  var Spring, SpringCurve;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  var defaults = {
    tension: 50,
    friction: 0,
    velocity: 0,
    speed: 1 / 60.0,
    tolerance: 0.1
  };

  function springAccelerationForState(state) {
    return (-state.tension * state.x) - (state.friction * state.v);
  }

  function springEvaluateState(initial) {
    var output = {
      dx: initial.v,
      dv: springAccelerationForState(initial)
    };
    return output;
  }

  function springEvaluateStateWithDerivative(initial, dt, derivative) {
    var state = {
      x: initial.x + derivative.dx * dt,
      v: initial.v + derivative.dv * dt,
      tension: initial.tension,
      friction: initial.friction
    };
    var output = {
      dx: state.v,
      dv: springAccelerationForState(state)
    };
    return output;
  }

  function springIntegrateState(state, speed) {
    var a, b, c, d, dvdt, dxdt;
    a = springEvaluateState(state);
    b = springEvaluateStateWithDerivative(state, speed * 0.5, a);
    c = springEvaluateStateWithDerivative(state, speed * 0.5, b);
    d = springEvaluateStateWithDerivative(state, speed, c);
    dxdt = 1.0 / 6.0 * (a.dx + 2.0 * (b.dx + c.dx) + d.dx);
    dvdt = 1.0 / 6.0 * (a.dv + 2.0 * (b.dv + c.dv) + d.dv);
    state.x = state.x + dxdt * speed;
    state.v = state.v + dvdt * speed;
    return state;
  }

  Spring = (function() {
    function Spring(args) {
      this.next = __bind(this.next, this);
      this.reset = __bind(this.reset, this);
      args = args || {};
      this.velocity = args.velocity || defaults.velocity;
      this.tension = args.tension || defaults.tension;
      this.friction = args.friction || defaults.friction;
      this.speed = args.speed || defaults.speed;
      this.tolerance = args.tolerance || defaults.tolerance;
      this.reset();
    }

    Spring.prototype.reset = function() {
      this.startValue = 0;
      this.currentValue = this.startValue;
      this.endValue = 100;
      this.moving = true;
      return this.moving;
    };

    Spring.prototype.next = function() {
      var targetValue = this.currentValue;
      var stateBefore = {
        x: targetValue - this.endValue,
        v: this.velocity,
        tension: this.tension,
        friction: this.friction
      };
      var stateAfter = springIntegrateState(stateBefore, this.speed);
      this.currentValue = this.endValue + stateAfter.x;
      var finalVelocity = stateAfter.v;
      var netFloat = stateAfter.x;
      var net1DVelocity = stateAfter.v;
      var netValueIsLow = Math.abs(netFloat) < this.tolerance;
      var netVelocityIsLow = Math.abs(net1DVelocity) < this.tolerance;
      var stopSpring = netValueIsLow && netVelocityIsLow;
      this.moving = !stopSpring;
      if (stopSpring) {
        finalVelocity = 0;
        this.currentValue = this.endValue;
      }
      this.velocity = finalVelocity;
      return this.currentValue;
    };

    Spring.prototype.all = function() {
      var count = 0,
          results = [];
      this.reset();
      while (this.moving) {
        if (count > 3000) {
          throw Error("Spring: too many values");
        }
        count++;
        results.push(this.next());
      }

      return results;
    };

    Spring.prototype.time = function() {
      return this.all().length * this.speed;
    };

    return Spring;

  })();

  SpringCurve = function(tension, friction, velocity, fps) {
    var spring;
    spring = new Spring({
      tension: tension,
      friction: friction,
      velocity: velocity,
      speed: 1 / fps
    });
    return spring.all();
  };

  function getTransformFunction(option, defaultValue, mainOnly) {
    var result = {};
    var originalDefault = defaultValue;

    if (typeof option === 'object') {
      for (var prop in option) {
        result[prop] = option[prop];
      }
    } else if (typeof option === 'number' || typeof option === 'string') {
      defaultValue = option;
    }
    if (mainOnly) {
      result.x = result.x || originalDefault;
      result.y = result.y || originalDefault;
    } else {
      result.x = result.x || defaultValue;
      result.y = result.y || defaultValue;
    }
    result.z = result.z || defaultValue;

    return result;
  }
  function getDifferences(initial, result) {
    var diff;
    if (typeof initial === 'object') {
      diff = {};
      for (var prop in initial) {
        diff[prop] = result[prop] - initial[prop];
        if (diff[prop] !== 0) {
          diff.isDifferent = true;
        }
      }
    } else if (typeof initial === 'number' || typeof result === 'number') {
      diff = (result || 0) - (initial || 0);
    }
    return diff;
  }

  Springer.generateKeyframes = function(options) {
    options = options || {};
    options.initial = options.initialState || {};
    options.result = options.resultState || {};
    this.tension = (options.tension && options.tension >= 1) ? options.tension : undefined;
    this.friction = (options.friction && options.friction > 0) ? options.friction : undefined;
    //this.initial = this.getCurrentTransformValues();
    this.initial = {
      scale: getTransformFunction(options.initial.scale, 1),
      translate: getTransformFunction(options.initial.translate, 0),
      rotate: getTransformFunction(options.initial.rotate, 0, true),
      skew: getTransformFunction(options.initial.skew, 0),
      perspective: options.initial.perspective || undefined
    };
    this.result = {
      scale: getTransformFunction(options.result.scale, 1),
      translate: getTransformFunction(options.result.translate, 0),
      rotate: getTransformFunction(options.result.rotate, 0, true),
      skew: getTransformFunction(options.result.skew, 0),
      perspective: options.result.perspective || undefined
    };
    this.staticTransform = options.staticTransform || '';
    this.curve = SpringCurve(this.tension, this.friction);
    return this.generate();
  };

  Springer.generate = function() {
    var length = this.curve.length;
    var differences = {
      scale: getDifferences(this.initial.scale, this.result.scale),
      translate: getDifferences(this.initial.translate, this.result.translate),
      rotate: getDifferences(this.initial.rotate, this.result.rotate),
      skew: getDifferences(this.initial.skew, this.result.skew),
      perspective: getDifferences(this.initial.perspective, this.result.perspective)
    };
    var originalDirection = true;
    var keyframes = {};
    var currentTransform;

    keyframes['0%'] = {
      'animation-timing-function': 'ease-in-out',
      'transform': this.createTransform(this.initial)
    };
    keyframes['100%'] = {
      'animation-timing-function': 'ease-in-out',
      'transform': this.createTransform(this.result)
    };

    for (var i = 1; i < length; ++i) {
      if ((originalDirection && this.curve[i] <= this.curve[i - 1])
        || (!originalDirection && this.curve[i] > this.curve[i - 1])) {

        currentTransform = {
          scale: this.getStepTransformValues('scale', this.curve[i], differences, 3),
          skew: this.getStepTransformValues('skew', this.curve[i], differences, 2),
          rotate: this.getStepTransformValues('rotate', this.curve[i], differences, 3),
          translate: this.getStepTransformValues('translate', this.curve[i], differences, 3),
          perspective: this.getStepTransformValues('perspective', this.curve[i], differences)
        };
        keyframes[(i/length*100).toFixed(3)+'%'] = {
          'animation-timing-function': 'ease-in-out',
          'transform': this.createTransform(currentTransform, differences)
        };
        originalDirection = !originalDirection;
      }
    }

    return keyframes;
  };

  Springer.getStepTransformValues = function(type, curve, diffs, depth) {
    var step = {};
    depth = depth || 3;
    if (typeof diffs[type] === 'object') {
      if (depth > 2) {
        step.z = this.getStepTransformValue(this.initial[type].z, curve, diffs[type].z, diffs[type].isDifferent);
      }
      step.y = this.getStepTransformValue(this.initial[type].y, curve, diffs[type].y, diffs[type].isDifferent);
      step.x = this.getStepTransformValue(this.initial[type].x, curve, diffs[type].x, diffs[type].isDifferent);
    } else {
      step = this.getStepTransformValue((this.initial[type] || 0), curve, diffs[type], diffs[type]);
    }

    return step;
  };
  Springer.getStepTransformValue = function(initial, curve, diff, isDiff) {
    return isDiff ? (initial + (curve / (100)) * diff) : undefined;
  };

  Springer.createTransform = function(options) {
    var theTransform = this.staticTransform +
          (options.skew.x !== undefined ?
            ' skewX('+(options.skew.x)+'deg)' +
            ' skewY('+(options.skew.y)+'deg)' : '' )+
          (options.rotate.x !== undefined ?
            ' rotateX('+(options.rotate.x)+'deg)' +
            ' rotateY('+(options.rotate.y)+'deg)' +
            ' rotateZ('+(options.rotate.z)+'deg)' : '' )+
          (options.scale.x !== undefined ? ' scale3d('+
            options.scale.x+','+
            options.scale.y+','+
            options.scale.z+')' : '' )+
          (options.translate.x !== undefined ? ' translate3d('+
            options.translate.x + 'px'+','+
            options.translate.y + 'px'+','+
            options.translate.z + 'px'+')' : '' )+
          (options.perspective !== undefined ? ' perspective(' + options.perspective + ')' : '');

    return theTransform;
  };

  /**
   * Applies a spring keyframe animation to an element
   * @method $.fn.spring
   *
   * @param {String} name The name of the animation
   * @param {Object} options  Options for the spring
     * @opt {Number} tension Positive integer representing the tension on the spring
     * @default 50
     * @opt {Number} friction  Positive integer representing the friction of the spring
     * @default 2
     * @opt {Object} initialState  initial transform values
     * @default { scale: 1, translate: 0, rotate: 0, skew: 0, perspective: undefined }
     * @opt {Object} resultState  Final transform values
     * @default { scale: 1, translate: 0, rotate: 0, skew: 0, perspective: undefined }
     * @opt {String} staticTransform  The representation of a transform fragment that should be static and appended to all keyframes
   *
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
  $.fn.spring = function(name, springOptions, keyframeOptions) {
    if (Animation.isSupported()) {
      var theKeyframes;
      if (typeof keyframeOptions === 'object' && typeof name === 'string') {
        keyframeOptions.name = name;
      }
      theKeyframes = Springer.generateKeyframes(springOptions);
      this.keyframe(theKeyframes, keyframeOptions);
    }
    return this;
  };

  return Springer;

});
