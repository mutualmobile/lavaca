# Lavaca with grunt

Lavaca with grunt is a Lavaca branch optimized for build processes with command line build tool [Grunt](http://gruntjs.com). All the grunt build tasks are defined in grunt.js. This branch is highly experimental and welcomes any changes made towards the grunt tasks to make the build process better and even more automated. 

## Setup

1. __Get the code__
```bash
$ git clone git@github.com:mutualmobile/lavaca.git [my_app]
```

2. __Get the branch__
```bash
$ cd [my_app] && git checkout -b grunt origin/grunt
```

3. __Install grunt__
```bash
$ npm install -g grunt
```

4. __Install dev dependencies for our tasks to work__
```bash
$ cd source && npm install
```

## Usage

Make sure you are always in `source` directory when you run the following commands

### Build

Precompiles LESS and Dust templates, concats and minifies all CSS and JavaScript files, generates `index.html` based on Dust template file `layout.html`, and builds all related files to `www`, `android/assets/www` and `ios/www` directories. 

- __Build with local config__
```bash
$ grunt build
```

- __Build with staging config__ (a copy of the build will also be available in `www-staging` folder)
```bash
$ grunt build-staging
```

- __Build with production config__ (a copy of the build will also be available in `www-production` folder)
```bash
$ grunt build-production
```

### Test

Starts a local server and runs unit tests defined in `test/unit` directory with [Jasmine](http://pivotal.github.com/jasmine/). This task will open a new window in the system default browser to show the test results.

- __Test with JavaScripts source files from `src/js` folder__ (unminified)
```bash
$ grunt test:unminified
```

- __Test with JavaScripts source files from `www/js` folder__ (minified)
```bash
$ grunt test:minified
```

When you return to terminal, please do `control + C` to terminate the server before you run more tasks. This task is not smart enough to shut down the server when tests are done.

### Docs

Generates JavaScript documentation using [Atnotate](https://github.com/mutualmobile/lavaca/wiki/5.4.-Documentation-Generation-with-Atnotate). The resulting documentation is outputed to the `docs` folder.

- __Generate JavaScript Documentation__
```bash
$ grunt docs
```

### Dust JS

Precompiles Dust templates in `src/templates` to `src/js/app/ui/templates.js`.

- __Compile Dust templates__
```bash
$ grunt dustjs
```

### LESS

Precompiles LESS in `src/css` to `src/css/app/app.css`.

- __Compile LESS__
```bash
$ grunt less
```

### Default

A convenient task generates generated docs, builds with local config, and runs unit tests with minified source immediately after.

```bash
$ grunt
```

Behind the scenes, grunt is actually running the following for you:
```bash
$ grunt docs && grunt build && grunt test:minified
```

### Server

A task that simply runs a static server for local development and testing. Defaults to run on `localhost:8080` with `src` being the root directory.

- __Run the default static server__
```bash
$ grunt static-server
```

- __Run a custom server__
```bash
$ grunt static-server:[root_dir]:[port]
```

### Build, Watch & Build more automatically

Runs the aforementioned build task first, starts a static server at `localhost:8080` with `src` being the root directory for debugging, then starts watching all dev changes made in `src` folder and continues to build whenever a files is changed, add, deleted, and etc.

- __Run with local config__
```bash
$ grunt run
```

- __Run with staging config__
```bash
$ grunt run-staging
```

- __Run with production config__
```bash
$ grunt run-production
```

## Adding JavaScript, CSS and unit test files

Since `index.html` is generated with `layout.html` template, all the script and css file references are not managed in `index.html` anymore. Every time, a script, css or unit test file is added, please add a reference to one of the following JSON files so grunt can pick it up.
```
build/
  scripts/
    app.json
    lavaca.json
    test.json
  styles/
    app.json
    lavaca.json
```