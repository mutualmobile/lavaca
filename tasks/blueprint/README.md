# Basic Scaffolding utility

Designed to be generic and configurable, blueprint will help you generate the most common class types during development.

## Sample Calls

To generate a new Controller, simple go to the command line, change to your projects directory where the GruntFile is located, and run this:

```shell
grunt blueprint:lavaca:Controller:*/ControllerName
```

## override templates
You can easily override the templates that come with this task. simply specify a src property on the task in the Gruntfile as so:

```js
blueprint: {
      options: {
        src: 'templates',
        dest: '<%= paths.src.www %>/js/app',
        appName: 'app'
      }
```

Make sure the src location is relative to the location of the grunt file.


## adding new  types
Feel free to configure new types for new templates and paths. Simply add more options to the map object, for example, lets say you wanted to have a template for all service classes to use:

```js
lavaca:{
        options:{
          map:{
            View: 'ui/views/View',
            PageView: 'ui/views/pageviews/PageView',
            Model: 'models/Model',
            Collection: 'collections/Collection',
            Controller: 'net/Controller',
            Control: 'ui/views/controls/Control',
            Service: 'data/Service'
          }
        }
      }
```

Assuming you have a template file named Service.js in the templates location, you can then just run this:

```shell
grunt blueprint:lavaca:Service:*/ServiceName
```

and the new file would be generated in js/app/data/ServiceName.js


to see the variables that are being set for the template to use, generate a file with

```shell
grunt --verbose blueprint:lavaca:Controller:*/ControllerName
```

This task is a slightly modified version of

[grunt-generate](https://github.com/Grunt-generate/grunt-generate)
