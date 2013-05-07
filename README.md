Lavaca amd branch
======

[![Build Status](https://travis-ci.org/mutualmobile/lavaca.png?branch=amd)](https://travis-ci.org/mutualmobile/lavaca)

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

# Getting Started

## Qucik Start
1. __Install *getlavaca* CLI tool__
```bash
$ curl https://raw.github.com/mutualmobile/lavaca/amd/getlavaca > /usr/local/bin/getlavaca && chmod +x /usr/local/bin/getlavaca
```

2. __Go to your prefered root directory then run__
```bash
$ getlavaca
```
then follow instructions. You're good to go.



## Slow Start

1. __Get the code__
```bash
$ mkdir [my_app] && cd [my_app]
$ git clone git@github.com:mutualmobile/lavaca.git .
```

2. __Get the branch__
```bash
$ git checkout -b [my_branch] origin/amd
```

3. __Install grunt-cli globally__
Note: this may require sudo
```bash
$ npm install -g grunt-cli
```

4. __Install dev dependencies for our tasks to work__
```bash
$ npm install
```

5. __Start Development Server__
```bash
$ grunt server
```
Your application should now be running on `localhost:8080`.

## Grunt Tasks

Below is a list of grunt tasks to aid development and facilitate deployment.

### Server

A task that simply runs a static server for local development and testing. Defaults to run on `localhost:8080` with `src` being the root directory.

- __Run the default static server__

```bash
$ grunt server
```

### Build

Precompiles LESS and Dust templates, concats and minifies all CSS and JavaScript files, and builds all related files to `www`, `android/assets/www` and `ios/www` directories. 

- __Build with local config__

```bash
$ grunt build
```

- __Build with staging config__ (a copy of the build will be available in `www` folder)

```bash
$ grunt build:staging
```

- __Build with production config__ (a copy of the build will be available in `www` folder)

```bash
$ grunt build:production
```

### Test

Runs unit tests defined in `test/unit` directory with [Jasmine](http://pivotal.github.com/jasmine/) in a headless instance of Webkit using [PhantomJS](http://phantomjs.org/).

- __Run unit tests from `test/unit`__

```bash
$ grunt test
```

### Docs

Generates JavaScript documentation using [Atnotate](https://github.com/mutualmobile/lavaca/wiki/5.4.-Documentation-Generation-with-Atnotate). The resulting documentation is outputed to the `docs` folder.

- __Generate JavaScript Documentation__

```bash
$ grunt docs
```

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

LinkedIn Fork of Dust.js 1.1
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