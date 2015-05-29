/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function (module, exports, Scope, handler, schemas) {
    "use strict";


    var app = exports = module.exports = {};

    /**
     * Composes the express application and returns the app
     * @example
     * var app = require('express-composer')(),
     *     score = {
     *          routers:[{
     *           path:'/app',
     *           routes:[{
     *              path:'/resource',
     *              methods:{
     *                  get:{
     *                        handlers:[function(req, res){
     *                              res.send('Hello World');
     *                          }]
     *                  }
     *              }
     *           }]
     *          }]
     *     }
     * app.conduct(score);
     *
     * @param {object} scoreArg - the config object used to conduct the app
     * @param {Scope} [parentScope] - optional parent scope
     * @returns {app}
     */
    app.conduct = function (scoreArg, parentScope) {
        var self = this,
            conductor = require('./conductor');
        schemas.score.app.validate(scoreArg, function (err, score) {
            if (err) {
                throw err;
            }
            //TODO: set up optional parent scope
            var scope = parentScope ? parentScope.child(score.scope) : new Scope(score.scope);

            if (score.preHandlers) {
                self.use(score.path, handler.handle(score.preHandlers, scope));
            }

            (score.routers instanceof Array ? scope.routers : [score.routers]).forEach(function (routerScore) {
                var router = new conductor.Router(routerScore.options, scope);
                router.conduct(routerScore, scope);
                self.use(routerScore.path, router);
            });

            if (score.errorHandlers) {
                if (score.errorHandlers) {
                    self.use(handler.error(score.errorHandlers, scope));
                }
            }
        });
        return self;
    };
}(module, module.exports, require('./scope'), require('./handler'), require('./schemas')));