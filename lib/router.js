/**
 * Created by jhorlin.dearmas on 12/26/2014.
 */
(function (module, exports, handler, Scope, schemas) {
    "use strict";
    var router = exports = module.exports = {};

    /**
     * Create a router based on the score 'configuration' object
     * @example
     * var app = require('express-composer')(),
     *     router = new app.Router();
     *     score = {
     *       routes:[{
     *              path:'/resource',
     *              methods:{
     *                  get:{
     *                      handlers:[function(req, res){
     *                          res.send('Hello World');
     *                      }]
     *                  }
     *              }
     *          }]
     *     }
     * router.conduct(score);
     * app.use('/app', router);
     *
     * @param {object} scoreArg - configuration object
     * @param {scope} [parentScope] - optional parent scope
     * @returns {router}
     */
    router.conduct = function (scoreArg, parentScope) {
        if (!scoreArg) {
            throw new Error("scoreArg is required");
        }
        var self = this;
        schemas.score.router.validate(scoreArg, function (err, score) {
            if (err) {
                throw err;
            }
            var scope = parentScope ? parentScope.new(score.scope) : new Scope(score.scope),
                expressComposer = require('../index');
            //cleanup on response
            self.use(handler.destroy(scope));

            //execute all preHandelers first
            if (score.preHandlers) {
                self.use(handler.handle(score.preHandlers, scope));
            }
            //execute any route
            if(score.routes){
                (score.routes instanceof Array ? score.routes : [score.routes])
                    .forEach(function (scoreRoute) {
                        var route = self.route(scoreRoute.path);
                        route.conduct(scoreRoute, scope);
                    });
            }

            //set up next set of routes
            if (score.routers) {
                (score.routers instanceof Array ? score.routers : [score.routers]).forEach(function (routerScore) {
                    var childRouter = new expressComposer.Router(routerScore.options);
                    childRouter.conduct(routerScore, scope);
                    self.use(routerScore.path, childRouter);
                });
            }


            if (score.errorHandlers) {
                self.use(handler.error(score.errorHandlers, scope));
            }
        });
        return self;
    };
}(module, module.exports, require('./handler'), require('./scope'), require('./schemas')));
