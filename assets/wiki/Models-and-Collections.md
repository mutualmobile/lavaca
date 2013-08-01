# Understanding Models

## What is a Model?
A model is a data container. Models in an `lavaca/mvc` project are responsible for carrying data, validating data, retrieving data from the server, saving data to the server, and notifying other parts of the application when the data changes.

Note that models aren't aware of the rest of the application; they're very inwardly-focused. A model doesn't care how it's data is used or accessed or what the general state of the application is. The model's sole concern is managing its own content.

## Creating a Model
The simplest way to create a model is to directly instantiate `lavaca/mvc/Model`.
<script type="codemirror" data-name="model">
  var Model = require('lavaca/mvc/Model');
</script>
<pre class="runable model"><code>var Model = require('lavaca/mvc/Model'),
    model = new Model();
console.log(model.toObject());
</code></pre>

You can also set default values for a model when it's created, or apply data to an already existing model:

<pre class="runable model"><code>var model = new Model({foo: 'Some default value', bar: 123});
console.log(model.toObject());
</code></pre>

Custom models that extend from Model can set a `defaults` attribute on the prototype which contains a hash of default attributes. When a new instance is created, it's attributes will be merged with the attributes from the defaults hash, overwriting the default attributes with the same name.

<pre class="runable model"><code>var PersonModel,
    person;
PersonModel = Model.extend({
  defaults: {
    firstName: 'John',
    lastName: 'Doe'
  }
});
person = new PersonModel({
  lastName: 'Smith'
});
console.log(person.get('firstName') + ' ' + person.get('lastName'));
</code></pre>

## Using Attributes
**Attributes** are the key-value pairs that make up the model's data set. Models track their attributes and are aware of when those attributes' values have been changed.

### Getting Attribute Values
You call a model's `get()` function to retrieve the value of a stored attribute.

<pre class="runable model"><code>var model = new Model({foo: 123, bar: 'abc'});
console.log(model.get('foo'));
</code></pre>

When an attribute doesn't exist, the `get()` function will return `null`.
<script type="codemirror" data-name="empty-model">
  var Model = require('lavaca/mvc/Model'),
      model = new Model();
</script>
<pre class="runable empty-model"><code>console.log(model.get('doesNotExist'));
</code></pre>


### Setting Attribute Values
Call the model's `set()` function to assign or replace an attribute's value.

<pre class="runable empty-model"><code>model.set('foo', 456);
console.log(model.get('foo'));
</code></pre>

You can set multiple attributes at once using the `apply()` function:

<pre class="runable empty-model"><code>model.apply({first: 'abc', second: 'def'});
console.log(model.toObject());
</code></pre>

### Removing Attributes
If you want to remove all values from the model:

<pre class="runable empty-model"><code>model.apply({first: 'abc', second: 'def'});
console.log(model.toObject());
model.clear()
console.log(model.toObject());
</code></pre>
    
### <a id="computed-attributes"/>Computed Attributes
Lavaca also supports attributes that are computed dynamically via a function. To use computed attributes, set the value of an attribute to be a function. Then, when you call `model.get('computedAttributeName')` the model will return the result of the function instead of the function itself.

When a model is converted to an object via toObject, lavaca also returns the result of a computed attribute instead of the actual function.

For an example of using a computed attribute, consider a model that represents a person.
    
<pre class="runable model"><code>var model = new Model({
      firstName: 'John',
      middleName: 'Wilkes',
      lastName: 'Booth',
      fullName: function() {
        return [this.get('firstName'), this.get('middleName'), this.get('lastName')].join(' ');
      }
    });
    
console.log(model.get('fullName'));
console.log(model.toObject());
</code></pre>
    
This also means that when a model with a computed attribute is passed to a template, the template will have access to the result of the computed attribute just as it would with any other normal attribute.

If the above model was passed to a template `<h1>{fullName}</h1>` the output would be `<h1>John Wilkes Booth</h1>`.

Note that because the return value of a computed attribute is entirely dependent on the function's implementation, the model will not be aware of when that return value changes and thus will not fire change events for that attribute unless you actually re-set the attribute to either a different value or function.
  
  
## Using Flags
In some instances, you may want to flag an attribute in order to group them together. A **flag** is a metadata string that describes an attribute. You can set flags on attributes at the same time as you set their values.

You can use any string value as a flag. The `lavaca/mvc/Model` type includes a string constant, `SENSITIVE`, that's meant for use as a flag for user-specific information.

    var model = new Model({today: new Date});
    model.set('authToken', 12345, Model.SENSITIVE);

