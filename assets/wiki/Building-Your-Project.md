Lavaca offers a quick way to prepare your projects for production and efficiently conduct testing, all powered by [GruntJS](http://gruntjs.com/). The Grunt configuration ships with the most common tasks that a project needs for developing an app. Before you start, make sure that you've gone through all the steps outlined in [Starting a Project from Lavaca](Starting-a-Project-from-Lavaca).

# Adding Cordova to your project
Lavaca ships with a sample single page application, with no assumptions on the platform/devices you will be supporting for your project. If your project is supporting certain platforms using Cordova, Lavaca's build process will assist you in adding in the platforms you need to the build process.

## Install the Cordova CLI
Assuming npm is already installed, simply run:

`npm install -g cordova`

from your terminal application.  This must be installed before you can proceed with the steps below.

## Initializing the project with cordova
The Gruntfile has configuation options for setting some initial properties for your Cordova project. Out of the box, the grunt tasks will initialize the project for both ios and android. To only build for ios for example, locate the platforms property of the initPlatforms task, and alter the array to only contain 'ios'.  To set the application name for your platforms projects, either use the configuration in the initCordova task in the Gruntfile.js or after you have initialized the project use the config.xml file. In your terminal application, navigate to the root of your project where the Gruntfile.js is located.

Execute `grunt cordovaInit`.

This will automate running the commands that you would normall have to run separately with the Cordova cli, plus integrate the base Lavaca project into the process.

# Running a Build from the Terminal
To run a build from the terminal, follow these steps:

1. Open Terminal
1. Set the working directory to your project's folder (ie, /path/to/my/project/trunk): `cd "/path/to/my/project/trunk"`
1. Run the build task: `grunt build`

## Building for a specific environment configuration

The build task allows you to specify which Lavaca configuration to be used in the build code base. The default configuration used is local.json.

To build the app with a different configuration, pass the environment you want to build with on the command line.

`grunt build:production`

Additional configurations can be added without any code changes. The parameter is used to lookup the filename housed in the configs directory. For example, to add a configuration for a development server, create a file called development.json in the configs folder. To use this configuration when you build the app, from the terminal run:

`grunt build:development`

## Building for a specific environment and platform

The build task will also let you choose which platform to build for is you so desire. By default it will build for the platforms listed in the initPlatforms task in the Gruntfile. To build for a specific platform, run:

`grunt build:production:ios`

where the first parameter is the configuration you want to use for Lavaca, and the second parameter is the platform.


## What Happens When You Run a Build
The default build task performs these actions:

1. If a build has been run previously, the tmp and build folders will be deleted.
1. The project `src` folder is copied to a temporary directory named `tmp`.
1. The project's Less files are concatenated and minified.
1. The project's JavaScript files are checked for any dependency errors and run through the requireJS [optimizer](http://requirejs.org/docs/optimization.html).
1. The resulting file is run through uglify js to compress and obfuscate the code
1. The `tmp` folder contents are copied into the `build` folder.
1. The index.html file is run through the preprocess task which replaces various tokens in the file to associate the appropriate configuration, css, and javascript files for the build.

## Customizing the build
The build process that ships with Lavaca is completely customizable. See the GruntJS documentation on configuration of tasks for more information.

For more information on the tasks that ship with Lavaca, see [Build Configuration](Build-Configuration).
