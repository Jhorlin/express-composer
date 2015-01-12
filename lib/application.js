/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function (module, exports, Scope, joi) {
    "use strict";


    var app = exports = module.exports = {},
        /**
         * @access private
         * @desc validates that the router in the routers routers argument
         * has the required properties
         */
        routerSchema = joi.object({
            scope: joi.alternatives().try(joi.object(), joi.func()).optional(),
            path: joi.string().default('/'),
            options: joi.object()
        }).unknown().options({stripUnknown: false}),
        /**
         * @access private
         * @desc validates the score 'configuration' object passed into compose has the required
         * properties
         */
        scoresSchema = joi.object({
                routers: joi.array().includes(routerSchema).min(1),
                scope: joi.alternatives().try(joi.object(), joi.func()).optional(),
                name: joi.string().optional(),
                description: joi.string().optional()
            }
        ).unknown();

    /**
     * Composes the express application and returns the app
     * @param {object} scoreArg - the config object used to compose the app
     * @param {Scope} [parentScope] - optional parent scope
     * @returns {app}
     */
    app.compose = function (scoreArg, parentScope) {
        var self = this,
        //since composer depends on this module and this module depends on composer the require has to be in
        //this function
        //TODO: stop the circular dependency in order to remove the require from this function
            composer = require('./composer');
        scoresSchema.validate(scoreArg, function (err, score) {
            if (err) {
                throw err;
            }
            //TODO: set up optional parent scope
            var scope = parentScope ? parentScope.child(score.scope) : new Scope(score.scope);
            score.routers.forEach(function (score) {
                var router = new composer.Router(score.options, scope);
                router.compose(score, scope);
                self.use(score.path, router);
            });
        });
        return self;
    };
}(module, module.exports, require('./scope'), require('joi')));