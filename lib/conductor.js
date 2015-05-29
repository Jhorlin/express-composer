/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function (module, exports, express, mixin, appProto, routerProto, routeProto, Scope) {
    "use strict";
    exports = module.exports = createApplication;

    mixin(exports, express);
    mixin(express.Router, routerProto);
    mixin(express.Route.prototype, routeProto);

    /**
     * Creates an express app with extended with conductor
     * @returns {app}
     */
    function createApplication() {
        return extend(express());
    }

    /**
     * Extend an app with conductor
     * @param {function} app - express app
     * @returns {app}
     */
    function extend(app) {
        mixin(app, appProto);
        return app;
    }


    exports.conduct = function (app) {
        return extend(app);
    };

    exports.Scope = Scope;

}(module, module.exports, require('express'), require('utils-merge'), require('./application'), require('./router'), require('./route'), require('./scope')));
