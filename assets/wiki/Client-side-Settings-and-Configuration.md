# Introduction
Managing different configurations is a key part of the software development lifecycle. Commonly, you'll need to supply different URLs, keys and/or settings for each environment (local development, staging, and production). As a best practice, this configuration information should remain separate from the rest of the app and should be free of ties to logic or UI elements.

# Using the Config Module
Lavaca incorporates its own system to help you easily manage configurations for different environments, `lavaca/util/Config`.

## Environment Names
Every environment involved in your project should have its own unique name. Typically, the names you would use are:

* `local`, for code on each developer's local machine
* `staging`, for code is deployed to for QA or review
* `production`, for code that is released for public use

These names are a recommendation and are applicable to the majority of projects. You may find that your project has additional or different needs, though, and should select a name for each distinct environment.

## Creating Configurations
Each of your named environments will need its own configuration. A configuration is a simple JSON lookup of key-value pairs. For example:

    {
      "apiURL": "http://path/to/api/",
      "apiKey": "1234567",
      "googleAnalyticsKey": "ABCDEF"
    }

The build process included with Lavaca allows you to build your application with a specific configuration file. 

In either instance, the `<script>` element is used to create the reference to the configurations. The important thing to remember about the `<script>` element is that it allows references to arbitrary types of code that the browser will not execute unless it recognizes the value of the type attribute.

By changing the `<script>`'s type attribute to an arbitrary MIME type, we can include any kind of code without fear of the browser attempting to execute or display it:

    <script type="text/x-config" data-name="staging" data-src="configs/staging.json"></script>

By default, Lavaca converts `<script>` elements with `type="text/x-config"` into `lavaca/util/Config` objects. You'll need to include a data-name attribute on the `<script>` element that's equal to the name of the configuration's environment.

These tags are inserted into the application's index.html file during the build process. 

By convention, configuration files should be stored in the `configs` folder.

For more information on how to build your application to use a specific configuration, please see [Building your project](Building-Your-Project).

## Retrieving a Configuration Value
You can retrieve a configuration value using the `get()` method. In its simplest form, just pass the key of the configuration item that you want.

    var Config = require('lavaca/util/Config');
    var value = Config.get('googleAnalyticsKey');

## Using configuration settings in templates
Lavaca includes a helper extension that allows you to make use of configuration variables in your templates. This could be useful for printing configuration variables as well as possibly hiding/showing content in different environments.

To read a configuration variable with the key `api_url`, use the following syntax:

    {@config key="api_url" environment="production"/}

The environment parameter is optional. If omitted, Lavaca will read from the current environment.

You can also selectively render or skip certain content based on the current environment. For example, you may want to show a debug menu only in your local environment.

    // Only show some content in a local environment
    {@config only="local"}<div class="debug-menu">...</div>{/config}

    // Show one version of the content in production, and another
    // version of the content in all other environments
    {@config not="production"}
      <p>Some content</p>
    {:else}
      <p>Other content</p>
    {/config}