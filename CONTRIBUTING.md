## Getting Started

Before you run anything else, make sure you have the dependencies pulled down:

```
npm install
bower install
```

## Running unit tests

`npm run-script test -- <arguments>`

Any `<arguments>` will be passed to the `karma` executable ([full list
here](https://karma-runner.github.io/0.13/config/configuration-file.html)).
Tests are configured to run in the Chrome browser by default. To use a
different browser, download the [karma
launcher](https://karma-runner.github.io/0.13/config/browsers.html) for your
preferred browser and pass the `--browsers` argument, e.g.

```
npm install karma-firefox-launcher
npm run-script test -- --browsers=Firefox
```

## Debugging unit tests

`npm run-script test -- --single-run=false`

A Chrome window will open in the background displaying "Karma v0.13.22 -
connected". Click the "DEBUG" button to run the unit tests. Use DevTools
(Cmd+Alt+i or Ctrl+Shift+i) to debug. Refreshing the window will re-run the
unit tests.

## Code coverage

`npm run-script coverage`

Open `test/coverage/<browser>/lcov-report/index.html` in a web browser to view
coverage results.

## Building

`npm run-script <module-format>`

Where `<module-format>` is one of:
- `amd`: transcompile `src/` to AMD modules and write to `build/amd/`
- `commonjs`: transcompile `src/` to CommonJS modules and write to `build/commonjs/`
- `es`: transcompile `src/` to ES6 modules and write to `build/es/`
- `--all`: transcompile `src/` to all of the above module formats

## Publishing to NPM

`npm run-script publish`

Lavaca is distributed in three npm packages:
- `lavaca-amd`: lavaca transcompiled to AMD format
- `lavaca-commonjs`: lavaca transcompiled to CommonJS format
- `lavaca-es6`: lavaca in its original ES6 module format

If you are a package owner of all three, `npm run-script publish` will build
all three flavors of Lavaca and publish each one to the npm registry.
