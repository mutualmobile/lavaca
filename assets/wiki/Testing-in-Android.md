Lavaca includes an Android project that you can use as the basis of your Android Cordova apps. By default, Lavaca is configured to build to this project.

# Configuring the Android Project
Make sure that you've followed the steps outlined in [Starting a Project from Lavaca](Starting-a-Project-from-Lavaca) and have installed Android SDK (and Android Studio) first.

# Creating the Android Studio Workspace
1. Open Android Studio. You should be prompted to open a project.
1. Select your Android platform code `cordova/platforms/android`

# Changing the App Name
1. Open `res/values/strings.xml`
1. Change the value of the element named `app_name` to your desired app name. For example: `<string name="app_name">My App</string>`

# Customizing the App Images
The Android app icons are located under the `res` folder of your project. There are four different icons for different screen resolutions, each under a `drawable` folder and named `ic_launcher.png`. (See [Auto Generating Icons](Auto-Generating-Icons))

# Running an Android Project
Follow these steps to run your project in the Android Virtual Device.

1. Run the build script to push the latest copy of your code to the Android `cordova/platforms/android/assets/www` folder. (See [Building Your Project](Building-Your-Project))
1. Open your project in Android Studio
1. Run `Syncronize`
1. Run `Run Android`.

You may need to select an Android Virtual Device to test in. Otherwise, the AVD should load and start your app.