define(function(require) {

  // constants
  var ENTER_KEY = 13;

  var View = require('lavaca/mvc/View');
  var $ = require('$');
  require('rdust!templates/todo-item');

  /**
   * Todos view type
   * @class app.ui.views.TodosView
   * @super Lavaca.mvc.View
   */
  var TodosView = View.extend(function TodosView() {
    // Call the super class' constructor
    View.apply(this, arguments);
    this.mapEvent({
      'input.toggle': {
        change: toggleComplete.bind(this)
      },
      'self': {
        dblclick: startEditing.bind(this)
      },
      'input.edit': {
        keypress: editTodo.bind(this)
      },
      'button.destroy': {
        click: remove.bind(this)
      },
      model: {
        'change': this.onModelChange.bind(this)
      }
    });
    this.render();
  },{
    /**
     * The name for the template used in the view
     * @property template
     * @type String
     */
    template: 'templates/todo-item',
    /**
     * A class name added to the view container
     * @property className
     * @type String
     */
    className: 'todo-item',
    /**
     * Executes when the template renders successfully
     * @method onRenderSuccess
     */
    onRenderSuccess: function() {
      View.prototype.onRenderSuccess.apply(this, arguments);
      this.checkIfCompleted();
    },
    /**
     * Redraws template with model
     * @method redraw
     */
    redraw: function() {
      View.prototype.redraw.apply(this, arguments)
        .then(this.checkIfCompleted.bind(this));
    },
    /**
     * Adds/Removes a completed class to view element,
     * this wouldnt be needed if we restructured some DOM or CSS
     * @method checkIfCompleted
     */
    checkIfCompleted: function() {
      if (this.model.get('completed')) {
        this.el.addClass('completed');
      } else {
        this.el.removeClass('completed');
      }
    },
    /**
     * Redraws template when model changes
     * @method onModelChange
     */
    onModelChange: function() {
      if (this.model) {
        this.redraw();
      }
    }

  });

  // Set the completion state of a single model
  function toggleComplete(e) {
    this.model.set('completed', e.currentTarget.checked);
  }

  // Start editing a Todo
  function startEditing(e) {
    var $el = $(e.currentTarget);
    $el.addClass('editing');
    $el.find('input.edit').focus();
  }

  // Commit the edit when the ENTER key
  // is pressed
  function editTodo(e) {
    var val,
        input = e.currentTarget;
    if (e.which === ENTER_KEY) {
      val = input.value.trim();
      $(input).parents('li').removeClass('editing');
      if (val) {
        this.model.set('title', val);
      }
      e.preventDefault();
    }
  }

  // Remove the Todo when the 'x' is clicked
  function remove() {
    this.trigger('removeView', {model: this.model});
  }

  return TodosView;

});
