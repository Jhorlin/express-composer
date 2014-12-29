/**
 * Created by jhorlin.dearmas on 12/28/2014.
 */
(function (module, q, extend) {
    "use strict";

    function Scope(arg) {
        var self = this,
            ready = q.when(typeof arg === 'function' ? arg() : arg).then(function (result) {
                extend(self, result);
                return self;
            });
        self.ready = ready.then;
    }

    Scope.prototype.child = function (arg) {
        if(!this.__childClass){
            this.__childClass = function(arg, parent){
                var self = this,
                    ready = parent.ready.then(function(){
                       return q.when(typeof arg === 'function' ? arg() : arg).then(function (result) {
                            extend(self, result);
                            return self;
                        });
                    });
                self.ready = ready.then;
                self.parent = parent;
            };
            this.__childClass.prototype = this;
        }
        return new this.__childClass(arg, this);
    };

}(module, require('q'), require('extend')));