Lavaca's build configuration includes a task configured to generate documentation for your project. It utilizes the [grunt contrib yuidoc](https://github.com/gruntjs/grunt-contrib-yuidoc) task.  The syntax is based on the [JSDoc spec](http://en.wikipedia.org/wiki/JSDoc). 

# Running the yuidoc task
Open a terminal application, and change into the root of your project directory. 

`grunt yuidoc`. 

This will compile your application's documentation into a doc folder at the root of your project. 

To start a server for the documentation app:

`grunt doc`

then go to localhost:8080. 

#Lavaca documenation
Lavaca's core framework comes fully documented using the yuidoc syntax. Application specific documentation of new classes, methods and properties should be written as part of the development process. 

If you are using an editor such as Sublime Text, a plugin that can help with documentation is the DocBlockr plugin.

The full syntax reference for yuidoc can be found at:
[yuidoc syntax reference](http://yui.github.io/yuidoc/syntax/)

#Customizing the documentation app
Lavaca comes bundled with a few customizations to the default yuidoc doc application theme. These customizations are located in the `libs/yuidoc` folder. 

  