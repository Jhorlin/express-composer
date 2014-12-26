/**
 * Created by jhorlin.dearmas on 12/26/2014.
 */
(function (module, exports, joi) {
   "use strict";
    var router = exports = module.exports = {},
        routerSchema = joi.object({
            preHandlers: joi.array().min(1).includes(joi.func()).optional(),
            routes:joi.array().includes(joi.object({
                path:joi.string().default('/')
            }).unknown()).min(1).required(),
            postHandlers: joi.array().min(1).includes(joi.func()).optional(),
            errorHandlers: joi.array().includes(joi.func()).optional(),
            scope:  joi.alternatives().try(joi.object(), joi.func()).optional(),
            routers:  joi.alternatives().try(joi.object(), joi.array().optinal())
        }).unknown().options({stripUnknown :true});

    router.compose = function(scoreArg){
        var self = this;
        routerSchema.validate(scoreArg, function(err, score){
            if(err){
                throw err;
            }
            if(score.preHandlers){

            }
            score.routes.forEach(function(scoreRoute){
                var route = self.route(scoreRoute.path);
                route.compose(scoreRoute);
            });
            if(score.postHandlers){

            }
            if(score.errorHandlers){

            }
        });
    };
}(module, module.exports, require('joi')));