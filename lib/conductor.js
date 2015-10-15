/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */

/**
 * method for creating an express application with express-compose mixin
 * @example
 * ```javascript
 * var expressComposer = require('express-composer');
 * ```
 * @module express-composer
 */

(function (module, exports, express) {
    "use strict";
    var express = require('express'),
        mixin = require('utils-merge'),
        appProto = require('./application'),
        routerProto = require('./router'),
        routeProto = require('./route');

    exports = module.exports = expressComposer;

    mixin(exports, express);
    mixin(express.Router, routerProto);
    mixin(express.Route.prototype, routeProto);

    /**
     * Creates an extended express app
     * @example
     * ```javascript
     * var express = require('expressComposer'),
     *     app = express();
     * ```
     * @alias module:express-composer
     * @returns {app}
     */
    function expressComposer () {
        return exports.extend(express());
    }

    function responseEnd (req, res, next){
        var end = res.end,
            ended = false;
        res.end = function(){
            ended = true;
            end.apply(res, arguments);
        };
        if('composerResponding' in res){
           return next();
        }
        Object.defineProperty(res, 'composerResponding', {
            get: function () {
                return ended;
            }
        });
        next();
    }

    /**
     * Extends an express app if it was not created with express-compose
     * @example
     * ```javascript
     * var express = require('express'),
     *     expressComposer = require('express-composer'),
     *     app = express();
     * expressComposer.extend(app);
     * ```
     * @param {function} app - express app
     * @returns {app}
     */
    exports.extend = function extend (app) {
        mixin(app, appProto);
        //set up end so composer knows exactly when a request is done
        app.use(responseEnd);
        return app;
    }

}(module, module.exports));

