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
    var originalDefault;
    if (typeof defaultValue === 'number') {
      originalDefault = defaultValue = {
        x: defaultValue,
        y: defaultValue,
        z: defaultValue
      };
    } else if (typeof defaultValue === 'object') {
      originalDefault = {
        x: defaultValue.x,
        y: defaultValue.y,
        z: defaultValue.z
      };
    }

    if (typeof option === 'object') {
      for (var prop in option) {
        result[prop] = option[prop];
      }
    } else if (typeof option === 'number' || typeof option === 'string') {
      defaultValue = {
        x: option,
        y: option,
        z: option
      };
    }
    if (mainOnly) {
      result.x = (result.x || result.x === 0) ? result.x : originalDefault.x;
      result.y = (result.y || result.y === 0) ? result.y : originalDefault.y;
    } else {
      result.x = (result.x || result.x === 0) ? result.x : defaultValue.x;
      result.y = (result.y || result.y === 0) ? result.y : defaultValue.y;
    }
    result.z = (result.z || result.z === 0) ? result.z : defaultValue.z;

    return result;
  }
  function getDifference(initial, result) {
    var diff;
    if (typeof initial === 'object') {
      diff = {};
      for (var prop in initial) {
        diff[prop] = result[prop] - initial[prop];
      }
    } else if (typeof initial === 'number' || typeof result === 'number') {
      diff = (result || 0) - (initial || 0);
    }
    return diff;
  }
  function getResultState(initial, difference) {
    var result;
    if (typeof initial === 'object') {
      result = {};
      for (var prop in initial) {
        result[prop] = initial[prop] + difference[prop];
      }
    } else if (typeof initial === 'number' || typeof difference === 'number') {
      result = (initial || 0) + (difference || 0);
    }
    return result;
  }

  Springer.generateKeyframes = function(options, element) {
    var initialData = element && element.data() ? element.data() : {};
    options = options || {};

    if (options.initialState) {
      $.extend(initialData, options.initialState);
    }
    options.initial = initialData;
    //options.differences = options.differences || {};
    this.tension = (options.tension && options.tension >= 1) ? options.tension : undefined;
    this.friction = (options.friction && options.friction > 0) ? options.friction : undefined;

    this.setInitialState(options.initial);
    if (options.differences) {
      this.setDifferences(options.differences);
      this.determineResultState();
    } else {
      this.setResultState(options.resultState || {});
      this.determineDifferences();
    }

    this.curve = SpringCurve(this.tension, this.friction);
    this.element = element;
    return this.generate();
  };

  Springer.setInitialState = function(initial) {
    this.initial = {
      scale: getTransformFunction(initial.scale, 1),
      translate: getTransformFunction(initial.translate, 0),
      rotate: getTransformFunction(initial.rotate, 0, true),
      skew: getTransformFunction(initial.skew, 0),
      perspective: initial.perspective || undefined
    };
    return this.initial;
  };

  Springer.setDifferences = function(diff) {
    this.differences = {
      scale: getTransformFunction(diff.scale, 0),
      translate: getTransformFunction(diff.translate, 0),
      rotate: getTransformFunction(diff.rotate, 0, true),
      skew: getTransformFunction(diff.skew, 0),
      perspective: diff.perspective || 0
    };
    return this.differences;
  };

  Springer.setResultState = function(result) {
    this.resultState = {
      scale: getTransformFunction(result.scale || 1, this.initial.scale),
      translate: getTransformFunction(result.translate || 0, this.initial.translate),
      rotate: getTransformFunction(result.rotate || {x:0,y:0,z:0}, this.initial.rotate, true),
      skew: getTransformFunction(result.skew || 0, this.initial.skew),
      perspective: result.perspective || undefined
    };
    return this.resultState;
  };

  Springer.determineDifferences = function() {
    this.differences = {};
    for (var prop in this.resultState) {
      this.differences[prop] = getDifference(this.initial[prop], this.resultState[prop]);
    }
    return this.differences;
  };

  Springer.determineResultState = function() {
    this.resultState = {};
    for (var prop in this.differences) {
      this.resultState[prop] = getResultState(this.initial[prop], this.differences[prop]);
    }
    return this.resultState;
  };

  Springer.generate = function() {
    var length = this.curve.length;
    var originalDirection = true;
    var currentTransform;
    this.keyframes = {};
    if (this.element) {
      this.element.data(this.resultState);
    }

    this.setKeyframeStep(0, this.initial);
    this.setKeyframeStep(100, this.resultState);

    for (var i = 1; i < length; ++i) {
      if ((originalDirection && this.curve[i] <= this.curve[i - 1])
        || (!originalDirection && this.curve[i] > this.curve[i - 1])) {

        currentTransform = {
          scale: this.getStepTransformValues('scale', this.curve[i], 3, 1),
          skew: this.getStepTransformValues('skew', this.curve[i], 2, 0),
          rotate: this.getStepTransformValues('rotate', this.curve[i], 3, 0),
          translate: this.getStepTransformValues('translate', this.curve[i], 3, 0),
          perspective: this.getStepTransformValues('perspective', this.curve[i])
        };
        this.setKeyframeStep((i/length*100).toFixed(3), currentTransform);
        originalDirection = !originalDirection;
      }
    }

    return this.keyframes;
  };

  Springer.setKeyframeStep = function(stepNumber, toTransform) {
    var frame = {
      'animation-timing-function': 'ease-in-out',
      'transform': this.createTransform(toTransform)
    };
    if (this.keyframes) {
      this.keyframes[stepNumber+'%'] = frame;
    }

    return frame;
  };

  Springer.getStepTransformValues = function(type, curve, depth, defaultValue) {
    var step = {};
    depth = depth || 3;
    if (typeof this.differences[type] === 'object') {
      if (depth > 2) {
        step.z = this.getStepTransformValue(this.initial[type].z, curve, this.differences[type].z, defaultValue);
      }
      step.y = this.getStepTransformValue(this.initial[type].y, curve, this.differences[type].y, defaultValue);
      step.x = this.getStepTransformValue(this.initial[type].x, curve, this.differences[type].x, defaultValue);
    } else {
      step = this.getStepTransformValue((this.initial[type] || 0), curve, this.differences[type]);
    }

    return step;
  };
  Springer.getStepTransformValue = function(initial, curve, diff, defaultValue) {
    if (typeof diff === 'number' && diff !== 0) {
      return (initial + (curve / (100)) * diff);
    } else if (defaultValue !== undefined && defaultValue !== initial) {
      return initial;
    }
    return undefined;
  };

  Springer.createTransform = function(options) {
    var theTransform = this.createTranslate3d(options.translate) +
      this.createScale3d(options.scale) +
      this.createRotate(options.rotate) +
      this.createSkew(options.skew) +
      this.createPerspective(options.perspective);

    return theTransform;
  };

  Springer.createTranslate3d = function(translate) {
    if (translate.x !== undefined
      || translate.y !== undefined
      || translate.z !== undefined) {

      return ' translate3d('+
        (translate.x || 0) + 'px'+','+
        (translate.y || 0) + 'px'+','+
        (translate.z || 0) + 'px'+')';
    }
    return '';
  };
  Springer.createScale3d = function(scale) {
    if (scale.x !== undefined
      || scale.y !== undefined
      || scale.z !== undefined) {

      return ' scale3d('+ ((scale.x || scale.x === 0) ? scale.x : 1)+','+
              ((scale.y || scale.y === 0) ? scale.y : 1)+','+
              ((scale.z || scale.z === 0) ? scale.z : 1)+')';
    }
    return '';
  };
  Springer.createRotate = function(rotate) {
    var rotation = '';
    if (rotate.x !== undefined) {
      rotation += ' rotateX('+(rotate.x)+'deg)';
    }
    if (rotate.y !== undefined) {
      rotation += ' rotateY('+(rotate.y)+'deg)';
    }
    if (rotate.z !== undefined) {
      rotation += ' rotateZ('+(rotate.z)+'deg)';
    }
    return rotation;
  };
  Springer.createSkew = function(skew) {
    var transform = '';
    if (skew.x !== undefined) {
      transform += ' skewX('+(skew.x)+'deg)';
    }
    if (skew.y !== undefined) {
      transform += ' skewY('+(skew.y)+'deg)';
    }
    return transform;
  };
  Springer.createPerspective = function(perspective) {
    if (perspective !== undefined) {
      return ' perspective(' + perspective + ')';
    }
    return '';
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
     * @opt {Object} initialState  Initial transform values. If element has previously been transformed with a spring, the initialState values will be merged into the result of the previous transformation
     * @default { scale: 1, translate: 0, rotate: 0, skew: 0, perspective: undefined }
     * @opt {Object} differences  Differences between initial and final transform values
     * @default { scale: 0, translate: 0, rotate: 0, skew: 0, perspective: undefined }
     * @opt {Object} resultState  Final transform values. If differences are specified, resultState will be ignored
     * @default { scale: 1, translate: 0, rotate: 0, skew: 0, perspective: undefined }
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
      theKeyframes = Springer.generateKeyframes(springOptions, this);
      this.keyframe(theKeyframes, keyframeOptions);
    }
    return this;
  };

  return Springer;

});
