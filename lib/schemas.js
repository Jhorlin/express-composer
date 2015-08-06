/**
 * Created by jhorlin.dearmas on 1/19/2015.
 */
(function (module) {
    "use strict";

    var joi = require('joi'),
        methods = require('methods'),
        scopeSchema = joi.alternatives().try(joi.object(), joi.func()).optional(),
        scopeJsonSchema = joi.string().optional(),
        handlersSchema = joi.alternatives().try(joi.func(), joi.array().items(joi.func()).min(1)),
        handlersJsonSchema = joi.alternatives().try(joi.string(), joi.array().items(joi.string()).min(1)),
        pathSchema = joi.string().default('/').optional(),
        appOptionsSchema = joi.object({
            dotFiles: joi.string().optional(),
            etag: joi.boolean().optional(),
            extentions: joi.boolean().optional(),
            index: joi.alternatives().try(joi.boolean(), joi.string()).optional(),
            lastModified: joi.boolean().optional(),
            maxAge: joi.number().optional(),
            redirect: joi.boolean().optional(),
            setHeaders: joi.func().optional()
        }),
        routerOptionsSchema = joi.object().keys({
            caseSensitive: joi.boolean().optional(),
            mergeParams: joi.boolean().optional(),
            strict: joi.boolean().optional()
        }),
        methodSchema = joi.object({
            validator: joi.func(),
            preHandlers: handlersSchema.optional(),
            scope: joi.alternatives().try(joi.object(), joi.func()).optional(),
            handlers: handlersSchema,
            errorHandlers: handlersSchema.optional(),
            name: joi.string().optional(),
            description: joi.string().optional()
        }).unknown().options({stripUnknown: true}),
        methodJsonSchema = joi.object({
            validator: joi.string().optional(),
            preHandlers: handlersJsonSchema.optional(),
            scope: joi.string().optional(),
            handlers: handlersJsonSchema,
            errorHandlers: handlersJsonSchema.optional(),
            name: joi.string().optional(),
            description: joi.string().optional()
        }).unknown().options({stripUnknown: true}),
        methodsSchemaObject = {},
        methodsJsonSchemaObject = {};
    methods.forEach(function (method) {
        methodsSchemaObject[method] = joi.alternatives().try(methodSchema, handlersSchema);
        methodsJsonSchemaObject[method] = joi.alternatives().try(methodJsonSchema, handlersJsonSchema);
    });
    var methodsSchema = joi.object(methodsSchemaObject),
        methodsJsonSchema = joi.object(methodsJsonSchemaObject);
    methodsSchema = methodsSchema.xor.apply(methodsSchema, methods);
    methodsJsonSchema = methodsJsonSchema.xor.apply(methodsJsonSchema, methods);

    var routeSchema = joi.object({
            methods: methodsSchema,
            preHandlers: handlersSchema,
            errorHandlers: handlersSchema,
            scope: scopeSchema,
            name: joi.string().optional(),
            description: joi.string().optional(),
            path: pathSchema
        }).unknown().options({stripUnknown: true}),
        routeJsonSchema = joi.object({
            methods: methodsJsonSchema,
            preHandlers: handlersJsonSchema,
            errorHandlers: handlersJsonSchema,
            scope: scopeJsonSchema,
            name: joi.string().optional(),
            description: joi.string().optional()
        }).unknown().options({stripUnknown: true}),
        routerSchema = joi.object({
            preHandlers: handlersSchema.optional(),
            routes: joi.alternatives().try(routeSchema, joi.array().items(routeSchema).min(1).required()),
            errorHandlers: handlersSchema.optional(),
            scope: joi.alternatives().try(joi.object(), joi.func()).optional(),
            routers: joi.alternatives().try(joi.object(), joi.array().min(1)).optional(),
            name: joi.string().optional(),
            description: joi.string().optional(),
            path: pathSchema,
            options: routerOptionsSchema.optional()
        }).unknown().options({stripUnknown: true}),
        routerJsonSchema = joi.object({
            preHandlers: handlersJsonSchema.optional(),
            routes: joi.alternatives().try(routeJsonSchema, joi.array().items(routeJsonSchema).min(1).required()),
            errorHandlers: handlersJsonSchema.optional(),
            scope: scopeJsonSchema,
            routers: joi.alternatives().try(joi.object(), joi.array().min(1)).optional(),
            name: joi.string().optional(),
            path: pathSchema,
            options: routerOptionsSchema.optional(),
            description: joi.string().optional(),
        }).unknown().options({stripUnknown: true}),
        appSchema = joi.object({
            preHandlers: handlersSchema.optional(),
            errorHandlers: handlersSchema.optional(),
            routers: joi.alternatives().try(routerSchema, joi.array().items(routerSchema).min(1)),
            scope: scopeSchema,
            name: joi.string().optional(),
            description: joi.string().optional(),
            options: appOptionsSchema.optional(),
            path: pathSchema,
            apps: joi.alternatives().try(joi.object(), joi.array().items(joi.object()).min(1)),
            vhost: joi.string(),
            properties: joi.object().optional()
        }),
        appJsonSchema = joi.object({
            preHandlers: handlersJsonSchema.optional(),
            errorHandlers: handlersJsonSchema.optional(),
            routers: joi.alternatives().try(routerJsonSchema, joi.array().items(routerJsonSchema).min(1)),
            scope: scopeJsonSchema,
            name: joi.string().optional(),
            description: joi.string().optional(),
            options: appOptionsSchema.optional(),
            path: pathSchema,
            apps: joi.alternatives().try(joi.object(), joi.array().items(joi.object()).min(1)),
            vhost: joi.string(),
            properties: joi.object().optional()
        }),
        schemas = {
            composer: {
                app: appJsonSchema.required(),
                router: routerJsonSchema.required(),
                route: routeJsonSchema.required()
            },
            score: {
                app: appSchema.required(),
                router: routerSchema.required(),
                route: routeSchema.required()
            }
        };

    module.exports = schemas;

}(module));
