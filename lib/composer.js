/**
 * Created by jhorlin.dearmas on 11/26/2014.
 */
(function (express, utils, routerComposer) {
    "use strict";
    function composer(score, parentRouter, routerComposer) {

        var root = new express.Router();
        score.routers.forEach(function (router) {
            root.use(router.path, routerComposer(router));
        });
        return root;
    }
    return composer;
}(require('express'), require('./routeComposer')));