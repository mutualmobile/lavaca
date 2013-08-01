The goal of Lavaca is to make it as quick and easy as possible to get a project up and running.

# Prequisites
Before you get started, you will need Xcode's command line tools and [Node.js](http://nodejs.org/). If you're going to be doing any Cordova (PhoneGap) development, make sure that you've installed Xcode and the iOS SDK as well as Android SDK (and Eclipse).

# Getting Started

## Quick Start
1. __Install *getlavaca* CLI tool__
```bash
$ curl https://raw.github.com/mutualmobile/lavaca/master/getlavaca > /usr/local/bin/getlavaca && chmod +x /usr/local/bin/getlavaca
```

2. __Go to your prefered root directory then run__
```bash
$ getlavaca
```
then follow instructions. You're good to go.



## Manual Setup

1. __Get the code__
```bash
$ mkdir [my_app] && cd [my_app]
$ git clone git@github.com:mutualmobile/lavaca.git .
```

2. __Install grunt-cli globally__
Note: this may require sudo
```bash
$ npm install -g grunt-cli
```

3. __Install dev dependencies for our tasks to work__
```bash
$ npm install
```

4. __Start Development Server__
```bash
$ grunt server
```
Your application should now be running on `localhost:8080`.



# Make modifications
You're now ready to start building your app on top of Lavaca. See [Project Structure](Project-Structure) for more information about each of the folders contained in the project and for guidance on where to put your custom code.

See [Build Configuration](Build-Configuration) and [Building Your Project](Building-Your-Project) for more information running the build script.

See [Testing in Android](Testing-in-Android), [Testing in iOS](Testing-in-iOS) and [Testing in Browser](Testing-in-Browser) for more information about reviewing your work in different environments.