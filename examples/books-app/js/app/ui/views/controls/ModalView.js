define(function(require) {

  var View = require('lavaca/mvc/View'),
      bootstrap = require('bootstrap'),
      stateModel = require('app/models/StateModel');

  /**
   * @class app.ui.views.controls.ModalView
   * @super Lavaca.mvc.View
   * Modal view type
   */
  var ModalView = View.extend(function () {
      View.apply(this, arguments);
      stateModel.on('modal:show', this.renderModal.bind(this));

      this.el.on('hidden', this.closeModal.bind(this));
    }, {
    /**
     * @field {String} template
     * @default 'templates/book-detail'
     * The name of the template used by the view
     */
    template: null,
    /**
     * @field {String} className
     * @default 'book-detail'
     * A class name added to the view container
     */
    className: null,

    modalView: null,

    renderModal: function (e) {
      var view = e.view;
      this.modalView = view;
      this.el.append(this.modalView.el);
      this.el.modal('show');
    },

    closeModal: function (e) {
      this.el.modal('hide');
      this.modalView.el.remove();
      this.modalView.dispose();
      this.modalView = null;
    },

    dispose: function () {
      stateModel.off('modal:show', this.renderModal.bind(this));
      this.el.off('hidden', this.closeModal.bind(this));
      return View.prototype.dispose.apply(this, arguments);
    }

  });

  return ModalView;
});