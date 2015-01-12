/**
 * Created by jhorlin.dearmas on 12/26/2014.
 */
(function (module, exports, joi, handler, Scope) {
   "use strict";
    var router = exports = module.exports = {},
        routerSchema = joi.object({
            preHandlers: joi.array().min(1).includes(joi.func()).optional(),
            routes:joi.array().includes(joi.object({
                path:joi.string().default('/')
            }).unknown()).min(1).required(),
            errorHandlers: joi.array().min(1).includes(joi.func()).optional(),
            scope:  joi.alternatives().try(joi.object(), joi.func()).optional(),
            routers:  joi.alternatives().try(joi.object(), joi.array().min(1)).optional(),
            name: joi.string().optional(),
            description: joi.string().optional()
        }).unknown().options({stripUnknown :false});

    /**
     * Create a router based on the score 'configuration' object
     * @param {object} scoreArg - configuration object
     * @param {scope} [parentScope] - optional parent scope
     * @returns {router}
     */
    router.compose = function(scoreArg, parentScope){
        if(!scoreArg){
            throw new Error("scoreArg is required");
        }
        var self = this;
        routerSchema.validate(scoreArg, function(err, score){
            var childScope = parentScope ? parentScope.child(score.scope) : new Scope(score.scope);
            if(err){
                throw err;
            }
            if(score.preHandlers){
                self.use(handler.handle(score.preHandlers, childScope));
            }
            score.routes.forEach(function(scoreRoute){
                var route = self.route(scoreRoute.path);
                route.compose(scoreRoute, childScope);
            });

            if(score.routers){
                (score.routers instanceof Array ? score.routers : [score.routers]).forEach(function(score){
                    var childRouter = new router.prototype.constructor(score.options);
                    childRouter.compose(score, childScope);
                    self.use(score.path, childRouter);
                });
            }

            if(score.errorHandlers){
                self.use(handler.error(score.errorHandlers, childScope));
            }
        });
        return self;
    };
}(module, module.exports, require('joi'), require('./handler'), require('./scope')));