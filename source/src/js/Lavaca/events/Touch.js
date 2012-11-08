/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, EventVector, EventPoint) {

// Note: TouchEvent is an implied type and doesn't actually exist

/**
 * @class Lavaca.events.TouchEvent
 * @super Event
 * Event data from when the user interacted with the screen by starting, moving, or ending a touch
 *
 * @field {Number} startTime
 * @default 0
 * The time (in ms) when the touch start event fired
 *
 * @field {Number} elapsed
 * @default 0
 * The number of milliseconds since the touch start event fired
 *
 * @field {Lavaca.events.EventPoint} startPoint
 * @default null
 * The point where the touch start event fired
 *
 * @field {Lavaca.events.EventPoint} lastPoint
 * @default null
 * The previous point in this chain of touch events
 *
 * @field {Lavaca.events.EventPoint} currentPoint
 * @default null
 * The most recent point in this chain of touch events
 *
 * @field {Boolean} hasMoved
 * @default false
 * Whether or not the pointer has moved
 *
 * @field {Lavaca.events.EventPoint} startDelta
 * @default null
 * The difference between the currentPoint and startPoint
 *
 * @field {Number} startDistance
 * @default 0
 * The number of pixels traversed from the startPoint to the currentPoint
 *
 * @field {Lavaca.events.EventVector} startVector
 * @default null
 * Information about the direction of the gesture, from the startPoint to the currentPoint
 *
 * @field {Lavaca.events.EventPoint} lastDelta
 * @default null
 * The difference between the currentPoint and lastPoint
 *
 * @field {Number} lastDistance
 * @default 0
 * The number of pixels traversed from the startPoint to the currentPoint
 *
 * @field {Lavaca.events.EventVector} lastVector
 * @default null
 * Information about the direction of the gesture, from the lastPoint to the currentPoint
 */

var _startName = 'mousedown',
    _moveName = 'mousemove',
    _endName = 'mouseup',
    _coordNames = ['screenX', 'screenY', 'clientX', 'clientY', 'pageX', 'pageY'],
    _supportsTouchEvents = false,
    _supportsGestureEvents = false,
    _moveHandlers = {},
    _endHandlers = {};

(function() {
  var el = document.createElement('div');
  el.setAttribute('ontouchstart', 'return;');
  el.setAttribute('ongesturestart', 'return;');
  if (_supportsTouchEvents = typeof el.ontouchstart == 'function') {
    _startName = 'touchstart';
    _moveName = 'touchmove';
    _endName = 'touchend';
  }
  _supportsGestureEvents = typeof el.ongesturestart == 'function';
})();

function _addMoveHandler(id, handler) {
  _moveHandlers[id] = function(e) { handler(e); };
}

function _removeMoveHandler(id) {
  delete _moveHandlers[id];
}

function _addEndHandler(id, handler) {
  _endHandlers[id] = function(e) { handler(e); };
}

function _removeEndHandler(id) {
  delete _endHandlers[id];
}

(function() {
  $(document.body)
    .on(_moveName, function(e) {
      for (var id in _moveHandlers) {
        _moveHandlers[id](e);
      }
    })
    .on(_endName, function(e) {
      for (var id in _endHandlers) {
        _endHandlers[id](e);
      }
    });
})();
 
function _getPoint(touchEvent, index) {
  if (!touchEvent.touches && touchEvent.originalEvent) {
    touchEvent = touchEvent.originalEvent;
  } 
  if (touchEvent.touches && touchEvent.touches.length) {
    touchEvent = touchEvent.touches[index || 0];
  } else if (touchEvent.changedTouches && touchEvent.changedTouches.length) {
    touchEvent = touchEvent.changedTouches[index || 0];
  }
  return new EventPoint(touchEvent);
}

function _clonePoint(point) {
  return _getPoint(point);
}

function _delta(a, b) {
  var result = {},
      i = -1,
      name;
  while (name = _coordNames[++i]) {
    result[name] = a[name] - b[name];
  }
  return new EventPoint(result);
}

function _distance(a, b) {
  return Math.sqrt((a.screenX - b.screenX) * (a.screenX - b.screenX) + (a.screenY - b.screenY) * (a.screenY - b.screenY));
}

function _equal(a, b) {
  return a.screenX === b.screenX && a.screenY === b.screenY;
}

function _withinThreshold(a, b) {
  return _distance(a, b) <= ns.moveThreshold;
}

function _vector(a, b) {
  var deltaX = a.screenX - b.screenX,
      deltaY = a.screenY - b.screenY;
  if (deltaX * deltaX > deltaY * deltaY) {
    return new EventVector(Math.abs(deltaX), 'horizontal', deltaX > 0 ? 'east' : 'west');
  } else {
    return new EventVector(Math.abs(deltaY), 'vertical', deltaY > 0 ? 'south' : 'north');
  }
}

function _getEventTouch(identifier, e) {
  var i = -1,
      touch;
  if (null !== identifier && e.changedTouches) {
    while (touch = e.changedTouches[++i]) {
      if (touch.identifier === identifier) {
        return touch;
      }
    }
    return null;
  } else {
    return e;
  }
}

function _preventDefault(e) {
  e.preventDefault();
}

function _Event(o) {
  if (o) {
    for (var name in o) {
      if (typeof o[name] != 'function') {
        this[name] = o[name];
      }
    }
    this.originalEvent = o;
  }
}
_Event.prototype = {
  preventDefault: function() {
    this.defaultPrevented = true;
    if (this.originalEvent) {
      this.originalEvent.preventDefault();
    }
  },
  stopPropagation: function() {
    if (this.originalEvent) {
      this.originalEvent.stopPropagation();
    }
  }
};

/**
 * @class Lavaca.events.Touch
 * Static utility class for Touch events
 */

/**
 * @field {Number} moveThreshold
 * @default 4
 * How many pixels the pointer may move and still count as a tap
 */
ns.moveThreshold = 4;

/**
 * @field {Number} tapholdDuration
 * @default 800
 * How many milliseconds the user must wait between touch start and touch end to count as a hold
 */
ns.tapholdDuration = 800;

/**
 * @method isSupported
 * @static
 * Whether or not touch events are supported by the browser
 *
 * @return {Boolean} True if touch events are supported
 */
ns.isSupported = function() {
  return _supportsTouchEvents;
};

/**
 * @method bind
 * @static
 * Binds touch start, move, and end handlers to an element, falling back to mouse events when touch isn't supported.
 * Event handlers are passed [[Lavaca.events.TouchEvent]] objects.
 *
 * @sig
 * @param {jQuery} el  The element to which to bind events
 * @param {Object} opts  Parameters to initialize touch event handling
 * @opt {Function} start  Callback to execute when the user begins touching the element
 * @opt {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @opt {Function} end  Callback to execute when the user stops touching the screen after touching the element
 *
 * @sig
 * @param {jQuery} el  The element to which to bind events
 * @param {Object} opts  Parameters to initialize touch event handling
 * @opt {Function} start  Callback to execute when the user begins touching the element
 * @opt {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @opt {Function} end  Callback to execute when the user stops touching the screen after touching the element
 * @param {Object} thisp  Context for the callback
 *
 * @sig
 * @param {jQuery} el  The element to which to bind events
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Object} opts  Parameters to initialize touch event handling
 * @opt {Function} start  Callback to execute when the user begins touching the element
 * @opt {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @opt {Function} end  Callback to execute when the user stops touching the screen after touching the element
 *
 * @sig
 * @param {jQuery} el  The element to which to bind events
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Object} opts  Parameters to initialize touch event handling
 * @opt {Function} start  Callback to execute when the user begins touching the element
 * @opt {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @opt {Function} end  Callback to execute when the user stops touching the screen after touching the element
 * @param {Object} thisp  Context for the callback
 *
 * @sig
 * @param {jQuery} el  The element to which to bind events
 * @param {Function} start  Callback to execute when the user begins touching the element
 * @param {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @param {Function} end  Callback to execute when the user stops touching the screen after touching the element
 *
 * @sig
 * @param {jQuery} el  The element to which to bind events
 * @param {Function} start  Callback to execute when the user begins touching the element
 * @param {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @param {Function} end  Callback to execute when the user stops touching the screen after touching the element
 * @param {Object} thisp  Context for the callback
 *
 * @sig
 * @param {jQuery} el  The element to which to bind events
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Function} start  Callback to execute when the user begins touching the element
 * @param {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @param {Function} end  Callback to execute when the user stops touching the screen after touching the element
 *
 * @sig
 * @param {jQuery} el  The element to which to bind events
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Function} start  Callback to execute when the user begins touching the element
 * @param {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @param {Function} end  Callback to execute when the user stops touching the screen after touching the element
 * @param {Object} thisp  Context for the callback
 */
ns.bind = function(el, delegate, start, move, end, thisp) {
  if (typeof delegate == 'function') {
    delegate = {
      start: delegate,
      move: start,
      end: move
    };
    thisp = end;
  }
  if (delegate && typeof delegate == 'object') {
    thisp = start;
    start = delegate;
    delegate = null;
  }
  if (start && typeof start == 'object') {
    move = start.move;
    end = start.end;
    start = start.start;
    thisp = move;
  }
  var startTime,
      startPoint,
      lastPoint,
      currentPoint,
      hasMoved = false,
      defaultPrevented = false,
      identifier,
      onMove,
      onEnd,
      eventMap = {},
      k;
  function _appendTouchData(o) {
    var result = new _Event(o);
    if (o) {
      result.startTime = startTime;
      result.elapsed = (new Date).getTime() - startTime;
      result.startPoint = startPoint;
      result.lastPoint = lastPoint;
      result.currentPoint = currentPoint;
      result.hasMoved = hasMoved || (hasMoved = !_withinThreshold(startPoint, currentPoint));
      if (startPoint && currentPoint) {
        result.startDelta = _delta(currentPoint, startPoint);
        result.startDistance = _distance(currentPoint, startPoint);
        result.startVector = _vector(currentPoint, startPoint);
      }
      if (currentPoint && lastPoint) {
        result.lastDelta = _delta(currentPoint, lastPoint);
        result.lastDistance = _distance(currentPoint, lastPoint);
        result.lastVector = _vector(currentPoint, lastPoint);
      }
    }
    return result;
  }
  // Prevent click so that all platforms have uniform touch event handling:
  // - Android doesn't prevent click if touchstart is prevented
  // - Desktop browsers don't prevent click if mousedown is prevented
  eventMap.click = function(e) {
    if (defaultPrevented) {
      e.preventDefault();
    }
  };
  eventMap[_startName] = function(e) {
    e = e.originalEvent || e;
    var el = this,
        uuid = Lavaca.uuid();
    startTime = (new Date).getTime();
    startPoint = lastPoint = currentPoint = _getPoint(e);
    hasMoved = false;
    if (e.changedTouches && e.changedTouches.length) {
      identifier = e.changedTouches[0].identifier;
    } else {
      idenfifier = null;
    }
    if (start) {
      start.call(thisp || el, _appendTouchData(e));
    }
    defaultPrevented = defaultPrevented || e.defaultPrevented;
    _addMoveHandler(uuid, function(e) {
      var touch = _getEventTouch(identifier, e);
      if (null !== touch) {
        currentPoint = _getPoint(touch);
        if (move) {
          e = _appendTouchData(e);
          e.currentTarget = el;
          move.call(thisp || el, e);
          defaultPrevented = defaultPrevented || e.defaultPrevented;
        }
        lastPoint = currentPoint;
      }
    });
    _addEndHandler(uuid, function(e) {
      var touch = _getEventTouch(identifier, e);
      if (null !== touch) {
        currentPoint = _getPoint(touch);
        if (end) {
          e = _appendTouchData(e);
          e.currentTarget = el;
          end.call(thisp || el, e);
          defaultPrevented = defaultPrevented || e.defaultPrevented;
        }
        _removeMoveHandler(uuid);
        _removeEndHandler(uuid);
        el = onMove = onEnd = null;
      }
    });
  };
  for (k in eventMap) {
    if (delegate) {
      el.on(k, delegate, eventMap[k]);
    } else {
      el.on(k, eventMap[k]);
    }
  }
  el = null;
};

/**
 * @method $.fn.touch
 * Binds touch start, move, and end handlers to an element, falling back to mouse events when touch isn't supported.
 * Event handlers are passed [[Lavaca.events.TouchEvent]] objects.
 *
 * @sig
 * @param {Object} opts  Parameters to initialize touch event handling
 * @opt {Function} start  Callback to execute when the user begins touching the element
 * @opt {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @opt {Function} end  Callback to execute when the user stops touching the screen after touching the element
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {Object} opts  Parameters to initialize touch event handling
 * @opt {Function} start  Callback to execute when the user begins touching the element
 * @opt {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @opt {Function} end  Callback to execute when the user stops touching the screen after touching the element
 * @param {Object} thisp  Context for the callback
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Object} opts  Parameters to initialize touch event handling
 * @opt {Function} start  Callback to execute when the user begins touching the element
 * @opt {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @opt {Function} end  Callback to execute when the user stops touching the screen after touching the element
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Object} opts  Parameters to initialize touch event handling
 * @opt {Function} start  Callback to execute when the user begins touching the element
 * @opt {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @opt {Function} end  Callback to execute when the user stops touching the screen after touching the element
 * @param {Object} thisp  Context for the callback
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {Function} start  Callback to execute when the user begins touching the element
 * @param {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @param {Function} end  Callback to execute when the user stops touching the screen after touching the element
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {Function} start  Callback to execute when the user begins touching the element
 * @param {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @param {Function} end  Callback to execute when the user stops touching the screen after touching the element
 * @param {Object} thisp  Context for the callback
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Function} start  Callback to execute when the user begins touching the element
 * @param {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @param {Function} end  Callback to execute when the user stops touching the screen after touching the element
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Function} start  Callback to execute when the user begins touching the element
 * @param {Function} move  Callback to execute when the user moves the pointer (without ending contact) after touching the element
 * @param {Function} end  Callback to execute when the user stops touching the screen after touching the element
 * @param {Object} thisp  Context for the callback
 * @return {jQuery}  This jQuery object (for chaining)
 */
$.fn.touch = function(delegate, start, move, end, thisp) {
  if (delegate instanceof Function) {
    thisp = end;
    end = move;
    move = start;
    start = delegate;
    delegate = null;
  }
  ns.bind(this, delegate, start, move, end, thisp);
  return this;
};

/**
 * @method $.fn.tap
 * Binds a handler to the tap event (roughly equivalent to a click event, consisting of a touch start and touch end
 * with no touch move). Event handlers are passed [[Lavaca.events.TouchEvent]] objects.
 *
 * @sig
 * @param {Function} callback  Callback to execute when the user taps the element
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {Function} callback  Callback to execute when the user taps the element
 * @param {Object} thisp  Context for the callback
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Function} callback  Callback to execute when the user taps the element
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Function} callback  Callback to execute when the user taps the element
 * @param {Object} thisp  Context for the callback
 * @return {jQuery}  This jQuery object (for chaining)
 */
$.fn.tap = function(delegate, callback, thisp) {
  if (typeof delegate == 'function') {
    thisp = callback;
    callback = delegate;
    delegate = null;
  }
  if (_supportsTouchEvents) {
    ns.bind(this, delegate, null, null, function(e) {
      if (!e.hasMoved && callback) {
        callback.apply(thisp || this, arguments);
      }
    });
    this.on('click', delegate, function(e) { e.preventDefault(); });
  } else {
    this.on('click', delegate, function() { callback.apply(thisp || this, arguments); });
  }
  return this;
};

/**
 * @method $.fn.taphold
 * Binds a handler to the tap-and-hold event, where the user taps but waits a minimum amount of time before
 * ending the touch. Event handlers are passed [[Lavaca.events.TouchEvent]] objects.
 *
 * @sig
 * @param {Function} callback  The callback to execute when the user tap-holds the element
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {Function} callback  The callback to execute when the user tap-holds the element
 * @param {Number} duration  The minimum number of milliseconds before the tap counts as a taphold
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {Function} callback  The callback to execute when the user tap-holds the element
 * @param {Number} duration  The minimum number of milliseconds before the tap counts as a taphold
 * @param {Object} thisp  Context for the callback
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Function} callback  The callback to execute when the user tap-holds the element
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Function} callback  The callback to execute when the user tap-holds the element
 * @param {Number} duration  The minimum number of milliseconds before the tap counts as a taphold
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Function} callback  The callback to execute when the user tap-holds the element
 * @param {Number} duration  The minimum number of milliseconds before the tap counts as a taphold
 * @param {Object} thisp  Context for the callback
 * @return {jQuery}  This jQuery object (for chaining)
 */
$.fn.taphold = function(delegate, callback, duration, thisp) {
  if (typeof delegate == 'function') {
    thisp = duration;
    duration = callback;
    callback = delegate;
    delegate = null;
  }
  duration = duration || ns.tapholdDuration;
  this.tap(delegate, function(e) {
    if (e.elapsed >= duration && callback) {
      callback.apply(this, arguments);
    }
  }, thisp);
  return this;
};

/**
 * @method $.fn.swipe
 * Binds handlers to an element to execute when the user gestures in a direction. Event handlers are passed
 * [[Lavaca.events.TouchEvent]] objects.
 *
 * @sig
 * @param {Function} callback  The callback to execute when the user swipes the element
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Function} callback  The callback to execute when the user swipes the element
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {Function} callback  The callback to execute when the user swipes the element
 * @param {Object} opts  Parameters for the swipe
 * @opt {Number} minDistance  The minimum number of pixels that the touch end point may be from the touch start point
 * @default 30
 * @opt {Number} maxDistance  The maximum number of pixels that the touch end point may be from the touch start point
 * @default null
 * @opt {String} direction  The axis or cardinal direction to which swipes are limited (horizontal, vertical, north, south, east or west)
 * @default 'horizontal'
 * @opt {Number} timeLimit  The maximum number of milliseconds that the gesture may have taken to perform
 * @default 1000
 * @opt {Function} cancel  A callback to execute when the swipe gesture is invalidated because of time, distance or direction requirements
 * @default null
 * @opt {Function} start  A callback to execute when the user starts touching the element
 * @default null
 * @opt {Function} move  A callback to execute when the user moves after touching the element but before ending contact with the screen
 * @default null
 * @opt {Function} end  A callback to execute when the user ends contact with the screen after touching the element
 * @default null
 * @return {jQuery}  This jQuery object (for chaining)
 *
 * @sig
 * @param {String} delegate  Selector for the descendant elements to which the handlers will be bound
 * @param {Function} callback  The callback to execute when the user swipes the element
 * @param {Object} opts  Parameters for the swipe
 * @opt {Number} minDistance  The minimum number of pixels that the touch end point may be from the touch start point
 * @default 30
 * @opt {Number} maxDistance  The maximum number of pixels that the touch end point may be from the touch start point
 * @default null
 * @opt {String} direction  The axis or cardinal direction to which swipes are limited (horizontal, vertical, north, south, east or west)
 * @default 'horizontal'
 * @opt {Number} timeLimit  The maximum number of milliseconds that the gesture may have taken to perform
 * @default 1000
 * @opt {Function} cancel  A callback to execute when the swipe gesture is invalidated because of time, distance or direction requirements
 * @default null
 * @opt {Function} start  A callback to execute when the user starts touching the element
 * @default null
 * @opt {Function} move  A callback to execute when the user moves after touching the element but before ending contact with the screen
 * @default null
 * @opt {Function} end  A callback to execute when the user ends contact with the screen after touching the element
 * @default null
 * @return {jQuery}  This jQuery object (for chaining)
 */
$.fn.swipe = function(delegate, callback, opts, thisp) {
  if (typeof delegate == 'function') {
    opts = callback;
    callback = delegate;
    delegate = null;
  }
  opts = opts || {};
  var minDistance = opts.minDistance || 30,
      maxDistance = opts.maxDistance || Number.MAX_VALUE,
      direction = opts.direction || 'horizontal',
      timeLimit = opts.timeLimit || 1000,
      onSwipeCancel = opts.cancel || null,
      onSwipeStart = opts.start || null,
      onSwipeMove = opts.move || null,
      onSwipeEnd = opts.end || null;
  function onMove(e) {
    if (e.elapsed <= timeLimit && onSwipeMove) {
      onSwipeMove.apply(thisp || this, arguments);
    }
  }
  function onEnd(e) {
    if (onSwipeEnd) {
      onSwipeEnd.apply(thisp || this, arguments);
    }
    if (e.elapsed <= timeLimit
        && (direction == e.startVector.compass || direction == e.startVector.axis)
        && e.startVector.length >= minDistance
        && e.startVector.length <= maxDistance) {
      if (callback) {
        callback.apply(thisp || this, arguments);
      }
    } else if (onSwipeCancel) {
      onSwipeCancel.apply(thisp || this, arguments);
    }
  }
  ns.bind(this, delegate, onSwipeStart, onMove, onEnd);
  return this;
};

})(Lavaca.resolve('Lavaca.events.Touch', true), Lavaca.$, Lavaca.events.EventVector, Lavaca.events.EventPoint);