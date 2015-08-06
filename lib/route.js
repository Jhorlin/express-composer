/**
 * Created by jhorlin.dearmas on 12/26/2014.
 */
(function (module, exports, handler, Scope, schemas) {
    "use strict";
    var route = exports = module.exports = {};

    /**
     * Composes a route based on the score 'configuration' object
     *
     * @example
     * var app = require('express-composer')(),
     *     router = new app.Router(),
     *     route = router.route('/resource')
     *     score = {
     *       methods:{
     *          get:{
     *                handlers: [function(req, res){
     *                      res.send('Hello World');
     *                  }]
     *              }
     *      }
     * router.conduct(score);
     * app.use('/app', router);
     *
     * @param {object} scoreArg - configuration object
     * @param {Scope} [parentScope] - optional parent scope
     * @returns {route}
     */
    route.conduct = function (scoreArg, parentScope) {
        var self = this;
        schemas.score.route.validate(scoreArg, function (err, score) {
            if (err) {
                throw(err);
            }

            var scope = parentScope ? parentScope.new(score.scope) : new Scope(score.scope);

            self.all(handler.destroy(scope));

            if (score.preHandlers) {
                self.all(handler.handle(score.preHandlers, scope));
            }

            if (score.methods) {
                Object.keys(score.methods).forEach(function (method) {
                    var methodScore = score.methods[method],
                        methodHandlers = [],
                        methodScope = scope.new(methodScore.scope);

                    self.all(handler.destroy(methodScope));

                    if (typeof methodScore === 'function') {
                        methodScope = [methodScore];
                    }
                    if (methodScore instanceof Array) {
                        methodScore = {
                            handlers: methodScore
                        };
                    }
                    if (methodScore.preHandlers) {
                        methodHandlers.push(handler.handle(methodScore.preHandlers, methodScope));
                    }
                    if (methodScore.validator) {
                        methodHandlers.push(handler.validate(methodScore.validator, methodScope));
                    }
                    if (methodScore.handlers) {
                        methodHandlers.push(handler.handle(methodScore.handlers, methodScope));
                    }
                    if (methodScore.errorHandlers) {
                        methodHandlers.push(handler.error(methodScore.errorHandlers, methodScope));
                    }
                    self[method].apply(self, methodHandlers);
                });
            }

            if (score.errorHandlers) {
                self.all(handler.error(score.errorHandlers, parentScope));
            }
        });
        return self;
    };

}(module, module.exports, require('./handler'), require('./scope'), require('./schemas')));
