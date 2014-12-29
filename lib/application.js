/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function(module, exports,Scope, joi){
    "use strict";

    var app = exports = module.exports = {},
        routerSchema = joi.object({
            preHandlers: joi.array().includes(joi.func()).optional(),
            routes:joi.array(),
            errorHandlers: joi.array().includes(joi.func()).optional(),
            scope:  joi.alternatives().try(joi.object(), joi.func()).optional(),
            path: joi.string().default('/'),
            routers: joi.object(),
            options:joi.object()
        }).unknown().options({stripUnknown :false}),
        scoresSchema = joi.array().includes(routerSchema).min(1);

    app.compose = function(scoreArg, scopeArg){
        scoresSchema.validate(scoreArg instanceof Array ? scoreArg : [scoreArg], function(err, scores){
            if(err){
                throw err;
            }
           var scope = new Scope(scopeArg);
            scores.forEach(function(score){
                var router = new app.Router(score.options, scope);
                router.compose(score);
                app.use(score.path, router);
            });
        });
    };
}(module, module.exports, require('./scope') ,require('joi')));