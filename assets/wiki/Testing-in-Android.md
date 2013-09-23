Lavaca includes an Android project that you can use as the basis of your Android Cordova apps. By default, Lavaca is configured to build to this project.

# Configuring the Android Project
Make sure that you've followed the steps outlined in [Starting a Project from Lavaca](Starting-a-Project-from-Lavaca) and have installed Android SDK (and Eclipse) first.

# Creating the Eclipse Workspace
1. Open Eclipse. You should be prompted to select a Workspace.
1. Click Browse and create a new folder outside of your project repo.
1. Select the new folder as your Workspace folder and hit OK.
1. Choose `File > New > Android Project`. The Android Project dialog should appear.
1. Select `Create Project from Existing Source`
1. Under `Location`, hit `Browse` and select the android folder from your project folder
1. Set `Project Name` to the name of your app
1. Hit `Next`
1. Select an Android SDK to target. Google provides an Android release distribution guide to help you choose a version to target.
1. Hit `Next`
1. Change the `Application Name` to fit your app (ie, `My App`)
1. Change the `Package Name` to fit with your app (ie, `com.myapp`)
1. Hit `Finish`

# Changing the App Name
1. In Eclipse, open `res/values/strings.xml`
1. Change the value of the element named `app_name` to your desired app name. For example: `<string name="app_name">My App</string>`

# Customizing the App Images
The Android app icons are located under the `res` folder of your project. There are four different icons for different screen resolutions, each under a `drawable` folder and named `ic_launcher.png`. Replace these images with your desired icons.

# Running an Android Project
Follow these steps to run your project in the Android Virtual Device.

1. Run the build script to push the latest copy of your code to the Android `cordova/platforms/android/assets/www` folder. (See [Building Your Project](Building-Your-Project))
1. Open your project's Workspace in Eclipse
1. Right-click your project folder and choose `Refresh`
1. Right-click your project folder and choose `Run As > Android Application`.

You may need to select an Android Virtual Device to test in. Otherwise, the AVD should load and start your app.