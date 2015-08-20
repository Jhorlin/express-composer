/**
 * Created by jhorlin.dearmas on 12/29/2014.
 */

/**
 *
 */
(function (module, require) {
    'use strict';
    //dependencies
    var Promise = require('bluebird'),
        util = require('util');

    function HeadersSent () {
    };

    var noop = function () {
    };
    module.exports = {
        /**
         * Creates an express middle ware handler that will iterate through composers handlers
         * @param {function[] | function} handlers
         * @param {ScopeProvider} scopeProvider - the scope of these handlers
         * @returns {function}
         */
        handle: function (handlers, scopeProvider) {
            handlers = handlers instanceof Array ? handlers : [handlers];
            return function composerHandler (req, res, next) {
                var scope = req.expressComposerScopeCache.get(scopeProvider.key);

                Promise.each(handlers, function (handler) {
                    if (res.headersSent) {
                        return Promise.reject(new HeadersSent());
                    }
                    return (handler.length <= 2 ?
                        Promise.resolve(handler.call(scope, req, res))
                        :
                        Promise.promisify(handler).call(scope, req, res))
                        .then(function (result) {
                            if (handler.name && result !== undefined && !res.headersSent) {
                                scope.addResult(handler.name, result)
                            }
                        })
                }).then(function () {
                    if (!res.headersSent) {
                        next();
                    }
                })
                    .catch(HeadersSent, noop)
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
        error: function (handlers, scopeProvider) {
            handlers = handlers instanceof Array ? handlers : [handlers];
            return function composerErrorHandler (err, req, res, next) {
                var scope = req.expressComposerScopeCache.get(scopeProvider.key);

                return Promise.each(handlers, function (handler) {
                    if (res.headersSent) {
                        return Promise.reject(new HeadersSent());
                    }
                    return (handler.length <= 3 ?
                        Promise.try(handler.bind(scope, err, req, res))
                        :
                        Promise.promisify(handler).call(scope, err, req, res))
                        .then(function (result) {
                            if (handler.name && result !== undefined && !res.headersSent) {
                                scope.addError(handler.name, result)
                            }
                        }, noop)

                }).then(function () {
                    if (!res.headersSent) {
                        next(err);
                    }
                })
                    .catch(HeadersSent, noop)
            };
        },
        /**
         * Create an express middle ware that validates an incoming request
         * @param {function} validate - validation function
         * @param {ScopeProvider} scopeProvider - scope variable
         * @returns {Function}
         */
        validate: function (validate, scopeProvider) {
            return function composerValidator (req, res, next) {
                var scope = req.expressComposerScopeCache.get(scopeProvider.key);
                validate(req.body || req.query, function (err, request) {
                    scope.setRequest(request);
                    if (err) {
                        err.status = 400;
                        err.statusCode = 400;
                    }
                    next(err);
                });
            };
        }
    };
}(module, require));
