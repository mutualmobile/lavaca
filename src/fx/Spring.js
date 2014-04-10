define(function(require) {

  var $ = require('$'),
      Animation = require('./Animation');

  var Springer = {};

  var Spring, SpringCurve;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  var defaults = {
    tension: 50,
    friction: 2,
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

  Springer.generateKeyframes = function(options) {
      options = options || {};
      options.initial = options.initial || {};
      options.result = options.result || {};
      this.tension = options.tension;
      this.friction = options.friction;
      this.initial = {
        scale: (options.initial.scale || options.initial.scale === 0) ? options.initial.scale : 1,
        translateX: options.initial.translateX || 0,
        translateY: options.initial.translateY || 0,
        translateZ: options.initial.translateZ || 0,
      };
      this.result = {
        scale: (options.result.scale || options.result.scale === 0) ? options.result.scale : 1,
        translateX: options.result.translateX || 0,
        translateY: options.result.translateY || 0,
        translateZ: options.result.translateZ || 0,
      };
      this.staticTransform = options.staticTransform || '';
      this.curve = SpringCurve(this.tension, this.friction);
      return this.generate();
    };

    Springer.generate = function() {
      var length = this.curve.length;
      var differences = {
        scale: this.result.scale - this.initial.scale,
        translateX: (this.result.translateX - this.initial.translateX),
        translateY: (this.result.translateY - this.initial.translateY),
        translateZ: (this.result.translateZ - this.initial.translateZ)
      };
      var isScale = (differences.scale !== 0);
      var isTranslate = (differences.translateX !== 0 ||
        differences.translateY !== 0 ||
        differences.translateZ !== 0);
      var originalDirection = true;
      var keyframes = {};

      keyframes['0%'] = {
        'animation-timing-function': 'ease-in-out',
        'transform': this.staticTransform + 
              (isScale ? ' scale('+(this.initial.scale)+')' : '' )+
              (isTranslate ? ' translate3d('+
                this.initial.translateX + 'px'+','+
                this.initial.translateY + 'px'+','+
                this.initial.translateZ + 'px'+')' : '' )
      };
      keyframes['100%'] = {
        'animation-timing-function': 'ease-in-out',
        'transform': this.staticTransform + 
              (isScale ? ' scale('+(this.result.scale)+')' : '' )+
              (isTranslate ? ' translate3d('+
                this.result.translateX + 'px'+','+
                this.result.translateY + 'px'+','+
                this.result.translateZ + 'px'+')' : '' )
      };

      for (var i = 1; i < length; ++i) {
        if ((originalDirection && this.curve[i] <= this.curve[i - 1])
          || (!originalDirection && this.curve[i] > this.curve[i - 1])) {
          keyframes[(i/length*100).toFixed(3)+'%'] = {
            'animation-timing-function': 'ease-in-out',
            'transform': this.staticTransform + 
              (isScale ? ' scale('+(this.initial.scale + (this.curve[i] / (100))*differences.scale)+')' : '' )+
              (isTranslate ? ' translate3d('+
                Math.round(this.initial.translateX + (parseFloat(differences.translateX) * this.curve[i]) / 100) + 'px'+','+
                Math.round(this.initial.translateY + (parseFloat(differences.translateY) * this.curve[i]) / 100) + 'px'+','+
                Math.round(this.initial.translateZ + (parseFloat(differences.translateZ) * this.curve[i]) / 100) + 'px'+')' : '' )
          };
          originalDirection = !originalDirection;
        }
      }
      
      return keyframes;
    };















  /**
   * Applies a spring keyframe animation to an element
   * @method $.fn.spring
   *
   * @param {Object} options  Options for the spring animation
   * @opt {String} name The name of the animation
   * @opt {Number} tension Positive integer representing the tension on the spring
   * @default 50
   * @opt {Number} friction  Positive integer representing the friction of the spring
   * @default 2
   * @opt {Object} initialState  Initial transform values
   * @default 1
   * @opt {Object} resultState  Final transform values
   * @default 1
   * @opt {String} staticTransform  The representation of a transform fragment that should be static and appended to all keyframes
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
  $.fn.spring = function(name, tension, friction, initialState, resultState, staticTransform, duration, easing, delay, iterations, direction, fillMode, callback) {
    if (Animation.isSupported()) {
      var keyframeOptions;
      var springOptions;
      var theKeyframes;
      if (typeof name === 'object') {
        keyframeOptions = {
          name: name.name,
          duration: name.duration,
          easing: name.easing,
          delay: name.delay,
          iterations: name.iterations,
          direction: name.direction,
          fillMode: name.fillMode,
          complete: name.complete
        };
        springOptions = {
          tension: name.tension,
          friction: name.friction,
          initial: name.initialState,
          result: name.resultState,
          staticTransform: name.staticTransform
        };
      }
      theKeyframes = Springer.generateKeyframes(springOptions);
      this.keyframe(theKeyframes, keyframeOptions);
    }
    return this;
  };

  return Springer;

});
