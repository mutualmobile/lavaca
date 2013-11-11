Changed in 2.3.1 and 2.3.2
======
* Patches for onTapLink

Changed in 2.3.0
======
* Moved all client-side dependencies to use bower and restructured project to make sense of this change
* Removed unused corodova plugin architecture from lavaca/env/Device since it is handled by corodva cli
* Significant updates to the Form widget, and added tests for Form widget
  - Added 'autoTrim' option
  - Made URL regex more forgiving
  - More robust & less redundant get/set value logic
  - set() can accept a hash of names and values
  - Added 'treatAsGroup' option for rules
  - Added hook for input formatters
* Added animationEndEvent function to the Animation class
* Change autoRender behavior for childViews so that render() is called after the child view is created instead of in the View constructor fixing the intended behavior.
* Updated History to fix navigating back out of a lavaca site.
* Fixed cmd/ctr click on links
* Refactored onTapLink
  - Now auto checks for external links and ignores them
  - Added support for cordova in app browser
  - Added `force-back` rel to force `History.isRoutingBack = true`
* Add new signature to mapChildView which will allow for dynamically selecting/creating the childView's model
* Fixed bindLinkHandler to appropriately bind click or tap events based on the inclusion of Hammer
  

Changed in 2.2.0
======
* Combined PageView and View into a single class
* Add ability to pass in custom arguments using the mapWidget() method
* Add 'redrawsuccess' event
* Fix bug with using the dot-syntax for mapping events to a view's model (ex. mapEvent({model: { 'change.attr' : myHandler }})
* Add ability to specify a default 'layer' property on a PageView-derived class' prototype
* Fix bug with remove() not getting called on all models when clearModels() is called.
* Fix issue with where initial URL may be URI encoded, such as when a site is saved to the home screen on iOS
* Add transitionEndEvent method to Transition class
* Fixed local ajax requests when offline

Changed in 2.1.1
======
* Separated lavaca core files in NPM module

Changed in 2.0.4
======
* Fix for Disposing of childviews and widgets in View.js
* Fix for Bug in new syntax for mapEvent in Views

Changed in 2.0.3
======
* Switched to grunt-contrib-yuidoc for code documentation generation
* Cleaned up unused tasks in Gruntfile.js
* Introduced new code scaffolding grunt task
* Updated grunt server task to handle proxying both http and https based apis, added more configuration options
* Added new syntax to mapEvent in Views, can now pass method name as a string and it will automatically bind to the view's context


Changed in 2.0
======
* Upgraded Cordova to 2.6
* Switched to Grunt for building the application
* Switched to AMD architecture with RequireJS
* Added insert method to collections
* Added remove(index) signature to collections
* Added of Lavaca CLI tool
* Added responsefilter to models
* Enhanced collection of page transitions
* Added new way of specifying page transitions in Views
* Ability to listen for model attribute events in mapEvent method in Views

Changed in 1.0.5
======
* Upgraded Cordova to 2.2
* Enhanced build script to generate scripts.xml and styles.xml files based on specially annotated sections of the index.html
* Added computed attributes for models and collections ([more](https://github.com/mutualmobile/lavaca/wiki/3.1.-Models-and-Collections#wiki-computed-attributes))
* Added redraw() method to view that handels partial rendering based on a CSS selector or with custom redraw method
* Added initial hash route parsing to facilitate page refreshing
* Switched default templating engine to LinkedIn fork of Dust (NOTE: This change is not 100% backwards compatible. [Read more] (https://github.com/mutualmobile/Lavaca-modules/tree/master/x-dust#syntax-differences-from-default-lavaca-template-system))
* Overloaded collection's add() to accept an array of objects or models
* Added sort method to collections following _.sortBy pattern
* Added Dust helper to access variables from config files ([more](https://github.com/mutualmobile/lavaca/wiki/4.1.-Using-Templates-to-Generate-HTML#wiki-config-helper))
* Added entercomplete event that fires when a view is done animating

Changed in 1.0.4
======
* Upgraded Cordova to 2.1
* Fixed animation glitches in page transitions
* Updated Android ChildBrowser plugin to remove legacy ctx in favor of cordova.getContext()
* Removed preventDefault() from touchstart in tap events
* Added support for all iOS app icons and startup images
* Fixed an issue where $.fn.transition(props, duration, easing, callback) would not overload properly if transitions were not supported
* Fixed issue where a tap event would fire if the fake scroll was started/ended on a element with a tap handler
* Fixed issue in build.py where it was looking for mm:configs instead of Lavaca:configs
* Fixed toObject call on Models that have Models/Collections as an attribute
* Added better support for Android identity checks and added Mobile identity checks
* Fixed Model.validate() and added support for quickly checking if model is valid

Changed in 1.0.3
======
* Moved the "column" property from the model to the view in app.ui.BaseView
* Upgraded x-dust to 0.5.3
* Fixed an issue where views would fail to exit on Android 4.1
* Lavaca.env.Device no longer throws errors when Zepto is swapped out for jQuery
* Added support for target="_blank" on application's tap handler for `<a>` tags
* Fixed a timing issue with app.ui.BaseView's enter and exit animations
* Fixed an issue where the signature $.fn.touch(onstart, onmove, onend) would fail to bind handlers
* Fixed an issue where Lavaca.delay did not return a timeout ID
* Fixed an issue where event handlers were unbound from cached views when Zepto is swapped out for jQuery
* Documentation template no longer treats every method as static
* Android now parses all route variables consistently

Changed in 1.0.2
======
* Added enter/exit events for Lavaca.mvc.View
* Lavaca.mvc.Collection#fetch now works as expected with complex data containing arrays
* Lavaca.mvc.Collection now supports TModel being a Collection-type
* You can now delegate events to the view's model using the "model" selector. Those events will be automatically unbound when the view is disposed
