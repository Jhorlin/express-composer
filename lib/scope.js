/**
 * Created by jhorlin.dearmas on 12/28/2014.
 */
(function (module, require) {
    "use strict";
    var extend = require('extend'),
        inherit = require('inherit-multiple'),
        Promise = require('bluebird');
    module.exports = Scope;

    function Scope (arg) {
        if (!(this instanceof Scope)) {
            return new Scope(arg);
        }
        var self = this,
            results = {},
            errors = {},
            request = {},
            ready = new Promise(function (resolve) {
                resolve(typeof arg === 'function' ? arg() : arg);
            })
                .then(function (arg) {
                    extend(self, arg);
                    return self;
                });

        this.addResult = function (name, result) {
            results[name] = result;
        };

        this.addError = function (name, error) {
            errors[name] = error;
        };

        this.destroy = function () {
            self = ready = results = errors = request = null;
        };

        this.setRequest = function(validatedRequest){
            extend(request, validatedRequest);
        };

        Object.defineProperty(this, 'ready', {
            get: function () {
                return ready;
            }
        });

        Object.defineProperty(this, 'results', {
            value: results
        });

        Object.defineProperty(this, 'errors', {
            value: errors
        });

        Object.defineProperty(this, 'request', {
            //value: request
            get:function(){
                return request;
            }
        });
    }

    Scope.prototype.new = function (arg) {
        if (!this.hasOwnProperty('_new')) {
            this._new = function (arg, parent) {
                var self = this,
                    results = Object.create(parent.results),
                    errors = Object.create(parent.errors),
                    request = Object.create(parent.request),
                    ready = parent.ready.then(function () {
                        return new Promise(function (resolve) {
                            resolve(typeof arg === 'function' ? arg() : arg);
                        })
                            .then(function (arg) {
                                extend(self, arg);
                                return self;
                            });
                    })

                this.addResult = function (name, result) {
                    results[name] = result;
                };

                this.addError = function (name, error) {
                    errors[name] = error;
                };

                this.destroy = function () {
                    self = ready = results = errors = request = null;
                };

                this.setRequest = function(validatedRequest){
                    extend(request, validatedRequest);
                };

                Object.defineProperty(this, 'ready', {
                    value: ready
                });

                Object.defineProperty(this, 'results', {
                    value: results
                });

                Object.defineProperty(this, 'errors', {
                    value: errors
                });

                Object.defineProperty(this, 'request', {
                   // value: request
                    get:function(){
                        return request;
                    }
                });

                Object.defineProperty(this, 'parent', {
                    value: parent
                });
            }
            this._new.prototype = this;
        }
        return new this._new(arg, this);
    };

}(module, require));
