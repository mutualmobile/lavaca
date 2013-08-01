# Introduction
With the `lavaca/net/Connectivity` module, you can monitor the user's network connection and provide an immediate fallback when the internet is unavailable. So, for instance, you can immediately pop an alert to the user when their network signal drops and they try to make a request rather than having to wait for the request to timeout.

# Detecting Connectivity
With the `isOffline()` function, you can detect whether or not the user currently has internet connectivity:
    
    var Connectivity = require('lavaca/net/Connectivity');
    if (Connectivity.isOffline()) {
      alert('No internet for you!');
    } else {
      alert('Hooray for internet!');
    }

The `isOffline()` function is contingent on a either the Cordova SDK being present (in the case of a hybrid app) or support for the `navigator.onLine` flag. When neither of those two items is present, the function will always report that the user is online.

# Making an AJAX Request
Using the `Lavaca.net.Connectivity` module's `ajax()` method, you can make an AJAX request that immediately fails when the user is offline (variable based on the browser's support of offline detection API's). The `ajax()` method takes a jQuery-style AJAX parameters object:

    
    Connectivity.ajax({
      url: '/path/to/api',
      params: {a: 1, b: 2},
      dataType: 'json',
      success: function(response) {
        alert(response.foo);
      },
      error: function() {
        alert('error');
      }
    });

The `ajax()` method returns an `Lavaca.util.Promise` object:

    Connectivity
      .ajax({
        url: '/path/to/api',
        params: {a: 1, b: 2},
        dataType: 'json'
      })
      .success(function(response) {
        alert(response.foo);
      })
      .error(function() {
        alert('error');
      });

This could also be written as:

    Connectivity
      .ajax({
        url: '/path/to/api',
        params: {a: 1, b: 2},
        dataType: 'json'
      }).then(success, error);

      var success = function(response) {
        alert(response.foo);
      };

      var error = function() {
        alert('error');
      };

For more information about the promises pattern, see [Promises Pattern](Promises-Pattern).

# Handling an Offline Request
Using the `registerOfflineAjaxHandler()` function, you can add global callbacks that execute whenever the user attempts to make an AJAX request and the device has no network connection.

    Connectivity.registerOfflineAjaxHandler(function() {
      alert('You currently have no network access.');
    });

Offline AJAX handlers are only checked when the `Connectivity.ajax()` function is used. For this reason, it is recommended that all AJAX calls in your app be funneled through `Connectivity`.