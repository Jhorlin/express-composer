/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
(function (module, require, util, q, joi) {
    "use strict";
    var events = require('events'),
        emitter = events.EventEmitter,
        scopeSchema = joi.alternatives().try(joi.object(), joi.func()).optional(),
        scopeJsonSchema = joi.string().optional(),
        handlersSchema = joi.array().includes(joi.func()).min(1),
        handlersJsonSchema = joi.array().includes(joi.string()).min(1),
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
        routerSchema = joi.object({
            preHandlers: handlersSchema.optional(),
            routes: joi.array().includes(joi.object({
                path: pathSchema
            }).unknown()).min(1).required(),
            errorHandlers: handlersSchema.optional(),
            scope: joi.alternatives().try(joi.object(), joi.func()).optional(),
            routers: joi.alternatives().try(joi.object(), joi.array().min(1)).optional(),
            name: joi.string().optional(),
            description: joi.string().optional()
        }).unknown().options({stripUnknown: false}),
        routerJsonSchema = joi.object({
            preHandlers: handlersJsonSchema.optional(),
            routes: joi.array().includes(joi.object({
                path: pathSchema
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
        appSchema = joi.object({
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

    function Resolver(options) {
    }

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
            return require([options, module].join('/'));
        };
    }

    util.inherits(DefaultResolver, Resolver);

    DefaultResolver.prototype.resolve = function (module, cb) {
        var resolvedModule,
            deferred = q.defer();
        try {
            resolvedModule = this.resolveSync(module);
            process.nextTick(function () {
                if (cb) {
                    cb(null, resolvedModule);
                }
                deferred.resolve(module);
            });
        } catch (err) {
            if (cb) {
                cb(err);
            }
            deferred.reject(err);
        }
        return deferred.promise;
    };

    function ComposerFactory(HandlerResolverConstructor, SchemaResolverConstructor, ScopeResolverConstructor) {
        var isInitialized = false,
            handlerResolver,
            schemaResolver,
            scopeResolver,
            deferred = q.defer(),
            self = this,
            promise = deferred.promise;

        Object.defineProperty(this, 'initialized', {
            get: function () {
                return isInitialized;
            }
        });

        this.ready = promise.then.bind(promise);

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

            isInitialized = true;

            deferred.resolve(self);
        };

        this.composeSync = function (config) {
            if (!isInitialized) {
                throw new Error("ComposerFactory must be initialized");
            }
            var validation = schemas.composer.app.validate(config),
                appConfig;
            if (validation.err) {
                throw (validation.err);
            }
            appConfig = validation.value;
            return self.composeAppSync(appConfig);
        };

        this.composeAppSync = function (config) {
            if (!isInitialized) {
                throw new Error("ComposerFactory must be initialized");
            }
            var validation = schemas.composer.router.validate(config),
                appConfig;
            if (validation.err) {
                throw validation.err;
            }
            appConfig = validation.value;
            if (appConfig.scope) {
                appConfig.scope = scopeResolver.resolveSync(appConfig.scope);
            }
            appConfig.routers = appConfig.routers.map(self.composeRouterSync);
            return appConfig;
        };

        this.composeRouterSync = function (config) {
            if (!isInitialized) {
                throw new Error("ComposerFactory must be initialized");
            }
            var validation = schemas.composer.router.validate(config),
                routerConfig;
            if (validation.err) {
                throw validation.err;
            }
            routerConfig = validation.value;
            if (routerConfig.scope) {
                routerConfig.scope = scopeResolver.resolveSync(routerConfig.scope);
            }
            if (routerConfig.preHandlers) {
                routerConfig.preHandlers = routerConfig.preHandlers.map(handlerResolver.resolveSync);
            }

            routerConfig.routes = routerConfig.routes instanceof Array ? routerConfig.routes : [routerConfig.routes];
            routerConfig.routes = routerConfig.routes.map(self.composeRouteSync);

            if (routerConfig.routers) {
                routerConfig.routers = routerConfig.routers instanceof Array ? routerConfig.routers : [routerConfig.routers];
                routerConfig.routers = routerConfig.routers.map(self.composeRouterSync);
            }

            if (routerConfig.errorHandlers) {
                routerConfig.errorHandlers = routerConfig.errorHandlers.map(handlerResolver.resolveSync);
            }

            return routerConfig;
        };

        this.composeRouteSync = function (config) {
            if (!isInitialized) {
                throw new Error("ComposerFactory must be initialized");
            }
            var validation = schemas.composer.route.validate(config),
                routeConfig;
            if (validation.err) {
                throw validation.err;
            }
            routeConfig = validation.value;
            if (routeConfig.preHandlers) {
                routeConfig.preHandlers = routeConfig.preHandlers.map(handlerResolver.resolveSync);
            }

            Object.keys(routeConfig.methods).forEach(function (method) {
                var methodConfig = routeConfig.methods[method];

                if (methodConfig instanceof Array) {
                    methodConfig = routeConfig.methods[method] = {
                        handlers: methodConfig
                    };
                }

                if (methodConfig.preHandlers) {
                    methodConfig.preHandlers = methodConfig.preHandlers.map(handlerResolver.resolveSync);
                }

                methodConfig.handlers = methodConfig.handlers.map(handlerResolver.resolveSync);

                if (methodConfig.validator) {
                    methodConfig.validator = schemaResolver.resolveSync(methodConfig.validator);
                }

                if (methodConfig.errorHandlers) {
                    methodConfig.errorHandlers = methodConfig.errorHandlers.map(handlerResolver.resolveSync);
                }

            });


            if (routeConfig.errorHandlers) {
                routeConfig.errorHandlers = routeConfig.errorHandlers.map(handlerResolver.resolveSync);
            }

            return routeConfig;
        };

        this.compose = function (config, cb) {
            if (!isInitialized) {
                throw new Error("ComposerFactory must be initialized");
            }
        };

    }

    function composerAbstractFactory(handlerResolver, schemaResolver, scopeResolver) {
        return new ComposerFactory(handlerResolver || DefaultResolver, schemaResolver || DefaultResolver, scopeResolver || DefaultResolver);
    }


    composerAbstractFactory.Resolver = Resolver;
    composerAbstractFactory.schemas = schemas;
    composerAbstractFactory.defaultFactory = composerAbstractFactory;
    module.exports = composerAbstractFactory;


}(module, require, require('util'), require('q'), require('joi')));