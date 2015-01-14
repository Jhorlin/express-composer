/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
(function (module, require, util, q, joi) {

    var events = require('events'),
        emitter = events.EventEmitter,
        scopeSchema = joi.alternatives().try(joi.object(), joi.func()).optional(),
        scopeJsonSchema = joi.string().optional(),
        handlersSchema = joi.array().includes(joi.func()).min(1),
        handlersJsonSchema = joi.array().includes(joi.string()).min(1),
        routerAppSchema = joi.object({
            scope: scopeSchema,
            path: joi.string().default('/'),
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
            validator: joi.object({
                validate: joi.func().required()
            }).unknown(),
            preHandlers: handlersJsonSchema.optional(),
            scope: joi.alternatives().try(joi.object(), joi.func()).optional(),
            handlers: handlersJsonSchema,
            errorHandlers: handlersJsonSchema.optional(),
            name: joi.string().optional(),
            description: joi.string().optional()
        }).unknown(),
        methodOrHandlersSchema = joi.alternatives().try(methodSchema, handlersSchema),
        methodOrHandlersJsonSchema = joi.alternatives().try(methodJsonSchema, handlersJsonSchema),
        routerAppJsonSchema = joi.object({
            scope: scopeJsonSchema,
            path: joi.string().default('/'),
            options: joi.object()
        }).unknown().options({stripUnknown: false}),
        routerSchema = joi.object({
            preHandlers: handlersSchema.optional(),
            routes: joi.array().includes(joi.object({
                path: joi.string().default('/')
            }).unknown()).min(1).required(),
            errorHandlers: handlersSchema.optional(),
            scope: joi.alternatives().try(joi.object(), joi.func()).optional(),
            routers: joi.alternatives().try(joi.object(), joi.array().min(1)).optional(),
            name: joi.string().optional(),
            description: joi.string().optional()
        }).unknown().options({stripUnknown: false}),
        routerSchemaJson = joi.object({
            preHandlers: handlersJsonSchema.optional(),
            routes: joi.array().includes(joi.object({
                path: joi.string().default('/')
            }).unknown()).min(1).required(),
            errorHandlers: handlersJsonSchema.optional(),
            scope: scopeJsonSchema,
            routers: joi.alternatives().try(joi.object(), joi.array().min(1)).optional(),
            name: joi.string().optional(),
            description: joi.string().optional()
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
        appSchema =  joi.object({
            routers: joi.array().includes(routerAppSchema).min(1),
            scope: scopeSchema,
            name: joi.string().optional(),
            description: joi.string().optional()
        }),
        appJsonSchema = joi.object({
            routers: joi.array().includes(routerAppJsonSchema).min(1),
            scope: scopeJsonSchema,
            name: joi.string().optional(),
            description: joi.string().optional()
        });


    function Resolver(options) {
    };

    Resolver.prototype.resolveSync = function () {
        throw new Error("resolveSync has not been implemented");
    };

    Resolver.prototype.resolve = function () {
        throw new Error("resolve has not been implemented");
    };

    function DefaultResolver(options) {
        if (typeof options !== "string") {
            throw new Error("Default resolver options must be a string");
        }
        this.resolveSync = function (module) {
            return require(options + module);
        }
    };

    util.inherits(DefaultResolver, Resolver)

    DefaultResolver.prototype.resolve(function (module, cb) {
        var resolvedModule,
            deferred = q.defer();
        try {
            resolvedModule = this.resolveSync(module);
            process.nextTick(function () {
                if (cb) {
                    cb(null, resolvedModule)
                }
                deferred.resolve(module);
            });
        } catch (err) {
            if (cb) {
                cb(err);
            }
            deferred.reject(err);
        }
        return deferred.promise();
    });

    function ComposerFactory(HandlerResolverConstructor, SchemaResolverConstructor, ScopeResolverConstructor) {
        var initialized = false,
            handlerResolver,
            schemaResolver,
            scopeResolver

        this.initialize = function (handerOptions, schemaOptions, scopeOptions) {
            if (handerOptions && HandlerResolverConstructor) {
                handlerResolver = new HandlerResolverConstructor(handerOptions);
            }

            if (schemaOptions && SchemaResolverConstructor) {
                schemaResolver = new SchemaResolverConstructor(schemaOptions);
            }

            if (scopeOptions && ScopeResolverConstructor) {
                scopeResolver = new ScopeResolverConstructor(scopeOptions);
            }

            initialized = true;
        };

        this.composeSync = function (config) {
            if (!initialized) {
                throw new Error("ComposerFactory must be initialized");
            }
        };

        this.compose = function (config, cb) {
            if (!initialized) {
                throw new Error("ComposerFactory must be initialized");
            }
        };

    }

    function composerAbstractFactory(handlerResolver, schemaResolver, scopeResolver) {
        return new ComposerFactory(handlerResolver || DefaultResolver, schemaResolver || DefaultResolver, scopeResolver || DefaultResolver);
    }


    var schemas = {
        composer:{
            app:appJsonSchema,
            router:routeJsonSchema,
            route:routeJsonSchema
        },
        score:{
            app:appSchema,
            router:routerSchema,
            route:routeSchema
        }
    }

    composerAbstractFactory.Resolver = Resolver;
    composerAbstractFactory.schemas = schemas;
    module.exports = composerAbstractFactory;


}(module, require, require('util'), require('q'), require('joi')));