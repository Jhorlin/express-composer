/**
 * Created by jhorlin.dearmas on 1/19/2015.
 */
(function (module, joi) {
    "use strict";
    var scopeSchema = joi.alternatives().try(joi.object(), joi.func()).optional(),
        scopeJsonSchema = joi.string().optional(),
        handlersSchema = joi.alternatives().try(joi.func(), joi.array().items(joi.func()).min(1)),
        handlersJsonSchema = joi.alternatives().try(joi.string(), joi.array().items(joi.string()).min(1)),
        pathSchema = joi.string().default('/').optional(),
        routerAppSchema = joi.object({
            scope: scopeSchema,
            path: pathSchema,
            options: joi.object()
        }).unknown().options({stripUnknown: false}),
        methodSchema = joi.object({
            validator: joi.object({
                validate: joi.func().required()
            }).unknown(),
            preHandlers: handlersSchema.optional(),
            scope: joi.alternatives().try(joi.object(), joi.func()).optional(),
            handlers: handlersSchema,
            errorHandlers: handlersSchema.optional(),
            name: joi.string().optional(),
            description: joi.string().optional()
        }).unknown(),
        methodJsonSchema = joi.object({
            validator: joi.string().optional(),
            preHandlers: handlersJsonSchema.optional(),
            scope: joi.string().optional(),
            handlers: handlersJsonSchema,
            errorHandlers: handlersJsonSchema.optional(),
            name: joi.string().optional(),
            description: joi.string().optional()
        }).unknown(),
        methodOrHandlersSchema = joi.alternatives().try(methodSchema, handlersSchema),
        methodOrHandlersJsonSchema = joi.alternatives().try(methodJsonSchema, handlersJsonSchema),
        routerAppJsonSchema = joi.object({
            scope: scopeJsonSchema,
            path: pathSchema,
            options: joi.object()
        }).unknown().options({stripUnknown: false}),
        routeSchema = joi.object({
            methods: joi.object({
                get: methodOrHandlersSchema,
                put: methodOrHandlersSchema,
                post: methodOrHandlersSchema,
                delete: methodOrHandlersSchema,
                all: methodOrHandlersSchema
            }).xor('get', 'put', 'post', 'delete', 'all'),
            preHandlers: handlersSchema,
            errorHandlers: handlersSchema,
            scope: scopeSchema,
            name: joi.string().optional(),
            description: joi.string().optional(),
            path: pathSchema
        }).unknown().options({stripUnknown: false}),
        routerSchema = joi.object({
            preHandlers: handlersSchema.optional(),
            routes: joi.alternatives().try(routeSchema, joi.array().items(routeSchema).min(1).required()),
            errorHandlers: handlersSchema.optional(),
            scope: joi.alternatives().try(joi.object(), joi.func()).optional(),
            routers: joi.alternatives().try(joi.object(), joi.array().min(1)).optional(),
            name: joi.string().optional(),
            description: joi.string().optional(),
            path: pathSchema
        }).unknown().options({stripUnknown: false}),
        routerJsonSchema = joi.object({
            preHandlers: handlersJsonSchema.optional(),
            routes: joi.array().items(joi.object({
                path: pathSchema
            }).unknown()).min(1).required(),
            errorHandlers: handlersJsonSchema.optional(),
            scope: scopeJsonSchema,
            routers: joi.alternatives().try(joi.object(), joi.array().min(1)).optional(),
            name: joi.string().optional(),
            description: joi.string().optional()
        }).unknown().options({stripUnknown: false}),
        routeJsonSchema = joi.object({
            methods: joi.object({
                get: methodOrHandlersJsonSchema,
                put: methodOrHandlersJsonSchema,
                post: methodOrHandlersJsonSchema,
                delete: methodOrHandlersJsonSchema,
                all: methodOrHandlersJsonSchema
            }).xor('get', 'put', 'post', 'delete', 'all'),
            preHandlers: handlersJsonSchema,
            errorHandlers: handlersJsonSchema,
            scope: scopeJsonSchema,
            name: joi.string().optional(),
            description: joi.string().optional()
        }).unknown().options({stripUnknown: false}),
        appSchema = joi.object({
            preHandlers: handlersSchema.optional(),
            errorHandlers: handlersSchema.optional(),
            routers: joi.alternatives().try(routerSchema, joi.array().items(routerAppSchema).min(1)),
            scope: scopeSchema,
            name: joi.string().optional(),
            description: joi.string().optional(),
            path: pathSchema
        }),
        appJsonSchema = joi.object({
            preHandlers: handlersJsonSchema.optional(),
            errorHandlers: handlersJsonSchema.optional(),
            routers: joi.alternatives().try(routerAppJsonSchema, joi.array().items(routerAppJsonSchema).min(1)),
            scope: scopeJsonSchema,
            name: joi.string().optional(),
            description: joi.string().optional()
        }),
        schemas = {
            composer: {
                app: appJsonSchema,
                router: routerJsonSchema,
                route: routeJsonSchema
            },
            score: {
                app: appSchema,
                router: routerSchema,
                route: routeSchema
            }
        };

    module.exports = schemas;

}(module, require('joi')));
