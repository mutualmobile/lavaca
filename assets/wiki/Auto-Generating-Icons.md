Lavaca includes a shell script that auto generates all the icons and splash screen files that you would need for iOS, Android, and web. 

# Generating icons and splash screens

The basic usage is as follows:

    `./icongen.sh [app name] [platform] [environment (optional)] [buildString (optional)]`
    
- App name is the name provided in `build-config.json`, or if you have changed it manually in the iOS project it should match the name found at `cordova/platforms/ios/###/Resources`.
- Platform is `ios`, `android`, or `web`
- Environment is optional and should be `local`, `production` or `staging`
- Build string is optional and should be any string identifier that identifies that specific build `i.e. 1.0.0`
 
Example usage: `./icongen.sh lavaca web` or `./icongen.sh lavaca ios` or `./icongen.sh lavaca ios staging "1.0.0"`

If the optional parameters are provided, the script will add the environment and the build information onto the icon itself.