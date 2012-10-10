Lavaca 1.0.4
======

Introducing Lavaca, the open source, HTML5 application framework by Mutual Mobile. Jumpstart development of your project by basing them off of Lavaca and using Lavaca's build tools.

Lavaca features:
* A build system supporting multiple configurations for different environments
* An HTML, JavaScript, and CSS packaging and minification system
* A JavaScript documentation generation system
* A unit testing framework
* A JavaScript MVC framework
* A templating framework
* A translation framework
* …as well as many other essential components for modern web applications.

Lavaca has a ton packed into it, and is designed to work well as a cohesive whole, while still remaining lightweight. Lavaca is built with extensibility in mind and allows you to easily extend components and build your own on top of its framework.

Changed in 1.0.3
======
* Moved the "column" property from the model to the view in app.ui.BaseView
* Upgraded x-dust to 0.5.3
* Fixed an issue where views would fail to exit on Android 4.1
* Lavaca.env.Device no longer throws errors when Zepto is swapped out for jQuery
* Added support for target="_blank" on application's tap handler for <a> tags
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

Legal stuff:

Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Contains components from or inspired by:

Simple Reset
(c) 2011 Eric Meyer
Released to public domain

jQuery v1.7.1
(c) 2011, John Resig
Dual licensed under the MIT or GPL Version 2 licenses.

Sizzle.js
(c) 2011, The Dojo Foundation
Released under the MIT, BSD, and GPL licenses.

Backbone.js 0.9.1 and Underscore.js 1.3.1
(c) 2012, Jeremy Ashkenas, DocumentCloud Inc
Released under the MIT license.

Dust.js v0.3.0
(c) 2010, Aleksander Williams
Released under the MIT license.

Zepto.js 0.8.0
(c) 2011 Thomas Fuchs
Released under the MIT license

ChildBrowser
(c) 2012 Jesse MacFadyen, Nitobi
Released under the MIT license

lz77.js
(c) 2009 Olle Törnström
Released under the MIT license

iScroll 4.1.9
(c) 2011 Matteo Spinelli
Released under the MIT license