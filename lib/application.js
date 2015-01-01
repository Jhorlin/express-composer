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
        scoresSchema = joi.array().includes(routerSchema).min(1);

    app.compose = function (scoreArg, scopeArg) {
        var self = this,
        //since composer depends on this module and this module depends on composer the require has to be in
        //this function
        //TODO: stop the circular dependency in order to remove the require from this function
            composer = require('./composer');
        scoresSchema.validate(scoreArg instanceof Array ? scoreArg : [scoreArg], function (err, scores) {
            if (err) {
                throw err;
            }
            var scope = new Scope(scopeArg);
            scores.forEach(function (score) {
                var router = new composer.Router(score.options, scope);
                router.compose(score, scope);
                self.use(score.path, router);
            });
        });
    };
}(module, module.exports, require('./scope'), require('joi')));