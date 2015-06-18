/**
 * Created by jhorlin.dearmas on 12/28/2014.
 */
(function (module, require) {
    "use strict";
    var extend = require('extend'),
        Promise = require('bluebird');
    module.exports = Scope;

    /**
     * Private helper function used to notify children when a parent's scope has changed
     * @access private
     * @param {Function[]} handers - an array of all the children scope to be notified
     * @param {function} ready - the function for the children to bind to that will be executed when the parent's scope
     *                           has been updated
     */
    function notifySet(handers, ready) {
        handers.forEach(function (fn) {
            fn(ready);
        });
    }

    function Scope(arg, unset) {
        if (!(this instanceof Scope)) {
            return new Scope(arg, unset);
        }
        var self = this,
            setHandlers = [],
            results = {},
            errors = {},
            argPromise;
        this.onSet = function (fn) {
            setHandlers.push(fn);
        };
        this.set = function (arg) {
            var newPromise = new Promise(function (resolve) {
                resolve(typeof arg === 'function' ? arg() : arg);
            });
            argPromise = this.__unset && argPromise ? argPromise.then(function (arg) {
                Object.keys(arg).forEach(function (key) {
                    delete self[key];
                });
                return newPromise;
            }) : newPromise;
            var ready = argPromise.then(function (result) {
                extend(self, result);
                return self;
            });
            self.ready = ready.then.bind(ready);
            notifySet(setHandlers, self.ready);
            return self.ready;
        };
        this.set(arg);
        this.__unset = unset;
        this.__addResult = function (name, result) {
            results[name] = result;
        };

        this.__addError = function (name, error) {
            errors[name] = error;
        };

        Object.defineProperty(this, 'results', {
            value: results
        });

        Object.defineProperty(this, 'errors', {
            value: errors
        });
    }

    Scope.prototype.child = function (arg) {
        if (!this.hasOwnProperty('__childClass')) {
            this.__childClass = function (arg, parent) {
                var self = this,
                    argPromise,
                    setHanders = [];
                this.onSet(function (fn) {
                    setHanders.push(fn);
                });
                this.set = function (arg) {
                    var newPromise = new Promise(function (resolve) {
                        resolve(typeof arg === 'function' ? arg() : arg);
                    });
                    argPromise = this.__unset && argPromise ? argPromise.then(function (arg) {
                        Object.keys(arg).forEach(function (key) {
                            delete self[key];
                        });
                        return newPromise;
                    }) : newPromise;
                    var ready = parent.ready(function () {
                        return argPromise.then(function (result) {
                            extend(self, result);
                            return self;
                        });
                    });
                    self.ready = ready.then.bind(ready);
                    notifySet(setHanders, self.ready);
                    return self.ready;
                };
                this.set(arg);
                this.parent = parent;
                this.parent.onSet(function (parentReady) {
                    self.ready = parentReady.then(function () {
                        return self;
                    });
                    notifySet(setHanders, self.ready);
                });
            };
            this.__childClass.prototype = this;
        }
        return new this.__childClass(arg, this);
    };

}(module, require));