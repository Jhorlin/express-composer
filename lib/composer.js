/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
(function (module, require) {
    "use strict";
    var events = require('events'),
        emitter = events.EventEmitter,
        util = require('util'),
        q = require('q'),
        path = require('path'),
        schemas = require('./schemas');


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
        var relativeFolderPath = path.relative(__dirname, options);
        this.resolveSync = function (module) {
            return require(path.join(relativeFolderPath, module));
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

            if (appConfig.preHandlers) {
                appConfig.preHandlers = appConfig.preHandlers.map(handlerResolver.resolveSync);
            }

            appConfig.routers = appConfig.routers.map(self.composeRouterSync);

            if(appConfig.errorHandlers){
                appConfig.errorHandlers = appConfig.errorHandlers.map(handlerResolver.resolveSync);
            }

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

            schemas.composer.app.validate(config, function(err, scoreConfig){

            });
        };

        this.composeApp = function (config, cb) {
            if (!isInitialized) {
                throw new Error("ComposerFactory must be initialized");
            }
        };

        this.composeRouter = function (config, cb) {
            if (!isInitialized) {
                throw new Error("ComposerFactory must be initialized");
            }
        };

        this.composeRoute = function (config, cb) {
            if (!isInitialized) {
                throw new Error("ComposerFactory must be initialized");
            }
        };

    }

    function composerAbstractFactory(handlerResolver, schemaResolver, scopeResolver) {
        return new ComposerFactory(handlerResolver || DefaultResolver, schemaResolver || DefaultResolver, scopeResolver || DefaultResolver);
    }


    composerAbstractFactory.Resolver = Resolver;
    composerAbstractFactory.defaultFactory = composerAbstractFactory;
    module.exports = composerAbstractFactory;


}(module, require));