The above code snippet flags the model's `authToken` attribute as sensitive information. The `today` attribute is not flagged, as it's not user-specific information.

If the user in this scenario were to log out, you could use flags to remove all the sensitive information from memory, while leaving other data intact:
<script type="codemirror" data-name="flag">
  var Model = require('lavaca/mvc/Model');
  var model = new Model({today: new Date});
  model.set('authToken', 12345, Model.SENSITIVE);
</script>
<pre class="runable flag"><code>model.clear(Model.SENSITIVE);
console.log(model.get('today'));
console.log(model.get('authToken'));
</code></pre>

## Attribute Validation
Every model maintains a list of validation rules that it uses to check its attributes. A **rule** is a function that accepts the name of an attribute and a possible value, and returns `false` when the value is not valid for that attribute. When a validation rule has no objection to the proposed value, it should return `true`.

### Adding Validation Rules
Here's an example of a function that could be used as a validation rule for an attribute that should be a number:

    function checkNumeric(attribute, value) {
      return !isNaN(value);
    }

And here's a function that could be used as a validation rule for an age value:

    function checkAge(attribute, value) {
      return value > 0 && value < 130;
    }

To use a validation rule, it must be added to the model, along with an error message that's used when the validation rule returns `false`:

    var person = new Model();
    person.addRule('age', checkNumeric, 'Your age must be a number');
    person.addRule('age', checkAge, 'Your age must be between 0 and 130');

After the validation rule has been added, values will be tested before an attribute can be changed. The `set()` function returns `true` if the change was successful and `false` if validation failed and no change was made.
<script type="codemirror" data-name="validation">
  var Model = require('lavaca/mvc/Model');
  function checkNumeric(attribute, value) {
    return !isNaN(value);
  }
  function checkAge(attribute, value) {
    return value > 0 && value < 130;
  }
  var person = new Model();
  person.addRule('age', checkNumeric, 'Your age must be a number');
  person.addRule('age', checkAge, 'Your age must be between 0 and 130');
</script>
<pre class="runable validation"><code>console.log(person.set('age', 37));
// true
console.log(person.get('age'));
// 37
console.log(person.set('age', 294));
// false
console.log(person.get('age'));
// 37
console.log(person.set('age', 'xyz'));
// false
console.log(person.get('age'));
// 37
</code></pre>

### Suppressing Validation
There may be times when you want to stop validation from running. When you want to be able to set a value without applying validation rules, use the model's `suppressValidation` property.

<pre class="runable validation"><code>person.suppressValidation = true;
console.log(person.set('age', 'xyz'));
// true
console.log(person.get('age'));
// "xyz"
person.suppressValidation = false;
console.log(person.set('age', 999));
// false
console.log(person.get('age'));
// "xyz"
</code></pre>

Validation is automatically suppressed when fetching data from the server or when initializing the model. Generally, though, you won't want to suppress validation.

### Validating the Model
If you want to check a model's validity, you call its `validate()` function. The `validate()` function returns a hash of invalid attributes names to a list of error messages for that attribute.

<pre class="runable validation"><code>console.log(person.validate());
</code></pre>
You can also check a specific attribute's validity. When called for a specific attribute, `validate()` returns a list of error messages for that attribute.

<pre class="runable validation"><code>console.log(person.validate('age'));
</code></pre>

Lastly, you can check a hypothetical value for an attribute.

<pre class="runable validation"><code>console.log(person.validate('age', 37));
// []
console.log(person.validate('age', 999));
// ['Your age must be between 0 and 130']
</code></pre>

## Attribute Events
A `lavaca/mvc/Model` dispatches events whenever its attributes are modified. An attribute event has the following properties:

* `attribute` - The name of the attribute that changed
* `previous` - The value of the attribute before the event
* `value` - The value of the attribute after the event
* `messages` - A list of validation messages that the change caused
* `target` - The model that created the event

Models will dispatch the following attribute events:

* `change` - When an attribute's value changes
* `invalid` - When the application tries to set an attribute's value, but the value doesn't pass the attribute's validation rules

To listen for events from a model, use its `on()` function. You can either listen to events from a specific attribute or listen to events for every attribute.

