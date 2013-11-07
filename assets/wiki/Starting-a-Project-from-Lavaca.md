The goal of Lavaca is to make it as quick and easy as possible to get a project up and running.

# Prequisites
Before you get started, you will need Xcode's command line tools and [Node.js](http://nodejs.org/). If you're going to be doing any Cordova (PhoneGap) development, make sure that you've installed Xcode and the iOS SDK as well as Android SDK (and Eclipse).

# Getting Started

1. __Get the code__
```bash
$ mkdir [my_app] && cd [my_app]
$ git clone https://github.com/mutualmobile/lavaca-starter.git .
```

2. __If you don't have it, install grunt-cli globally__
Note: this may require sudo
```bash
$ npm install -g grunt-cli
```

3. __If you don't have it, install bower globally__
Note: this may require sudo
```bash
$ npm install -g bower
```

4. __Install node dependencies for our tasks to work__
```bash
$ npm install
```

5. __Install client side dependencies__
```bash
$ bower install
```

6. __Start Development Server__
```bash
$ grunt server
```
Your application should now be running on `localhost:8080`.



# Make modifications
You're now ready to start building your app on top of Lavaca. See [Project Structure](Project-Structure) for more information about each of the folders contained in the project and for guidance on where to put your custom code.

See [Build Configuration](Build-Configuration) and [Building Your Project](Building-Your-Project) for more information running the build script.

See [Testing in Android](Testing-in-Android), [Testing in iOS](Testing-in-iOS) and [Testing in Browser](Testing-in-Browser) for more information about reviewing your work in different environments.