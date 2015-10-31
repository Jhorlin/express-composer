/**
 * Created by jhorlin.dearmas on 12/26/2014.
 */

/**
 * Extension module for an express route
 * ```javascript
 * var expressComposer = require('express-composer');
 * var app = expressComposer();
 * var router = new expressComposer.Router();
 * var route = router.route('/myRoute');
 * ```
 * @module route
 */
(function (module, exports) {
    'use strict';
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
     * @param {routeScore} scoreArg - configuration object
     * @param {ScopeProvider} [parentScopeProvider] - optional parent scope
     * @alias module:route
     * @returns {route}
     */
    route.conduct = function (scoreArg, parentScopeProvider) {
        var self = this;
        schema.score.route.validate(scoreArg, function (err, score) {
            if (err) {
                throw(err);
            }

            var scopeProvider = new ScopeProvider(score.scope, parentScopeProvider);

            //initialize our scope
            self.all(scopeProvider.init);

            if (score.preHandlers) {
                self.all(handler.handle(score.preHandlers, scopeProvider));
            }

            if (score.methods) {
                Object.keys(score.methods).forEach(function (method) {
                    var methodScore = score.methods[method],
                        methodHandlers = [],
                        methodScopeProvider = new ScopeProvider(methodScore.scope, scopeProvider);

                    methodHandlers.push(methodScopeProvider.init);

                    if (methodScore instanceof Array || typeof methodScore === 'function') {
                        methodScore = {
                            handlers: methodScore
                        };
                    }
                    if (methodScore.validator) {
                        if (typeof methodScore.validator === 'function') {
                            methodScore.validator = {
                                body: methodScore.validator
                            };
                        }

                        if (methodScore.validator.query) {
                            methodHandlers.push(handler.validateQuery(methodScore.validator.query, methodScopeProvider));
                        }
                        if (methodScore.validator.param) {
                            methodHandlers.push(handler.validateParam(methodScore.validator.param, methodScopeProvider));
                        }
                        if (methodScore.validator.body) {
                            methodHandlers.push(handler.validateBody(methodScore.validator.body, methodScopeProvider));
                        }
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
