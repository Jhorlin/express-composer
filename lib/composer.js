/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function (module, exports, express, mixin, mixinDescriptors, appProto, routerProto, routeProto, Scope) {
    "use strict";
    exports = module.exports = createApplication;

    mixin(exports, express);
    mixin(express.Router, routerProto);
    mixin(express.Route.prototype, routeProto);

    function createApplication() {
       return extend(express());
    }

    function extend(app){
        mixin(app, appProto);
        return app;
    }

    exports.composer = function (app) {
       return extend(app);
    };

    exports.Scope = Scope;

}(module, module.exports, require('express'), require('utils-merge'), require('merge-descriptors'), require('./application'), require('./router'), require('./route'), require('./scope')));