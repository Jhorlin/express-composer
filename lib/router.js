/**
 * Created by jhorlin.dearmas on 12/26/2014.
 */

/**
 * Extension module for an express router
 * ```javascript
 * var expressComposer = require('express-composer');
 * var app = expressComposer();
 * var router = new expressComposer.Router();
 * ```
 * @module router
 */
(function (module, exports) {
    'use strict';

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
     * @param {routerScore} scoreArg - configuration object
     * @param {ScopeProvider} [parentScopeProvider] - optional parent scope
     * @alias module:router
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

            //initialize our scope
            self.use(scopeProvider.init);

            //execute all preHandlers first
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
                    var validatedPath = schema.score.routerPath.validate(routerScore.path),
                        validatedOptions = schema.score.routerOptions.validate(routerScore.options || {});
                    if (validatedPath.error) {
                        throw validatedPath.error;
                    }
                    if (validatedOptions.error) {
                        throw validatedOptions.error;
                    }
                    var childRouter = new expressComposer.Router(validatedOptions.value);
                    childRouter.conduct(routerScore, scopeProvider);
                    self.use(validatedPath.value, childRouter);
                });
            }


            if (score.errorHandlers) {
                self.use(handler.error(score.errorHandlers, scopeProvider));
            }
        });
        return self;
    };
}(module, module.exports));
