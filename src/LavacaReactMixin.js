define(function(require) {
    var React = require('react'),
        Model = require('lavaca/mvc/Model');
    require('lodash');
    'use strict';

    var events = {
        changeOptions: 'addItem moveItem removeItem change reset',
        updateScheduler: function(func) { return _.debounce(func, 0); }
    };

    var subscribe = function(component, model) {
        if (!model) {
            return;
        }

        var triggerUpdate = events.updateScheduler(function() {
            if (component.isMounted()) {
                (component.onModelChange || component.forceUpdate).call(component);
            }
        });
        var changeOptions = component.changeOptions || events.changeOptions;
        model.on(changeOptions, triggerUpdate, component);
    };

    var unsubscribe = function(component, model) {
        if (!model) {
            return;
        }

        model.off(null, null, component);
    };

    React.LavacaViewMixin = {
        componentDidMount: function() {
            // Whenever there may be a change in the data, trigger a reconcile.
            subscribe(this, this.model());
        },

        componentWillReceiveProps: function(nextProps) {
            if (this.model() === nextProps) {
                return;
            }

            unsubscribe(this, this.model());
            subscribe(this, nextProps);

            if (typeof this.componentWillChangeModel === 'function') {
                this.componentWillChangeModel();
            }
        },

        componentDidUpdate: function(prevProps, prevState) {
            if (this.props === prevProps) {
                return;
            }

            if (typeof this.componentDidChangeModel === 'function') {
                this.componentDidChangeModel();
            }
        },

        componentWillUnmount: function() {
            // Ensure that we clean up any dangling references when the component is destroyed.
            unsubscribe(this, this.model());
        },
        getModel: function() {
            return this.props.model;
        },
        model:function(){
            return this.getModel();
        },
        el: function() {
            return this.isMounted() && this.getDOMNode();
        }
    };
    React.createLavacaClass = function(spec) {
        var currentMixins = spec.mixins || [];

        spec.mixins = currentMixins.concat([
            React.LavacaViewMixin
        ]);

        return React.createClass(spec);
    };

    return React;
});