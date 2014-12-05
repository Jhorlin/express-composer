
/**
 * Created by jhorlin.dearmas on 11/26/2014.
 */
(function(express, q, extend){
    "use strict";
    function routerComposer(routerOptions, scope, resolve){
        if(!resolve){
            resolve = require;
        }
        if(!scope){
            scope = {};
        }
        var routerScope = Object.create(scope);
        extend(routerScope, routerOptions.scope);
        var router = new express.Router(routerOptions.options);
        if(router.preHandlers && router.preHandlers.length){
            router.use(function(req, res, next){
               router.preHandlers.reduce(function(promise, handler){
                   return promise.then(function(){
                      return q.when(resolve(handler)(req, res, scope));
                   });
               }, q.when()).then(next, next);
            });
        }

        if(router.errorHandlers && router.preHandlers.length){
            router.use(function(err, req, res, next){
                router.preHandlers.reduce(function(promise, handler){
                    return promise.then(function(){
                        return q.when(resolve(handler)(err, req, res, scope));
                    });
                }, q.when()).then(next, next);
            });
        }

    }
}(require('express'), require('q'), require('extend')));