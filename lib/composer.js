/**
 * Created by jhorlin.dearmas on 11/26/2014.
 */
(function(express, utils, routerComposer){
    "use strict";
    function composer(score, parentRouter, routerComposer){
        var root = new express.Router();
        score.routers.forEach(function(router){
            root.use(router.path, routerComposer(router));
        });

        return root;

        this.name = score.name;
        this.description = score.description;
        var router = new express.Router(score.options);
        parentRouter.use(score.path, router);
        if(score.preHandlers){
            router.use(function(req, res, next){

            });
        }
        if(score.routes){
            score.routes.forEach(function(route){
                router.use(routeComposer(route));
            });
        }
        if(score.errorHandlers){
            router.use(function(err, req, res, next){

            });
        }
    }
}(require('express'), require('./routeComposer')));