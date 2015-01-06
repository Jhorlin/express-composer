/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function (module, exports, Scope, joi) {
    "use strict";

    var app = exports = module.exports = {},
        routerSchema = joi.object({
            scope: joi.alternatives().try(joi.object(), joi.func()).optional(),
            path: joi.string().default('/'),
            options: joi.object()
        }).unknown().options({stripUnknown: false}),
        scoresSchema = joi.object({
                routers: joi.array().includes(routerSchema).min(1),
                scope: joi.alternatives().try(joi.object(), joi.func()).optional()
            }
        ).unknown();

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