<script type="codemirror" data-name="validation-events">
  var Model = require('lavaca/mvc/Model');
  function checkNumeric(attribute, value) {
    return !isNaN(value);
  }
  function checkAge(attribute, value) {
    return value > 0 && value < 130;
  }
  var person = new Model();
  person.addRule('age', checkNumeric, 'Your age must be a number');
  person.addRule('age', checkAge, 'Your age must be between 0 and 130');
  person.on('change', 'age', function(e) {
    console.log('Your age changed from ' + e.previous + ' to ' + e.value);
  });
  person.on('change', function(e) {
    console.log('The attribute called ' + e.attribute + ' was changed');
  });
  person.on('invalid', 'age', function(e) {
    console.log('All these things are wrong with your age: ' + e.messages.join('\n'));
  });
</script>
    person
      .on('change', 'age', function(e) {
        console.log('Your age changed from ' + e.previous + ' to ' + e.value);
      })
      .on('change', function(e) {
        console.log('The attribute called ' + e.attribute + ' was changed');
      })
      on('invalid', 'age', function(e) {
        console.log('All these things are wrong with your age: ' + e.messages.join('\n'));
      });

<pre class="runable validation-events"><code>person.set('age', 50);
</code></pre>
<pre class="runable validation-events"><code>person.set('age', 131);
</code></pre>
You can stop a model from generating events by setting its `suppressEvents` property to `false`.

For more information about events, see [Understanding Event Dispatchers](Understanding-Event-Dispatchers).

## Loading and Saving Data
The `lavaca/mvc/Model` type is built to load data from the server and save that data back. To load data, use the `fetch()` method:

<pre class="runable model"><code>var model = new Model();
model
  .fetch('/mock/signIn.json')
  .then(function(response) {
    console.log(model.toObject());
  });
</code></pre>
To update data on the model and save it back to the server, call the model's `saveToServer()` method:

    model
      .saveToServer('/api/save/model/123.json')
      .then(function(response) {
        alert('Saved model data to the server and got this response: ' + JSON.stringify(response));
      });

