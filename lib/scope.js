/**
 * Created by jhorlin.dearmas on 12/28/2014.
 */
(function (module, require) {
    "use strict";
    var extend = require('extend'),
        inherit = require('inherit-multiple'),
        Emmiter = require('events').EventEmitter,
        Promise = require('bluebird');
    module.exports = Scope;

    inherit(Scope, Emmiter);

    function Scope (arg) {
        if (!(this instanceof Scope)) {
            return new Scope(arg);
        }
        var self = this,
            results = {},
            errors = {},
            ready,
            unset = function () {
            };

        this.set = function (arg) {
            unset();
            ready = new Promise(function (resolve) {
                resolve(typeof arg === 'function' ? arg() : arg);
            })
                .then(function (arg) {
                    unset = function () {
                        Object.keys(arg).forEach(function (key) {
                            delete self[key];
                        });
                    }
                    extend(self, arg);
                    return self;
                });
            self.emit('set', ready);
            return ready;
        };


        this.set(arg);


        this.addResult = function (name, result) {
            results[name] = result;
        };

        this.addError = function (name, error) {
            errors[name] = error;
        };

        this.destroy = function () {
            unset();
            self = unset = ready = results = errors = null;
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
    }

    Scope.prototype.new = function (arg) {
        if (!this.hasOwnProperty('_new')) {
            this._new = function (arg, parent) {
                var self = this,
                    results = Object.create(parent.results),
                    errors = Object.create(parent.errors),
                    ready,
                    unset = function () {
                    };

                this.set = function (arg) {
                    unset();
                    ready = parent.ready.then(function () {
                        return new Promise(function (resolve) {
                            resolve(typeof arg === 'function' ? arg() : arg);
                        })
                            .then(function (arg) {
                                unset = function () {
                                    Object.keys(arg).forEach(function (key) {
                                        delete self[key];
                                    });
                                }
                                extend(self, arg);
                                return self;
                            });
                    })
                    self.emit('set', ready);
                    return ready;
                };

                parent.on('set', function (promise) {
                    ready = promise.then(function () {
                        return self;
                    });
                })

                this.set(arg);


                this.addResult = function (name, result) {
                    results[name] = result;
                };

                this.addError = function (name, error) {
                    errors[name] = error;
                };

                this.destroy = function () {
                    unset();
                    self = unset = ready = results = errors = null;
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

                Object.defineProperty(this, 'parent', {
                    value: parent
                });
            }
            this._new.prototype = this;
        }
        return new this._new(arg, this);
    };

}(module, require));
