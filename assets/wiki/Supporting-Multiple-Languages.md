# Using the Translations Module
The Lavaca JavaScript library includes a system for managing translated content, `lavaca/util/Translation`. This module can also be used to store and retrieve string messages, even for apps that don't support multiple languages.

## Understanding Locales
A **locale** is a combination of a two-character language code and a two-character country code. The language code should conform to [ISO 639-1](http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes). The country code should conform to [ISO 3166-1 Alpha-2](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).

A locale is written `language_COUNTRY`. United States English would be written as `en_US`. Mexican Spanish would be written as `es_MX`.

It's allowed for a locale to contain only a language code. The locale for generic English would be `en`. The locale for generic Spanish would be `es`.

## Setting the User's Locale
When you initialize `lavaca/util/Translation`, you can specify a default locale for the application. This code initializes the application with `en_US` as the default locale:

    var Translation = require('lavaca/util/Translation);
    Translation.init('en_US');

This is also shown in the sample application that ships with Lavaca in the app.js file. 

Some applications allow the user to switch to a different language. To change the default locale after the application has been initialized, use the `setDefault()` method:

    Lavaca.util.Translation.setDefault('es_MX');

## Creating Message Lookups
Before you can use `Lavaca.util.Translation`, you need to setup JSON objects that contain your translated strings. An example of a simple message table would be:

    {
      "foo": "This is the message under the foo key.",
      "bar": "This is the message under the bar key."
    }

In your HTML code, you'll need to create references to the messages that you want to use in your application. The translation system allows you to either reference an external messages file or to include the code inline.

In either instance, the `<script>` element is used to create the reference to the messages. The important thing to remember about the `<script>` element is that it allows references to arbitrary types of code that the browser will not execute unless it recognizes the value of the type attribute.

By changing the `<script>`'s type attribute to an arbitrary MIME type, we can include any kind of code without fear of the browser attempting to execute or display it:

    <script type="text/x-translation" data-name="en_US" data-src="messages/en_US.json"></script>

By default, Lavaca converts `<script>` elements with `type="text/x-translation"` into `lavaca/util/Translation` objects. You'll need to include a `data-name` attribute on the `<script>` element that's equal to the messages' locale.

### Storing Messages Inline
To include a message lookup directly in your HTML page, fill in the content of the `<script>` element with the message lookup code:

    <script type="text/x-translation" data-name="en_US">
      {
        "hello": "Hello!",
        "goodbye": "Goodbye!"
      }
    </script>

### Storing Messages Externally
To include your message lookup in a separate file, add a `data-src` attribute to the `<script>` element:

    <script type="text/x-translation" data-name="en_US" data-src="messages/en_US.json"></script>

And prepare a separate file (in this case `messages/en_US.json`) that contains your message lookup code:

    {
      "hello": "Hello!",
      "goodbye": "Goodbye, {0}!"
    }

You should also create equivocal lookups for other locales that your application will support. Keys between the different lookups should be exactly the same; only their values should change.

    <script type="text/x-translation" data-name="es_MX">
      {
        "hello": "¡Hola!",
        "goodbye": "¡Adiós, {0}!"
      }
    </script>

By convention, message lookup files should be stored in the `messages` folder.

Note that even though the `<script>` tag supports a `src` attribute, we use the `data-src` attribute instead. This is because browsers will automatically attempt download any file referenced from the `src` attribute. By using `data-src`, we prevent the browser from doing this and instead download the file on demand.

## Retrieving Messages
You can retrieve a message using the `get()` method. In its simplest form, just pass the key of the message you want.

When the default locale is set to `en_US`:

   
    var Translation = require('lavaca/util/Translation'); 
    Translation.get('hello'); // "Hello!"

When the default locale is set to `es_MX`:

    Translation.get('hello'); // "¡Hola!"

You can also explicitly pass a locale to get a specific message, regardless of the default locale:

    Translation.get('hello', 'es_MX'); // "¡Hola!"

You may want to be able to place variables in your messages. The best way to approach this is to use `lavaca/util/StringUtils` format method alongside the translation module.
    
    var StringUtils = require('lavaca/util/StringUtils');
    StringUtils.format(Translation.get('goodbye'), ['Ben']); // "Goodbye, Ben!"
    StringUtils.format(Translation.get('goodbye', 'es_MX'), ['Ben']); // "¡Adiós, Ben!"

# Translations and Templates
Lavaca includes a helper extension for dust templates that allows you to make use of string messages stored for `lavaca/util/Translation`. When referenced, the blocks will be automatically translated according the to user's current language settings.

Assuming that there's a translated string stored under the key `"greeting"` set to `"Hello"` for `en_US` and to `"Hola"` for `es_MX`, the template:

    {@msg key="greeting"/} {name}

When rendered with `{name: 'Susan'}`, would yield:

_en_US_

    Hello Susan

_es_MX_

    Hola Susan

Different languages often contain different grammatical structures. To simplify working with these differences, `lavaca/util/Translation` and the `{@msg}` helper tag allow you to substitute arguments into a translated value.

Let's say that `"greeting"` is set to `"Hello, {0}!"` for `en_US` and to `"¡Hola, {0}!"` for `es_MX`.

    {@msg key="greeting" p0=name /}

_en_US_

    Hello, Susan!

_es_MX_

    ¡Hola, Susan!

You can supply any number of parameters to the translation helper.

See [Using Templates to Generate HTML](Using-Templates-to-Generate-HTML) for more information about templates.