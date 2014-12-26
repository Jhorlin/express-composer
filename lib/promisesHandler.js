/**
 * Created by jhorlin.dearmas on 12/9/2014.
 */
(function(module, q){
    "use strict";
    module.exports = {
        handler : function(promises, scope, resolve){
            return function(req, res, next){
                promises.reduce(function(promise, handler){
                    return promise.then(function(result){
                        if(res.headersSent){
                            return;
                        }
                        scope[handler] = result;
                        return q.when(resolve(handler).call(scope, req, res, scope));
                    });
                }, q.when()).then(function(){
                    next();
                }, next);
            };
        },
        error: function(promises, scope, resolve){
            return function(err, req, res, next){
                promises.reduce(function(promise, handler){
                    return promise.then(function(result){
                        if(res.headersSent){
                            return;
                        }
                        scope[handler] = result;
                        return q.when(resolve(handler).call(scope, err, req, res, scope));
                    });
                }, q.when()).then(function(){
                    next();
                }, next);
            };
        }
    };
}(module, require('q')));