By default, the model will only attempt to save changed attributes to the server (unless the model doesn't have an ID, in which case it's considered new to the server and all attributes are saved). To use custom logic, can supply a callback to the model's `save()` method:

    model
      .save(function(model, changedAttributes, attributes) {
        var promise = new Promise(this);
        promise.when(Connectivity.ajax({
          url: '/api/save/model/123.json',
          data: attributes
        });
        return promise;
      })
      .then(function(response) {
        alert('Saved the model data to the server and got this response: ' + JSON.stringify(response));
      });

If you want to disable change tracking, you can use the model's `suppressTracking` property.

Whenever a model is fetched or saved, the model will dispatch `fetchSuccess`/`fetchError` or `saveSuccess`/`saveError` events.

For more information about events, see [Understanding Event Dispatchers](Understanding-Event-Dispatchers).

# Understanding Collections

## What is a Collection?
A **collection** is a set of models contained by an `lavaca/mvc/Collection` object. Collections help you manage sets of models in the same way that models manage sets of data points.

Collections are themselves models, and do all of the same things that other `lavaca/mvc/Model`s do: dispatch events about data changes, manage loading and saving, and run validation routines.

## Creating a Collection
The most straightforward way to create a collection is to instantiate `lavaca/mvc/Collection`.

<script type="codemirror" data-name="collection">
  var Collection = require('lavaca/mvc/Collection'),
      Model = require('lavaca/mvc/Model');
</script>
    var collection = new Collection();

Like with `lavaca/mvc/Model`, you can supply a default data set for your collection.

<script type="codemirror" data-name="sample-collection">
  var Collection = require('lavaca/mvc/Collection');
  var collection = new Collection([{id: 1, name: 'Susan', sex: 'F'}, {id: 2, name: 'Fred', sex: 'M'}]);
</script>
<pre class="runable collection"><code>var collection = new Collection([{id: 1, name: 'Susan', sex: 'F'}, {id: 2, name: 'Fred', sex: 'M'}]);
console.log(collection.count());
</code></pre>

## The Collection's Model Type
Every collection uses one type of model for the items that it contains. By default, this model type is `lavaca/mvc/Model`. When an item is added to a collection, a model of that type is created wrapping that item (unless the item is already that type of model).

<pre class="runable sample-collection"><code>console.log(collection.itemAt(0).get('name'));
</code></pre>

You can change the type of model used for items in the collection by setting the collection's `TModel` property.

This example code creates a new model type that has some built-in validation rules, and creates builds a collection using that type.

<pre class="runable collection"><code>var MyModelType = Model.extend(function() {
      Model.apply(this, arguments);
      this.addRule('name', this.isAlpha, this.alphaMessage);
    }, {
      alphaMessage: 'Your name must contain only letters, hyphens, and spaces',
      isAlpha: function(attribute, value) {
        return /^[-a-zA-Z ]+$/.test(value);
      }
    }),
    collection = new Collection();
collection.TModel = MyModelType;
collection.add({id: 1, name: 'Susan'}, {id: 2, name: 'Fred'});
collection.on('invalidItem', function(e) {
  console.log(e.messages.join(' '));
});
collection.on('changeItem', function(e) {
  console.log('You changed ' + e.previous + ' to ' + e.value);
});
// Try changing to a valid name
collection.itemAt(0).set('name', 12345);
</code></pre>
A collection's model type must always derive from `lavaca/mvc/Model`.

## Working with the Models in a Collection
All of the models in collection are stored in that collection's `models` property. You should never manipulate the models property directly. Instead, use one of the methods outlined below.

### Adding a Model to a Collection
To add a model to a collection, use the `add()` method.

<pre class="runable sample-collection"><code>collection.add({id: 3, name: 'Calvin'});
console.log(collection.count());
</code></pre>
You can also use the `add()` method to add multiple items into the collection.

<pre class="runable sample-collection"><code>collection.add({id: 3, name: 'Brenda', sex: 'F'}, {id: 4, name: 'Eric', sex: 'M'}, {id: 5, name: 'Luke', sex: 'M'});
console.log(collection.count());
</code></pre>

### Iterating Through the Collection
You'll typically use the collection's `each()` method to iterate through each model.
<script type="codemirror" data-name="full-collection">
  var Collection = require('lavaca/mvc/Collection');
  var collection = new Collection([{id: 1, name: 'Susan', sex: 'F'}, {id: 2, name: 'Fred', sex: 'M'}, {id: 3, name: 'Brenda', sex: 'F'}, {id: 4, name: 'Eric', sex: 'M'}, {id: 5, name: 'Luke', sex: 'M'}]);
</script>
<pre class="runable full-collection"><code>collection.each(function(index, model) {
  console.log(model.get('name'));
});
</code></pre>

However, you can also use the `itemAt()` and `count()` methods to construct a `for` loop.

<pre class="runable full-collection"><code>for (var i = 0, j = collection.count(); i < j; i++) {
  console.log(collection.itemAt(i).get('name'));
}
</code></pre>

### Finding Models in the Collection
You can find models in the collection via index using the collection's `itemAt()` method.

<pre class="runable full-collection"><code>console.log(collection.itemAt(1).get('name'));
</code></pre>

You can use the collection's `filter()` method to find models matching a set of attributes.

<pre class="runable full-collection"><code>var models = collection.filter({sex: 'M'}),
    names = [],
    i = -1,
    person;
while (person = models[++i]) {
  names.push(person.get('name'));
}
console.log(names);
</code></pre>

The `filter()` method can also be used to find models that pass a functional test.

<pre class="runable full-collection"><code>var models = collection.filter(function(index, model) { return model.get('sex') == 'F'; }),
    names = [],
    i = -1,
    person;
while (person = models[++i]) {
  names.push(person.get('name'));
}
console.log(names);
</code></pre>

Lastly, you can use the `first()` method to filter down to a single item.

<pre class="runable full-collection"><code>console.log(collection.first({id: 4}).get('name'));
// "Eric"
console.log(collection.first(function(index, model) { return model.get('sex') == 'M'; }).get('name'));
// "Fred"
</code></pre>

### Removing Models from a Collection
To remove a single model, use the `remove()` method. The following removes the first model from the collection:

<pre class="runable full-collection"><code>console.log(collection.remove(collection.itemAt(0)));</code></pre>

You can also remove a model from the collection using an attribute or function filter. Either of the following removes all models with an attribute named `id` that's equal to `5` from the collection.

<pre class="runable full-collection"><code>console.log(collection.remove({id: 5}));</code></pre>
<pre class="runable full-collection"><code>console.log(
collection.remove(function(index, model) { 
  return model.get('id') == 5; 
}));</code></pre>

You can remove all models from a collection using its `clear()` method.

<pre class="runable full-collection"><code>collection.clear();
console.log(collection.toObject());</code></pre>

### Changing the Collection's Order
You can change the order of the items in the collection using the `moveTo()` or `sort()` methods.

The following code moves the fourth item in the collection into the first position:

<pre class="runable full-collection"><code>var oldIndex = 3,
    newIndex = 0;
console.log(collection.toObject().items);
collection.moveTo(oldIndex, newIndex);
console.log(collection.toObject().items);
</code></pre>

The following code moves the model with an ID equal to `5` to the first position:

<pre class="runable full-collection"><code>console.log(collection.toObject().items);
collection.moveTo(collection.first({id: 5}), 0);
console.log(collection.toObject().items);
</code></pre>
    
The following code sorts a collection based on various attributes

<pre class="runable full-collection"><code>// Sorts a collection based on the models' `name` attribute, in ascending order
collection.sort('name');
console.log(collection.toObject().items);

// Sorts a collection based on the models' `name` attribute, in descending order
collection.sort('name', true);
console.log(collection.toObject().items);
    
// Sorts a collection based on a compareFunction. This example sorts names from shortest to longest
collection.sort(function(modelA, modelB) {
  return modelA.get('name').length > modelB.get('name').length;
});
console.log(collection.toObject().items);
</code></pre>

## Item Events
Like other model types, collections dispatch events to help your application detect data changes.

An item event contains the following data points:

* `target` - The collection that contains (or contained) the model that caused the event
* `model` - The model that caused the event
* `index` - The index of the model in the collection after the event (or `null` if the model is no longer in the collection)
* `previousIndex` - The index of the model in the collection before the event (or `null` if the model was just added to the collection)

Item events may additionally contain these attribute event properties:

* `attribute` - The name of the attribute that changed
* `previous` - The value of the attribute before the event
* `value` - The value of the attribute after the event
* `messages` - A list of validation messages that the change caused

Collections can dispatch the following item events:

* `addItem` - When an item is added to the collection
* `removeItem` - When an item is removed from the collection
* `changeItem` - When one of an item's attributes changes
* `invalidItem` - When an item is validated and found to be invalid
* `moveItem` - When an item changes position in the collection
* `saveSuccessItem` - When an item is successfully saved to the server
* `saveErrorItem` - When an item fails to save to the server
* `fetchSuccessItem` - When an item's data is successfully loaded from the server
* `fetchErrorItem` -  When an item's data fails to load from the server

To listen for an item event from a collection, use its `on()` method.

    model
      .on('addItem', function(e) {
        alert('Added an item at ' + e.index);
      })
      .on('changeItem', function(e) {
        alert('The item at ' + e.index + ' has an attribute ' + e.attribute
            + ' that changed from ' + e.previous + ' to ' + e.value);
      })
      .on('removeItem', function(e) {
        alert('Removed an item from ' + e.index);
      })
      .on('invalidItem', function(e) {
        alert('The item at ' + e.index + ' was found to be invalid with these errors: ' + e.messages.join(', '));
      })
      .on('moveItem', function(e) {
        alert('An item moved from ' + e.previousIndex + ' to ' + e.index);
      });

Similarly to the model's `change` and `invalid` events, you can listen for a specific attribute on the `changeItem` and `invalidItem` events.

    model
      .on('changeItem', 'name', function(e) {
        alert('Name attribute was changed to ' + e.value + ' on item at ' + e.index);
      })
      .on('invalidItem', 'age', function(e) {
        alert('Invalid attempt to set age attribute to ' + e.value + ' on item at ' + e.index);
      });

# Converting Models and Collections to Objects
In many cases, it may be necessary to convert models and collections back into plain objects. To do this, you can call the model's `toObject()` method:

<pre class="runable collection"><code>var model = new Model({id: 1, name: 'Susan', sex: 'F'});
console.log(model.toObject());
</code></pre>

<pre class="runable collection"><code>var collection = new Collection([{id: 1, name: 'Susan', sex: 'F'}, {id: 2, name: 'Fred', sex: 'M'}]);
console.log(collection.toObject());
</code></pre>

You'll notice that collections don't convert directly into arrays. This is because collections may contain attribute data, the same way that other models do. You can control the name of the property that collections use for their models array with the collection's `itemsProperty` field.

<pre class="runable collection"><code>var collection = new Collection([{id: 1, name: 'Susan', sex: 'F'}, {id: 2, name: 'Fred', sex: 'M'}]);
collection.itemsProperty = 'entries';
collection.set('attribute1', 'testValue');
console.log(collection.toObject());
</code></pre>