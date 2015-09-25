# Basic Scaffolding utility

Designed to be generic and configurable, blueprint will help you generate the most common class types during development.

# Sample Calls

To generate a new file, simply go to the command line, change to your projects directory where the GruntFile is located, and run one of these commands:

```shell
grunt blueprint:controller:ControllerName
grunt blueprint:view:ViewName
grunt blueprint:pageview:PageViewName
grunt blueprint:widget:WidgetName
grunt blueprint:model:ModelName
grunt blueprint:collection:CollectionName
```

**(new views will create an associated HTML and LESS file.  If you are using something like app.less to maintain included LESS files, you will have to manually add the include)


# Override templates
You can easily override the templates that come with this task. Simply overwrite files found in tasks/blueprint/templates/lavaca:

# Misc

To see the values that are available in the template that are coming from the task, run the command with the --verbose option.

```shell
grunt --verbose blueprint:view:ViewName
```

