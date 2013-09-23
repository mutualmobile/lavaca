grunt-amd-check
===============

grunt-amd-check is a [grunt](http://gruntjs.com/) multitask to check for
broken AMD dependencies in a project.

This plugin requires Grunt `~0.4.0`


Installation
-------------

From the same directory as your Gruntfile, run

```
npm install grunt-amd-check
```

Then add the following line to your Gruntfile:

```js
grunt.loadNpmTasks('grunt-amd-check');
```

You can verify that the task is available by running `grunt --help` and
checking that "amd-check" is under "Available tasks".


Configuration
-------------

grunt-amd-check reads two sections of your config: `amd-check` and
`requirejs`. `amd-check` can contain these properties (example from
[class.js](https://github.com/zship/class.js)):

```js
'amd-check': {
	//Grunt files configuration object for which to trace dependencies
	//(more: http://gruntjs.com/configuring-tasks)
	files: ['src/**/*.js', 'test/spec/**/*.js']
},
```

`requirejs` is a standard [r.js configuration
object](https://github.com/jrburke/r.js/blob/master/build/example.build.js).
grunt-amd-check uses `basePath`, `paths`, and `packages` (all optional)
to transform AMD module names to absolute file names. If the `mainConfigFile`
property is given, the configuration in that file will be mixed-in to the
`requirejs` property with a **lower** precedence (that is, in the case of a
conflicting configuration property, `requirejs` will always "win" against
`mainConfigFile`).


Tasks
-----

### amd-check

`grunt amd-check` iterates through all files matched in the `files` option and
reports any dependencies which cannot be resolved to absolute paths.

### whatrequires

`grunt whatrequires` accepts a single argument `searchFile` and iterates
through all files matched in the `files` option, looking for modules which list
`searchFile` as a dependency (in any valid RequireJS format). _Note: Grunt
denotes arguments using a ":" character after the task name, followed by the
argument._

Example: `grunt whatrequires:src/js/BaseController.js` might report
`src/js/HomeController.js` and `src/js/NavigationController.js` as dependents.


License
-------

Released under the [MIT
License](http://www.opensource.org/licenses/mit-license.php).
