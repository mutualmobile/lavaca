import { default as Animation } from './Animation'
import $ from 'jquery';
/**
 * Static utility type for creating a CSS keyframe animation with a spring effect
 * @class lavaca.fx.Spring
 */

var Springer = {};

var __bind = (fn, me)=>{()=> fn.apply(me, arguments) };

const defaults = {
  tension: 50,
  friction: 0,
  velocity: 0,
  speed: 1 / 60.0,
  tolerance: 0.1
};

let springAccelerationForState = (state) => {
  return (-state.tension * state.x) - (state.friction * state.v);
}

let springEvaluateState = (initial) => {
  let output = {
    dx: initial.v,
    dv: springAccelerationForState(initial)
  };
  return output;
}

let springEvaluateStateWithDerivative = (initial, dt, derivative) => {
  let state = {
    x: initial.x + derivative.dx * dt,
    v: initial.v + derivative.dv * dt,
    tension: initial.tension,
    friction: initial.friction
  };
  let output = {
    dx: state.v,
    dv: springAccelerationForState(state)
  };
  return output;
}

let springIntegrateState = (state, speed) => {
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

var Spring = (function() {
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

var SpringCurve = (tension, friction, velocity, fps) => {
  let spring = new Spring({
    tension: tension,
    friction: friction,
    velocity: velocity,
    speed: 1 / fps
  });
  return spring.all();
};

let getTransformFunction = (option, defaultValue, mainOnly) => {
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
    for (let prop in option) {
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
let getDifference = (initial, result) => {
  var diff;
  if (typeof initial === 'object') {
    diff = {};
    for (let prop in initial) {
      diff[prop] = result[prop] - initial[prop];
    }
  } else if (typeof initial === 'number' || typeof result === 'number') {
    diff = (result || 0) - (initial || 0);
  }
  return diff;
}
let getResultState = (initial, difference) => {
  var result;
  if (typeof initial === 'object') {
    result = {};
    for (let prop in initial) {
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
  for (let prop in this.resultState) {
    this.differences[prop] = getDifference(this.initial[prop], this.resultState[prop]);
  }
  return this.differences;
};

Springer.determineResultState = function() {
  this.resultState = {};
  for (let prop in this.differences) {
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

  for (let i = 1; i < length; ++i) {
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

Springer.createTranslate3d = (translate) => {
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
Springer.createScale3d = (scale) => {
  if (scale.x !== undefined
    || scale.y !== undefined
    || scale.z !== undefined) {

    return ' scale3d('+ ((scale.x || scale.x === 0) ? scale.x : 1)+','+
            ((scale.y || scale.y === 0) ? scale.y : 1)+','+
            ((scale.z || scale.z === 0) ? scale.z : 1)+')';
  }
  return '';
};
Springer.createRotate = (rotate) => {
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
Springer.createSkew = (skew) => {
  var transform = '';
  if (skew.x !== undefined) {
    transform += ' skewX('+(skew.x)+'deg)';
  }
  if (skew.y !== undefined) {
    transform += ' skewY('+(skew.y)+'deg)';
  }
  return transform;
};
Springer.createPerspective = (perspective) => {
  if (perspective !== undefined) {
    return ' perspective(' + perspective + ')';
  }
  return '';
};

/**
 * Applies a spring keyframe animation to an element
 * @method $.fn.spring
 *
 * @param {String} [name] The name of the animation
 * @param {Object} [springOptions] Options for the spring
   * @param {Number} [springOptions.tension] Positive integer representing the tension on the spring. Default is 50
   * @param {Number} [springOptions.friction]  Positive integer representing the friction of the spring. Default is 2
   * @param {Object} [springOptions.initialState]  Initial transform values. If element has previously been transformed with a spring, the initialState values will be merged into the result of the previous transformation.
   * @param {Number} [springOptions.initialState.scale] Unitless number N that will be represented in CSS as scale3d(n,n,n)
   * @param {Object} [springOptions.initialState.scale] Object with `x`, `y`, and `z` properties as numbers that will be represented in CSS as scale3d(x,y,z).  If any properties are not specified, they default to 1.
   * @param {Number} [springOptions.initialState.translate] Number N that will be represented in CSS as translate3d(Npx,Npx,Npx)
   * @param {Object} [springOptions.initialState.translate] Object with `x`, `y`, and `z` properties as numbers that will be represented in CSS as translate3d(xpx,ypx,zpx).  If any properties are not specified, they default to 0.
   * @param {Number} [springOptions.initialState.rotate] Number N that will be represented in CSS as rotateZ(Ndeg)
   * @param {Object} [springOptions.initialState.rotate] Object with `x`, `y`, and `z` properties as numbers that will be represented in CSS as rotateX(xdeg) rotateY(ydeg) rotateZ(zdeg).  If any properties are not specified, they default to 0.
   * @param {Number} [springOptions.initialState.skew] Number N that will be represented in CSS as skewX(Ndeg) skewY(Ndeg)
   * @param {Object} [springOptions.initialState.skew] Object with `x` and `y` properties as numbers that will be represented in CSS as skewX(xdeg) skewY(ydeg).  If any properties are not specified, they default to 0.
   * @param {Number} [springOptions.initialState.perspective] Unitless number N that will be represented in CSS as perspective(Npx)
   * @param {Object} [springOptions.differences]  Differences between initial and final transform values. Same format as `initialState`
   * @param {Object} [springOptions.resultState]  Final transform values. Same format as `initialState`. If `differences` are also specified, `resultState` will be ignored
 * @param {Object} [keyframeOptions]  Options for the animation
   * @param {Number} [keyframeOptions.duration]  The number of milliseconds that the animation lasts
   * @param {String} [keyframeOptions.easing]  The name of a CSS easing function
   * @default 'linear'
   * @param {Number} [keyframeOptions.delay]  The number of milliseconds before the animation should start
   * @default 0
   * @param {Object} [keyframeOptions.iterations]  Either the number of iterations to play the animation or 'infinite'
   * @default 1
   * @param {String} [keyframeOptions.direction]  The name of a CSS animation direction
   * @default 'normal'
   * @param {String} [keyframeOptions.fillMode]  The name of a CSS animation fill-mode
   * @param {Function} [keyframeOptions.complete]  A function to execute when the animation has completed
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

export default Springer;