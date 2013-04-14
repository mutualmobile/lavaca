# Getting Started

1. __Get the code__
```bash
$ mkdir [my_app] && cd [my_app]
$ git clone git@github.com:mutualmobile/lavaca.git .
```

2. __Get the branch__
```bash
$ cd git checkout -b [my_branch] origin/amd
```

3. __Install grunt__
Note: this may require sudo
```bash
$ npm install -g grunt-cli
```

4. __Install dev dependencies for our tasks to work__
```bash
$ cd source && npm install
$ npm install grunt
```

## Usage

Make sure you are always in `source` directory when you run the following commands

### Run

Precompiles Dust templates, starts development server, and watches the `www/templates` folder.

- __Run Development Environment__
```bash
$ grunt run
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

### Server

A task that simply runs a static server for local development and testing. Defaults to run on `localhost:8080` with `src` being the root directory.

- __Run the default static server__

```bash
$ grunt server
```
