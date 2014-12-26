/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function (module, exports, express, mixin, appProto, routerProto, routeProto) {
    "use strict";
    exports = module.exports = createApplication;

    mixin(exports.Router.prototype, routerProto)

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

}(module, module.exports, require('express'), require('utils-merge'), require('./application'), require('./router')));