# Garbage Collection in a Nutshell
JavaScript is a garbage collected language, meaning that JavaScript interpreters run processes to restore memory to a usable state by removing dead code. The major benefit of garbage collection is that it alleviates from the programmer the concern of allocating and deallocating memory. By contrast, a non-garbage-collected language like C++ requires the programmer to micromanage the memory used by each variable introduced in the program.

Garbage collection determines that an object is dead and ready to be deallocated from memory using what's called a mark and sweep operation. The garbage collector places a mark on every object in memory, and then clears those marks as it finds references to the object. At the end of this pass, all objects that still have marks on them are deallocated from memory.

JavaScript objects can be explicitly dereferenced using the delete keyword. Note that delete only removes a specific reference to an object; it doesn't deallocate that object. As long as other references to an object still exist, the object will remain in memory even after delete is called.

## Garbage Collection Gotchas
The way JavaScript is often written, it becomes easy to leave references around that are no longer used, but that can't be garbage collected.

An object will only be collected when there's no path to it from a global variable (like `window`), when it's not referenced by the DOM (usually through an event handler), and when there are no functions that have the object in their closure (the function was created in the same scope as the variable was, so the function maintains access to the variable).

Circular references (when an object refers directly to itself or contains an object that refers back to itself) are not uncommon in JavaScript, and while they should be avoided, it's not always possible without great acrobatics. Circular references make it difficult for the garbage collector to identify dead objects. It becomes very easy to create circular references when a DOM element has an event handler containing an object that has a reference to that DOM element.

The net effect of having circular references in your program is that memory will eventually become clogged with dead objects that can't be collected (a memory leak).

# Disposables to the Rescue
The boilerplate JavaScript library contains a type that helps programs clean up after themselves by clearing references that are no longer needed. The type used for this is `lavaca/util/Disposable`.

A disposable is a simple object with one method: `dispose()`. Calling dispose on an object checks to see if any properties on the object are of type disposable and calls that disposable's `dispose()` method. 

## When to Dispose of a Disposable
You should only ever call `dispose()` when you are certain that the object is no longer needed.

In the core library, all models, views, controllers, caches, widgets, and event dispatchers are disposables. As a part of the MVC framework, when a view, widget or controller is no longer needed, it is disposed of. 

## Creating Disposable Types
Creating a new disposable type is as simple as extending either an existing disposable type (like `lavaca/ui/widget` or `lavaca/events/EventDispatcher`) or extending the base `lavaca/util/disposable`:

    var Disposable = require('lavaca/util/disposable'); 

    var MyType = Disposable.extend(function() {
      // Constructor logic
    }, {
      // Properties and methods
    };
    
    };

In some cases, you may want to prevent certain properties from being disposed of. For instance, `Lavaca.mvc.Controller` objects all have a reference back to a shared view manager. If one of those controllers were to dispose of the view manager, then all other controllers would break. To prevent this sort of thing from happening, you can set the property to `null` before running the `dispose()` method:

    
    var MyType = Disposable.extend(function(someSharedObject) {
      this.sharedObject = someSharedObject;
    }, {
      dispose: function() {
        this.sharedObject = null;
        Dispose.prototype.dispose.call(this);
      }
    };
    