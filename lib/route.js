/**
 * Created by jhorlin.dearmas on 12/26/2014.
 */
(function (module, exports, composer, handler, Scope) {
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
        if (!scoreArg) {
            throw new Error("scoreArg is required");
        }
        var self = this;
        composer.schemas.score.route.validate(scoreArg, function (err, score) {
            if (err) {
                throw(err);
            }
            if (score.preHandlers) {
                self.all(handler.handle(score.preHandlers, parentScope));
            }
            var scope = parentScope ? parentScope.child(score.scope) : new Scope(score.scope);
            Object.keys(score.methods).forEach(function (method) {
                var methodScore = score.methods[method],
                    methodHandlers = [],
                    methodScope = scope.child(methodScore.scope);
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
                methodHandlers.push(handler.handle(methodScore.handlers, methodScope));
                if (methodScore.errorHandlers) {
                    methodHandlers.push(handler.error(methodScore.errorHandlers, methodScope));
                }
                self[method].apply(self, methodHandlers);
            });
            if (score.errorHandlers) {
                self.all(handler.error(score.errorHandlers, parentScope));
            }
        });
        return self;
    };

}(module, module.exports, require('./composer'), require('./handler'), require('./scope')));