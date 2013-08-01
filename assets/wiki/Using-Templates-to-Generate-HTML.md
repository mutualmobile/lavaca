# Introduction to Client-Side Templating
For many years, server-side web application languages have featured templating engines that help intelligently transform data into HTML markup. Templating languages typically feature basic logic, like conditions and loops, and variable referencing. Some templating engines also feature the ability to include raw server code in templates (for example, including Java code directly in a JSP page rather than using only JSP tags).

As client-side applications have grown more complex and more of an emphasis has been placed on performance, JavaScript templating engines have begun to grow in popularity. A JavaScript templating engine accomplishes several things:

* Removing the burden of generating HTML code from the server
* Allowing just the data to be passed from the server to the client (not full–and often much larger–HTML markup)
* Allowing the presentation layer to be fully agnostic of what server-side technology is used, and so increasing the reusability of presentational code

There are a multitude of different client-side templating libraries available, such as Mustache.js, dust.js, underscore, and even XSLT. LinkedIn published an excellent article outlining the strengths and weaknesses of most popular JavaScript templating libraries as well as one justifying their own migration to client-side templating.

# Client-Side Templating in Lavaca
In Lavaca, an abstract base type, `lavaca/ui/Template`, serves as the foundation for all client-side templating. The `lavaca/ui/Template` type provides a generic way to use almost any templating engine to render data.

## Referencing Templates
In your HTML code, you'll need to create references to the templates that you want to use in your application. The Lavaca template system allows you to either reference an external template file or to include the code inline.

In either instance, the `<script>` element is used to create the reference to the template. The important thing to remember about the `<script>` element is that it allows references to arbitrary types of code that the browser will not execute unless it recognizes the value of the type attribute.

By changing the `<script>`'s type attribute to an arbitrary MIME type, we can include any kind of code without fear of the browser attempting to execute or display it:

    <script type="text/dust-template" data-name="example">Example Template Code Goes here</script>

By default, Lavaca converts `<script>` elements with `type="text/dust-template"` into `lavaca/ui/DustTemplate` objects. You'll need to include a data-name attribute on the script element in order to use the template later.

### Storing Templates Inline
To include template code directly in your HTML page, fill in the content of the `<script>` element with the template code:

    <script type="text/dust-template" data-name="example">
      {?employees}
        <ul>
          {#employees}
            <li>{name}</li>
          {/employees}
        </ul>
      {/employees}
    </script>

### Storing Templates Externally
To include your template code in a separate file, add a data-src attribute to the `<script>` element:

    <script type="text/dust-template" data-name="example" data-src="templates/example.html"></script>

And prepare a separate file (in this case `templates/example.html`) that contains your template code:

    {?employees}
      <ul>
        {#employees}
          <li>{name}</li>
        {/employees}
      </ul>
    {/employees}

By convention, template files should be stored in the `templates` folder.

Note that even though the `<script>` tag supports a `src` attribute, we use the `data-src` attribute instead. This is because browsers will automatically attempt download any file referenced from the `src` attribute. By using `data-src`, we prevent the browser from doing this and instead download the file on demand.

## Initializing Templates
The first thing that your app must do in order to take advantage of client-side templating is to initialize your templates. After your document has loaded (in the jQuery `ready` event), call `Template.init()`.

      var Template = require('lavaca/ui/Template');

      Template.init();

This function scans your document for template `<script>` references and prepares `lavaca/ui/Template` objects from them.

## Rendering a Template
When you want to render a specific template, you'll need to refer to it by name (the value of the `<script>` reference's `data-name` attribute) and provide the template with a data object.

    var model = {employees: [{name: 'Susan'}, {name: 'Fred'}, {name: 'Eric'}, {name: 'Brenda'}]},
        page = $('#page');
    Lavaca.ui.Template
      .render('example', model)
      .success(function(output) {
        page.html(output);
      })
      .error(function(err) {
        alert(err);
      });

The above code renders a template named example using a list of employees as the data, and then inserts the result into an element in the document.

You'll notice that template rendering is an asynchronous operation. This is because external files may need to be loaded in order to render the template. Rendering a template always results in an `lavaca/util/Promise` object that can be used to get the output HTML code.

For more information about the promises pattern, see [Promises Pattern](Promises-Pattern).

## Creating an Interface to a Templating Engine
Before you can use templates in your project, you'll need to extend `lavaca/ui/template` to handle your templating engine. Out-of-the-box, Lavaca includes `lavaca/ui/DustTemplate` which is an implementation for the [LinkedIn fork of dust.js](http://linkedin.github.com/dustjs/) along with the [LinkedIn helpers](https://github.com/linkedin/dustjs-helpers).

A template has two basic methods that need to be overridden in your engine-specific template type:

* `compile()` - Responsible for doing any work necessary to prepare the raw string code of the template to be usable by the templating engine
* `render()` - Responsible for converting a data object to HTML code that's ready to be inserted into the app

With `lavaca/ui/DustTemplate`, these methods are written to hook into the corresponding dust calls that parse the dust markup and generate HTML.

# Dust Templating Language
The templating engine that's included as a part of the boilerplate project is [LinkedIn fork of dust.js](http://linkedin.github.com/dustjs/) along with the [LinkedIn helpers](https://github.com/linkedin/dustjs-helpers). Dust templates feature a clean, tag-like syntax and a solid set of features.


# Dust templating with RequireJS
Lavaca utilizes a RequireJS plugin for integrating with Dust templates. See the plugin's full source code at:
[https://github.com/blai/require-dust](https://github.com/blai/require-dust)

As part of the build process in Lavaca's example project, all dust templates are compiled as part of the RequireJS optimizer step. 

In a `lavaca/mvc/View`, you can require the template similar to any other module:

    require('rdust!templates/example');

then in the templates property of your view, simply use the path above as the key for the template:

    template: 'templates/example'



## <a id="x-dust" />X-Dust
Prior to Lavaca 1.0.5, the default templating library was [x-dust](https://github.com/dannichols/x-dust), a dust.js variant. The x-dust syntax is nearly identical to dust.js, but the custom Lavaca helpers are implemented differently. For more information on syntax differences as well as how to use x-dust in new Lavaca apps, see the [x-dust module](https://github.com/mutualmobile/Lavaca-modules/tree/master/x-dust) in the [Lavaca-modules](https://github.com/mutualmobile/Lavaca-modules) repository.