Lavaca includes an iOS Xcode project that you can use as the basis of your iOS Cordova apps. By default, Lavaca is configured to build to this project.

# Configuring the iOS Xcode Project
Make sure that you've followed the steps outlined in [Starting a Project from Lavaca](Starting-a-Project-from-Lavaca) first.

# Modifing the Xcode Project
1. In your project folder, open `/cordova/platforms/ios/App.xcodeproj` in Xcode.

# Changing the App Name
1. In Xcode, select the project root (`App`). You should see target information for it appear
1. Go to the `Build Settings` tab of the target
1. Search for product name
1. You should see a node called `Product Name` in the search results
1. Expand the `Product Name` node and set the name of your app for both `Debug` and `Release`

# Changing the App Icons
The iOS app icons are located under the `/cordova/platforms/ios/App/Resources/icons` and `/cordova/platforms/ios/App/Resources/splash` folders of your Xcode project. Replace these files with the desired images.

# Running an iOS Project
Follow these steps to run a project in the iOS Simulator:

1. Run the build script to push the latest copy of your code to the cordova folder `/cordova/platforms/ios/www`. (See [Building Your Project](Building-Your-Project))
1. Open your project in Xcode `/cordova/platforms/ios`
1. Choose `Product > Clean`
1. Click the `Run` button