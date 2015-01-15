/**
 * Created by jhorlin.dearmas on 12/26/2014.
 */
(function (module, exports, composer, handler, Scope) {
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
        composer.schemas.score.router.validate(scoreArg, function (err, score) {
            if (err) {
                throw err;
            }
            var childScope = parentScope ? parentScope.child(score.scope) : new Scope(score.scope);
            if (score.preHandlers) {
                self.use(handler.handle(score.preHandlers, childScope));
            }

            (score.routes instanceof Array ? score.routes : [score.routes])
                .forEach(function (scoreRoute) {
                var route = self.route(scoreRoute.path);
                route.conduct(scoreRoute, childScope);
            });

            if (score.routers) {
                (score.routers instanceof Array ? score.routers : [score.routers]).forEach(function (score) {
                    var childRouter = new router.prototype.constructor(score.options);
                    childRouter.conduct(score, childScope);
                    self.use(score.path, childRouter);
                });
            }

            if (score.errorHandlers) {
                self.use(handler.error(score.errorHandlers, childScope));
            }
        });
        return self;
    };
}(module, module.exports, require('./composer'), require('./handler'), require('./scope')));