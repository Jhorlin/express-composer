
/**
 * Created by jhorlin.dearmas on 11/26/2014.
 */
(function(express, q, extend, promisesHandler, composer){
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
        routerScope.__parent = scope;

        var router = new express.Router(routerOptions.options);
        if(router.preHandlers && router.preHandlers.length){
            router.use(promisesHandler.handler(router.preHandlers));
        }

        if(routerOptions.routes && routerOptions.rotues.length){

        }

        if(router.errorHandlers && router.preHandlers.length){
            router.use(promisesHandler.error(router.errorHandlers));
        }

        if(routerOptions.routers && routerOptions.router.length){
            routerOptions.routers.forEach(function(routerRouter){
                routerRouter.use(composer(routerRouter));
            });
        }

        return router;

    }
}(require('express'), require('q'), require('extend'), require('./promisesHandler'), require('./composer')));