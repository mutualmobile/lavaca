# Introduction
CSS3 introduced transformations, the ability to scale, rotate, skew and translate elements in 2D or 3D space. While most browsers have now implemented the feature, they have varying levels of support and require vendor prefixes on the CSS `transform` property.

To make CSS transforms easy to use, the `lavaca/fx/Transform` module includes helpful jQuery extensions.

# Detecting Transform Support
You can determine whether or not a browser supports transforms using `isSupported()`.

    var Transform = require('lavaca/fx/Transform');
    if (Lavaca.fx.Transform.isSupported()) {
      alert('Transforms are supported by your browser');
    } else {
      alert('Transforms are not supported by your browser');
    }

Additionally, you can use `is3dSupported()` to check for support for 3D transforms.

    var Transform = require('lavaca/fx/Transform');
    if (Transform.is3dSupported()) {
      alert('Your browser supports 3D');
    } else {
      alert('Your browser does not support 3D');
    }

# Transform Helper Method
The `lavaca/fx/Transform` module includes a jQuery helper method that applies a transformation to an element, `$.fn.transform`. When transforms aren't supported, the helper method has no effect.

The most straightforward way to apply a transform is to enter a CSS string:

    $('.transformable').transform('translateX(10px) scaleY(50%) rotate(15deg)');

You can also pass in a hash of transform values to apply.

    $('.transformable').transform({
      scale: 0.5,
      translate: {
        x: 10,
        y: 10,
        z: 50
      },
      rotate: 45
    });

The above translates into the CSS transform string `scale(0.5, 0.5) translateX(10px) translateY(10px) translateZ(50px) rotate(45deg)`.

The `transform()` method automatically assumes that numbers passed to scale are percentages, numbers passed to translate are in pixels, and numbers passed to rotate are in degrees. Strings are used directly.

    $('.transformable').transform({
      scale: {
        x: '45%',
        y: 0.1
      },
      translate: {
        x: '50%',
        y: 10
      }
    });

The above translates into the CSS transform string `scaleX(45%) scaleY(10%) translateX(50%) translateY(10px)`.

You may want to pass an origin for the transformation in as well. The following scales the element 200% around its center:

    $('.transformable').transform({scale: 2}, {x: 0.5, y: 0.5});

You can also pass a CSS string directly as the origin:

    $('.transformable').transform({scale: 2}, '50% 50%');

Numbers passed as the origin are automatically assumed to be percentages.

When no origin is passed into `transform()`, the origin defaults to either whatever is defined in your stylesheets or by the browser's default styles.