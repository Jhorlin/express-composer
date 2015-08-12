/**
 * Created by jhorlin.dearmas on 12/29/2014.
 */

/**
 *
 */
(function (module, require) {
    'use strict';
    var Promise = require('bluebird'),
        noop = function () {
        };
    module.exports = {
        /**
         * Creates an express middle ware handler that will iterate through composers handlers
         * @param {function[] | function} handlers
         * @param {ScopeProvider} scopeProvider - the scope of these handlers
         * @returns {function}
         */
        handle: function composerHandler (handlers, scopeProvider) {
            handlers = handlers instanceof Array ? handlers : [handlers];
            return function (req, res, next) {
                var handlerPromise = scopeProvider.scope
                    .cancellable()
                    .then(function (scope) {
                        return Promise
                            .each(handlers, function (handler) {
                                if (!res.headersSent) {
                                    return (handler.length <= 2 ?
                                        Promise.resolve(handler.call(scope, req, res))
                                        :
                                        Promise.promisify(handler).call(scope, req, res))
                                        .then(function (result) {
                                            if (res.headersSent) {
                                                return handlerPromise.cancel();
                                            }
                                            if (handler.name && result !== undefined) {
                                                scope.addResult(handler.name, result)
                                            }
                                        })
                                }
                                return handlerPromise.cancel();
                            })

                    })
                    .then(function () {
                        if (!res.headersSent) {
                            next();
                        }
                    })
                    .catch(Promise.CancellationError, noop)
                    .catch(function (err) {
                        if (!res.headersSent) {
                            next(err);
                        }
                    })
            };
        },
        /**
         * Creates an express middle ware error handler that will iterate through composers error handlers
         * @param {function[] | function} handlers
         * @param {ScopeProvider} scopeProvider - the scope for these handlers
         * @returns {function}
         */
        error: function composerErrorHandler (handlers, scopeProvider) {
            handlers = handlers instanceof Array ? handlers : [handlers];
            return function (err, req, res, next) {
                var handlerPromise = scopeProvider.scope
                    .cancellable()
                    .then(function (scope) {
                        return Promise.each(handlers, function (handler) {
                            if (!res.headersSent) {
                                return (handler.length <= 3 ?
                                    Promise.resolve(handler.call(scope, err, req, res))
                                    :
                                    Promise.promisify(handler).call(scope, err, req, res))
                                    .then(function (result) {
                                        if (res.headersSent) {
                                            return handlerPromise.cancel();
                                        }
                                        if (handler.name && result !== undefined) {
                                            scope.addError(handler.name, result)
                                        }
                                    })
                            }
                            return handlerPromise.cancel();
                        })

                    })
                    .then(function () {
                        if (!res.headersSent) {
                            next(err);
                        }
                    })
                    .catch(Promise.CancellationError, noop)
                    .catch(function () {
                        if (!res.headersSent) {
                            next(err);
                        }
                    })
            };
        },
        /**
         * Create an express middle ware that validates an incoming request
         * @param {function} validate - validation function
         * @param {ScopeProvider} scopeProvider - scope variable
         * @returns {Function}
         */
        validate: function composerValidator (validate, scopeProvider) {
            return function (req, res, next) {
                scopeProvider.scope
                    .then(function (scope) {
                        validate(req.body || req.query, function (err, request) {
                            scope.setRequest(request);
                            if (err) {
                                err.status = 400;
                                err.statusCode = 400;
                            }
                            next(err);
                        });
                    })

            };
        },
        /**
         * Disposes of the current scope and cleans up after the response is complete
         * @param {ScopeProvider} scopeProvider - the scope provider
         * @returns {Function}
         */
        dispose: function (scopeProvider) {
            return function (req, res, next) {
                scopeProvider.dispose();
                res.on('finish', scopeProvider.dispose.bind(scopeProvider));
                res.on('close', scopeProvider.dispose.bind(scopeProvider));
                next();
            };
        }
    };
}(module, require));
