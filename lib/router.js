/**
 * Created by jhorlin.dearmas on 12/26/2014.
 */
(function (module, exports) {
    "use strict";

    var handler = require('./handler'),
        ScopeProvider = require('./scopeProvider'),
        schema = require('./schema');

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
     * @param {ScopeProvider} [parentScopeProvider] - optional parent scope
     * @returns {router}
     */
    router.conduct = function (scoreArg, parentScopeProvider) {
        var self = this;
        schema.score.router.validate(scoreArg, function (err, score) {
            if (err) {
                throw err;
            }
            var scopeProvider = new ScopeProvider(score.scope, parentScopeProvider),
                expressComposer = require('../index');
            //cleanup on response
            self.use(handler.dispose(scopeProvider));

            //execute all preHandelers first
            if (score.preHandlers) {
                self.use(handler.handle(score.preHandlers, scopeProvider));
            }
            //execute any route
            if (score.routes) {
                (score.routes instanceof Array ? score.routes : [score.routes])
                    .forEach(function (scoreRoute) {
                        var route = self.route(scoreRoute.path);
                        route.conduct(scoreRoute, scopeProvider);
                    });
            }

            //set up next set of routes
            if (score.routers) {
                (score.routers instanceof Array ? score.routers : [score.routers]).forEach(function (routerScore) {
                    var childRouter = new expressComposer.Router(routerScore.options);
                    childRouter.conduct(routerScore, scopeProvider);
                    self.use(routerScore.path || '/', childRouter);
                });
            }


            if (score.errorHandlers) {
                self.use(handler.error(score.errorHandlers, scopeProvider));
            }
        });
        return self;
    };
}(module, module.exports));
