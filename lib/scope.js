/**
 * Created by jhorlin.dearmas on 12/28/2014.
 */
(function (module, q, extend) {
    "use strict";
    module.exports = Scope;

    function notifySet(handers, ready) {
        handers.forEach(function (fn) {
            fn(ready);
        });
    }

    function Scope(arg, unset) {
        var self = this,
            setHandlers = [],
            argPromise;
        this.onSet = function (fn) {
            setHandlers.push(fn);
        };
        this.set = function (arg) {
            var newPromise = q.when(typeof arg === 'function' ? arg() : arg);
            argPromise = this.__unset && argPromise ? argPromise.keys(function(keys){
                keys.forEach(function(key){
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
    }

    Scope.prototype.child = function (arg) {
        if (!this.__childClass) {
            this.__childClass = function (arg, parent) {
                var self = this,
                    argPromise,
                    setHanders = [];
                this.onSet(function (fn) {
                    setHanders.push(fn);
                });
                this.set = function (arg) {
                    var newPromise = q.when(typeof arg === 'function' ? arg() : arg);
                    argPromise = this.__unset && argPromise ? argPromise.keys(function(keys){
                        keys.forEach(function(key){
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
                    self.ready = parentReady.then(function(){
                        return self;
                    });
                    notifySet(setHanders, self.ready);
                });
            };
            this.__childClass.prototype = this;
        }
        return new this.__childClass(arg, this);
    };

}(module, require('q'), require('extend')));