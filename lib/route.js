/**
 * Created by jhorlin.dearmas on 12/26/2014.
 */
(function (module, exports) {
    "use strict";
    //dependencies
    var handler = require('./handler'),
        ScopeProvider = require('./scopeProvider'),
        schema = require('./schema');

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
     * @param {ScopeProvider} [parentScopeProvider] - optional parent scope
     * @returns {route}
     */
    route.conduct = function (scoreArg, parentScopeProvider) {
        var self = this;
        schema.score.route.validate(scoreArg, function (err, score) {
            if (err) {
                throw(err);
            }

            var scopeProvider =  new ScopeProvider(score.scope, parentScopeProvider);

            self.all(handler.dispose(scopeProvider));

            if (score.preHandlers) {
                self.all(handler.handle(score.preHandlers, scopeProvider));
            }

            if (score.methods) {
                Object.keys(score.methods).forEach(function (method) {
                    var methodScore = score.methods[method],
                        methodHandlers = [],
                        methodScopeProvider = new ScopeProvider(methodScore.scope, scopeProvider);

                    methodHandlers.push(handler.dispose(methodScopeProvider));

                    if (methodScore instanceof Array || typeof methodScore === 'function') {
                        methodScore = {
                            handlers: methodScore
                        };
                    }
                    if (methodScore.preHandlers) {
                        methodHandlers.push(handler.handle(methodScore.preHandlers, methodScopeProvider));
                    }
                    if (methodScore.validator) {
                        methodHandlers.push(handler.validate(methodScore.validator, methodScopeProvider));
                    }
                    if (methodScore.handlers) {
                        methodHandlers.push(handler.handle(methodScore.handlers, methodScopeProvider));
                    }
                    if (methodScore.errorHandlers) {
                        methodHandlers.push(handler.error(methodScore.errorHandlers, methodScopeProvider));
                    }
                    self[method].apply(self, methodHandlers);
                });
            }

            if (score.errorHandlers) {
                self.all(handler.error(score.errorHandlers, scopeProvider));
            }
        });
        return self;
    };

}(module, module.exports));
