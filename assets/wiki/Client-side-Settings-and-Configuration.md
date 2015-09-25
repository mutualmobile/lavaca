# Introduction
Managing different configurations is a key part of the software development lifecycle. Commonly, you'll need to supply different URLs, keys and/or settings for each environment (local development, staging, and production). As a best practice, this configuration information should remain separate from the rest of the app and should be free of ties to logic or UI elements.

# Using Config.js
Lavaca incorporates its own system to help you easily manage configurations for different environments, `src/www/js/app/env/Config.js`.

## Environment Names
Every environment involved in your project should have its own unique name. Typically, the names you would use are:

* `local`, for code on each developer's local machine
* `staging`, for code is deployed to for QA or review
* `production`, for code that is released for public use

These names are a recommendation and are applicable to the majority of projects. You may find that your project has additional or different needs, though, and should select a name for each distinct environment.

## Creating Configurations
Each of your named environments will need its own configuration. A configuration is a simple JSON lookup of key-value pairs. For example:

    case 'production':
        Config = {
            "apiURL": "http://path/to/api/",
            "apiKey": "1234567",
            "googleAnalyticsKey": "ABCDEF"
        };
        break;

The build process included with Lavaca allows you to build your application with a specific configuration file. 

For more information on how to build your application to use a specific configuration, please see [Building your project](Building-Your-Project).

## Retrieving a Configuration Value
You can retrieve the current environtment by accessing `window.env` and you can retrieve a specific configuration value using dot notation. 

    var Config = require('app/env/Config');
    var value = Config.googleAnalyticsKey;
