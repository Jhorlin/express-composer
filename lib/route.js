/**
 * Created by jhorlin.dearmas on 12/26/2014.
 */
(function (module, exports, joi) {
    "use strict";
    var route = exports = module.exports = {},
        methodSchema = joi.object({
            validator: joi.object().optional(),
            preHandlers:joi.array().includes(joi.func()).min(1).optional(),
            handlers:joi.array().includes(joi.func()).min(1),
            errorHandlers:joi.array().includes(joi.func()).optional()
        }),
        routeSchema = joi.object({
            methods:joi.object({
                get:methodSchema,
                put:methodSchema,
                post:methodSchema,
                delete:methodSchema,
                all:methodSchema
            }).xor('get', 'put', 'post', 'delete', 'all'),
            scope:  joi.alternatives().try(joi.object(), joi.func()).optional()
        }).unknown().options({stripUnknown :true});

    route.compose = function(scoreArg){

    };
}(module, module.exports, require('joi')));