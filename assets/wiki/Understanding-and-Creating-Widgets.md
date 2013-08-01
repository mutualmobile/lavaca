# Understanding Widgets

## What is a Widget?
A Widget is an object used for creating reusable, self-contained user interface elements.  Every widget instance is associated to a specific DOM element and given a unique id.  Note, it is common to have multiple widgets and widget instances in a single view.

## Creating a Widget
Widget types should all extend `lavaca/ui/Widget`. Your widgets should usually be created under `/src/www/js/app/ui`, and each widget type should have its own file.

Here is an example of simple widget to control a loading class on an `<img>`:
 
    define(function(require) {
        var Widget = require('lavaca/ui/Widget');
        var ImageLoaderWidget = Widget.extend(function() {
            Widget.apply(this, arguments);

            this.beforeLoad();

            this.image = new Image();
            this.image.src = this.el.data("image-url");
            this.image.onload = this.afterLoad.bind(this);
        }, {
            loadingClassName: 'loading',
            loadedClassName: 'file-loaded',
            loadingCompleteClassName: 'loading-complete',

            beforeLoad: function() {
                if (!this.el) {
                    return;
                }
                this.el
                    .addClass(this.loadingClassName);
            },
            afterLoad: function() {
                if (!this.el) {
                    return;
                }
                this.el
                    .addClass(this.loadedClassName)
                    .css({'background-image':'url(' + this.image.src + ')'})
                    .addClass(this.loadingCompleteClassName);
                }
        });
        return ImageLoaderWidget;
    });

Notice that `this.el` is a jQuery element set by the constructor of our widget's supertype. The widget's `id` property is set to the `id` attribute of `this.el`. If the element doesn't have an ID, one is generated for it automatically.

# Instantiating a Widget

## Adding Widgets to Your View
All views that extend `lavaca/mvc/View` contain a helper for instantiating widgets.  When a view renders, it calls its `createWidget()` method that loops through the `widgetMap` object and instantiates the widget types for the selected elements.

To add a widget to the `widgetMap` for each element matching a selector, use the view's `mapWidget()` method:

    this.mapWidget(selector, TWidget);

...or alternately, if mapping multiple widgets:

    this.mapWidget({
      selector1: TWidget1,
      selector2: TWidget2
    });

...where `selector` is a jQuery selector string that finds the view's descendant elements that will be come new instances of the widget (i.e., `'.scrollable'`, and `TWidget` is the `lavaca/ui/Widget`-derived type that will be created for each of those widgets. 

If you want to map the widget to the view itself use `'self'` as the selector

    this.mapWidget('self', TWidget);

For information about views, see [Views and the View Manager](Views-and-the-View-Manager).