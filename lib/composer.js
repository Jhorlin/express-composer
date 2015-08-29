/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
(function (module, require) {
    'use strict';
    var events = require('events'),
        util = require('util'),
        path = require('path'),
        Promise = require('bluebird'),
        schema = require('./schema'),
        asyncRequire = require('async-require');


    function Resolver(options) {
    }

    Resolver.prototype.resolveSync = function () {
        throw new Error('resolveSync has not been implemented');
    };

    Resolver.prototype.resolve = function () {
        throw new Error('resolve has not been implemented');
    };

    function DefaultResolver(options) {
    }

    util.inherits(DefaultResolver, Resolver);

    DefaultResolver.prototype.resolveSync = function (module) {
        return require(path.relative(__dirname, module));
    };

    DefaultResolver.prototype.resolve = function (module) {
        return asyncRequire(path.relative(__dirname, module));
    };

    function ComposerFactory(HandlerResolverConstructor, SchemaResolverConstructor, ScopeResolverConstructor) {
        var isInitialized = false,
            handlerResolver,
            schemaResolver,
            scopeResolver,
            self = this;

        Object.defineProperty(this, 'initialized', {
            get: function () {
                return isInitialized;
            }
        });

        var promise = new Promise(function (resolve, reject) {
            self.initialize = function (handerOptions, schemaOptions, scopeOptions) {
                if (HandlerResolverConstructor) {
                    handlerResolver = new HandlerResolverConstructor(handerOptions);
                }

                if (SchemaResolverConstructor) {
                    schemaResolver = new SchemaResolverConstructor(schemaOptions);
                }

                if (ScopeResolverConstructor) {
                    scopeResolver = new ScopeResolverConstructor(scopeOptions);
                }

                isInitialized = true;

                resolve(self);
            };
        });

        this.ready = promise.then.bind(promise);

        this.composeSync = function (config) {
            if (!isInitialized) {
                throw new Error('ComposerFactory must be initialized');
            }
            var validation = schema.composer.app.validate(config),
                appConfig;
            if (validation.error) {
                throw (validation.error);
            }
            appConfig = validation.value;
            return self.composeAppSync(appConfig);
        };

        this.composeAppSync = function (config) {
            if (!isInitialized) {
                throw new Error('ComposerFactory must be initialized');
            }
            var validation = schema.composer.app.validate(config),
                appConfig;
            if (validation.error) {
                throw validation.error;
            }
            appConfig = validation.value;
            if (appConfig.scope) {
                appConfig.scope = scopeResolver.resolveSync(appConfig.scope);
            }

            if (appConfig.preHandlers) {
                appConfig.preHandlers = ((appConfig.preHandlers instanceof Array ? appConfig.preHandlers : [appConfig.preHandlers])
                    .map(handlerResolver.resolveSync.bind(handlerResolver)));
            }

            if (appConfig.routers) {
                appConfig.routers = ((appConfig.routers instanceof Array ? appConfig.routers : [appConfig.routers])
                    .map(self.composeRouterSync));
            }

            if (appConfig.apps) {
                appConfig.apps = ((appConfig.apps instanceof Array ? appConfig.apps : [appConfig.apps])
                    .map(self.composeAppSync));
            }

            if (appConfig.errorHandlers) {
                appConfig.errorHandlers = ((appConfig.errorHandlers instanceof Array ? appConfig.errorHandlers : [appConfig.errorHandlers])
                    .map(handlerResolver.resolveSync.bind(handlerResolver)));
            }

            return appConfig;
        };

        this.composeRouterSync = function (config) {
            if (!isInitialized) {
                throw new Error('ComposerFactory must be initialized');
            }
            var validation = schema.composer.router.validate(config),
                routerConfig;
            if (validation.error) {
                throw validation.error;
            }
            routerConfig = validation.value;
            if (routerConfig.scope) {
                routerConfig.scope = scopeResolver.resolveSync(routerConfig.scope);
            }
            if (routerConfig.preHandlers) {
                routerConfig.preHandlers = ((routerConfig.preHandlers instanceof Array ? routerConfig.preHandlers : [routerConfig.preHandlers])
                    .map(handlerResolver.resolveSync.bind(handlerResolver)));
            }

            if (routerConfig.routes) {
                routerConfig.routes = ((routerConfig.routes instanceof Array ? routerConfig.routes : [routerConfig.routes])
                    .map(self.composeRouteSync));
            }

            if (routerConfig.routers) {
                routerConfig.routers = ((routerConfig.routers instanceof Array ? routerConfig.routers : [routerConfig.routers])
                    .map(self.composeRouterSync));
            }

            if (routerConfig.errorHandlers) {
                routerConfig.errorHandlers = ((routerConfig.errorHandlers instanceof Array ? routerConfig.errorHandlers : [routerConfig.errorHandlers])
                    .map(handlerResolver.resolveSync.bind(handlerResolver)));
            }

            return routerConfig;
        };

        this.composeRouteSync = function (config) {
            if (!isInitialized) {
                throw new Error('ComposerFactory must be initialized');
            }
            var validation = schema.composer.route.validate(config),
                routeConfig;
            if (validation.error) {
                throw validation.error;
            }
            routeConfig = validation.value;
            if (routeConfig.preHandlers) {
                routeConfig.preHandlers = ((routeConfig.preHandlers instanceof Array ? routeConfig.preHandlers : [routeConfig.preHandlers])
                    .map(handlerResolver.resolveSync.bind(handlerResolver)));
            }

            if (routeConfig.scope) {
                routeConfig.scope = scopeResolver.resolveSync(routeConfig.scope);
            }

            if (routeConfig.methods) {
                Object.keys(routeConfig.methods).forEach(function (method) {
                    var methodConfig = routeConfig.methods[method];

                    if (methodConfig instanceof Array || typeof methodConfig === 'string') {
                        methodConfig = routeConfig.methods[method] = {
                            handlers: methodConfig
                        };
                    }

                    if (methodConfig.scope) {
                        methodConfig.scope = scopeResolver.resolveSync(methodConfig.scope);
                    }

                    if (methodConfig.preHandlers) {
                        methodConfig.preHandlers = ((methodConfig.preHandlers instanceof Array ? methodConfig.preHandlers : [methodConfig.preHandlers])
                            .map(handlerResolver.resolveSync.bind(handlerResolver)));
                    }

                    if (methodConfig.handlers) {
                        methodConfig.handlers = ((methodConfig.handlers instanceof Array ? methodConfig.handlers : [methodConfig.handlers])
                            .map(handlerResolver.resolveSync.bind(handlerResolver)));
                    }

                    if (methodConfig.validator) {
                        if (typeof methodConfig.validator === 'string') {
                            methodConfig.validator = {
                                body: methodConfig.validator
                            }
                        }

                        ['query', 'param', 'body'].forEach(function (key) {
                            if (methodConfig.validator[key]) {
                                methodConfig.validator[key] = schemaResolver.resolveSync(methodConfig.validator[key]);
                            }
                        });

                    }

                    if (methodConfig.errorHandlers) {
                        methodConfig.errorHandlers = ((methodConfig.errorHandlers instanceof Array ? methodConfig.errorHandlers : [methodConfig.errorHandlers])
                            .map(handlerResolver.resolveSync.bind(handlerResolver)));
                    }

                });
            }


            if (routeConfig.errorHandlers) {
                routeConfig.errorHandlers = ((routeConfig.errorHandlers instanceof Array ? routeConfig.errorHandlers : [routeConfig.errorHandlers])
                    .map(handlerResolver.resolveSync.bind(handlerResolver)));
            }

            return routeConfig;
        };

        this.compose = function (config) {
            return new Promise(function (resolve, reject) {
                if (!isInitialized) {
                    return reject(new Error('ComposerFactory must be initialized'));
                }

                schema.composer.app.validate(config, function (err, scoreConfig) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(self.composeApp(scoreConfig));
                });
            });
        };

        this.composeApp = function (config) {
            return new Promise(function (resolve, reject) {
                if (!isInitialized) {
                    return reject(new Error('ComposerFactory must be initialized'));
                }
                var validation = schema.composer.app.validate(config),
                    appConfig;
                if (validation.error) {
                    return reject(validation.error);
                }
                appConfig = validation.value;

                var promises = [];
                if (appConfig.scope) {
                    promises.push(scopeResolver.resolve(appConfig.scope)
                        .then(function (result) {
                            appConfig.scope = result;
                        }));
                }
                if (appConfig.preHandlers) {
                    promises.push(Promise.all((appConfig.preHandlers instanceof Array ? appConfig.preHandlers : [appConfig.preHandlers])
                        .map(handlerResolver.resolve.bind(handlerResolver)))
                        .then(function (results) {
                            appConfig.preHandlers = results;
                        }));
                }

                if (appConfig.routers) {
                    promises.push(Promise.all((appConfig.routers instanceof Array ? appConfig.routers : [appConfig.routers])
                        .map(self.composeRouter)).then(function (results) {
                        appConfig.routers = results;
                    }));
                }

                if (appConfig.apps) {
                    promises.push(Promise.all((appConfig.apps instanceof Array ? appConfig.apps : [appConfig.apps])
                        .map(self.composeApp)).then(function (results) {
                        appConfig.apps = results;
                    }));
                }


                if (appConfig.errorHandlers) {
                    promises.push(Promise.all((appConfig.errorHandlers instanceof Array ? appConfig.errorHandlers : [appConfig.errorHandlers])
                        .map(handlerResolver.resolve.bind(handlerResolver)))
                        .then(function (results) {
                            appConfig.errorHandlers = results;
                        }));
                }

                Promise.all(promises).then(function () {
                    resolve(appConfig);
                });
            });
        };

        this.composeRouter = function (config) {
            return new Promise(function (resolve, reject) {
                if (!isInitialized) {
                    return reject(new Error('ComposerFactory must be initialized'));
                }
                var validation = schema.composer.router.validate(config),
                    routerConfig,
                    promises = [];
                if (validation.error) {
                    return reject(validation.error);
                }
                routerConfig = validation.value;
                if (routerConfig.scope) {
                    promises.push(scopeResolver.resolve(routerConfig.scope).then(function (result) {
                        routerConfig.scope = result;
                    }));
                }
                if (routerConfig.preHandlers) {
                    promises.push(Promise.all((routerConfig.preHandlers instanceof Array ? routerConfig.preHandlers : [routerConfig.preHandlers])
                        .map(handlerResolver.resolve.bind(handlerResolver)))
                        .then(function (results) {
                            routerConfig.preHandlers = results;
                        }));
                }

                if (routerConfig.routes) {
                    promises.push(Promise.all((routerConfig.routes instanceof Array ? routerConfig.routes : [routerConfig.routes])
                        .map(self.composeRoute))
                        .then(function (results) {
                            routerConfig.routes = results;
                        }));
                }

                if (routerConfig.routers) {
                    promises.push(Promise.all((routerConfig.routers instanceof Array ? routerConfig.routers : [routerConfig.routers])
                        .map(self.composeRouter))
                        .then(function (results) {
                            routerConfig.routers = results;
                        }));
                }

                if (routerConfig.errorHandlers) {
                    promises.push(Promise.all((routerConfig.errorHandlers instanceof Array ? routerConfig.errorHandlers : [routerConfig.errorHandlers])
                        .map(handlerResolver.resolve.bind(handlerResolver)))
                        .then(function (results) {
                            routerConfig.errorHandlers = results;
                        }));
                }

                Promise.all(promises).then(function (result) {
                    resolve(routerConfig);
                });
            });
        };

        this.composeRoute = function (config) {
            return new Promise(function (resolve, reject) {
                if (!isInitialized) {
                    return resolve(new Error('ComposerFactory must be initialized'));
                }
                var validation = schema.composer.route.validate(config),
                    routeConfig,
                    promises = [];

                if (validation.error) {
                    return resolve(validation.error);
                }
                routeConfig = validation.value;

                if (routeConfig.scope) {
                    promises.push(scopeResolver.resolve(routeConfig.scope).then(function (result) {
                        routeConfig.scope = result;
                    }));
                }

                if (routeConfig.preHandlers) {
                    promises.push(Promise.all((routeConfig.preHandlers instanceof Array ? routeConfig.preHandlers : [routeConfig.preHandlers])
                        .map(handlerResolver.resolve.bind(handlerResolver)))
                        .then(function (results) {
                            routeConfig.preHandlers = results;
                        }));
                }

                if (routeConfig.methods) {
                    Object.keys(routeConfig.methods).forEach(function (method) {
                        var methodConfig = routeConfig.methods[method];

                        if (methodConfig instanceof Array || typeof methodConfig === 'string') {
                            methodConfig = routeConfig.methods[method] = {
                                handlers: methodConfig
                            };
                        }

                        if (methodConfig.scope) {
                            promises.push(scopeResolver.resolve(methodConfig.scope).then(function (result) {
                                methodConfig.scope = result;
                            }));
                        }

                        if (methodConfig.handlers) {
                            promises.push(Promise.all((methodConfig.handlers instanceof Array ? methodConfig.handlers : [methodConfig.handlers])
                                .map(handlerResolver.resolve.bind(handlerResolver)))
                                .then(function (results) {
                                    methodConfig.handlers = results;
                                }));
                        }

                        if (methodConfig.validator) {
                            if (typeof methodConfig.validator === 'string') {
                                methodConfig.validator = {
                                    body: methodConfig.validator
                                }
                            }

                            promises.push(Promise.each(['query', 'param', 'body'], function (key) {
                                if (methodConfig.validator[key]) {
                                    return schemaResolver.resolve(methodConfig.validator[key])
                                        .then(function (result) {
                                            methodConfig.validator[key] = result;
                                        })
                                }
                            }))
                        }

                        if (methodConfig.errorHandlers) {
                            promises.push(Promise.all((methodConfig.errorHandlers instanceof Array ? methodConfig.errorHandlers : [methodConfig.errorHandlers])
                                .map(handlerResolver.resolve.bind(handlerResolver)))
                                .then(function (results) {
                                    methodConfig.errorHandlers = results;
                                }));
                        }

                    });
                }


                if (routeConfig.errorHandlers) {
                    promises.push(Promise.all((routeConfig.errorHandlers instanceof Array ? routeConfig.errorHandlers : [routeConfig.errorHandlers])
                        .map(handlerResolver.resolve.bind(handlerResolver)))
                        .then(function (results) {
                            routeConfig.errorHandlers = results;
                        }));
                }

                Promise.all(promises)
                    .then(function () {
                        resolve(routeConfig);
                    });
            });
        };

    }

    function composerAbstractFactory(handlerResolver, schemaResolver, scopeResolver) {
        return new ComposerFactory(handlerResolver || DefaultResolver, schemaResolver || DefaultResolver, scopeResolver || DefaultResolver);
    }


    composerAbstractFactory.Resolver = Resolver;
    composerAbstractFactory.Factory = ComposerFactory;
    module.exports = composerAbstractFactory;


}(module, require));
