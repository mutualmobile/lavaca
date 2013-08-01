Lavaca utilizes [Grunt](http://gruntjs.com/) for it's build process. There are a number of preconfigured tasks that are shipped with Lavaca in order to make development, testing and deployment a breeze for your project. 

# Default
The default grunt task does the following:
* generates the test runner file
* executes the tests in a headless browser
* starts the development web server

`grunt`
# Test
The test grunt task does the following: 
* generates the test runner file
* executes the tests in a headless browser

`grunt test`
# build
The build grunt task does the following:
* builds the project for either only web or if cordova is integrated into the project will build the platforms for the project
* executes tasks for minifying, concatenating, and optimizng the JavaScript and CSS files associated with the project

`grunt build`
will build the project with the local.json configurationa and build for all platforms plus a deployable web application.

`grunt build:production`
will build the project with production.json configuration and build for all platforms.

`grunt build:production:ios`
will build the project with production.json and will only build the cordova ios platform.

## build task options
Inside the build task there is limited out of the box support for executing additional tasks during the build process. The tasks that are configurable are listed in the buildProject configuration in Gruntfile.js. The tasks are listed in order that they are added to the overall build process. A short description is below for each task:

* less - combines and minifies all less files imported into the main app.less file
* amd-dist - runs the requirejs optimizer with the task configuration for requirejs + the requireConfig settings in boot.js
* uglify - obfuscates and minifies the source javascript files after optimization has taken place to reduce the payload size
* preprocess - this will transform the index.html file with the appropriate configuration file and take out some of the debug code in index.html

These can be set on a per-environment basis.

# Doc
The doc grunt task does the following:
* runs the yuidoc task to compile the code documentation and starts a server for the doc folder that was created

`grunt doc`
# Server
Lavaca comes with a generic server task for serving static files. The default configuration contains targets for the local development site, the built site(available after running the build process), and the documentation site. The server task also comes with the option for a simple proxy server to get around any cross domain issues you may have making ajax requests locally. 

`grunt server`
## Serving up the built app
`grunt server:prod`

## Setting up the proxy server
Make the following changes to configure the proxy server
* Find the local target of the server task in the Gruntfile
* modify apiPrefix to be a value you want to prepend to your requests when developing locally, the default is /api
* add an option for apiBaseURL, this should be the base url of the api without http/https included. 

If the api is served over https, you should add a value in the config for the local server for proxyPort as well. Typically this will be 443. The default value is 80. 

When making requests locally with the proxy functionality, you will need to programmatically decide whether or not to prepend the api prefix to your requests. 

One potential solution would be to also include the api prefix and api base url values in your local config file for lavaca. 

then before making a request, check to see if that value exists in your local config:

`var url = Config.get('apiPrefix') ? Config.get('apiPrefix') + '/endpoint' : Config.get('apiBaseUrl') + this.url;`

This will be different project by project but is something to be aware of. 


# Remaining Tasks
The remaining tasks in the Gruntfile are used in combination with the tasks described above or with the build task described in [Building-Your-Project](Building-Your-Project)