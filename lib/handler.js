/**
 * Created by jhorlin.dearmas on 12/29/2014.
 */

/**
 *
 */
(function (module, require) {
    'use strict';
    //dependencies
    var Promise = require('bluebird');

    function Responding() {
    }

    function noop() {
    }

    module.exports = {
        /**
         * Creates an express middle ware handler that will iterate through composers handlers
         * @param {function[] | function} handlers
         * @param {ScopeProvider} scopeProvider - the scope of these handlers
         * @returns {function}
         */
        handle: function (handlers, scopeProvider) {
            handlers = handlers instanceof Array ? handlers : [handlers];
            return function composerHandler(req, res, next) {
                var scope = req.expressComposerScopeCache.get(scopeProvider.key);

                Promise.each(handlers, function (handler) {
                    if (res.composerResponding) {
                        return Promise.reject(new Responding());
                    }
                    return (handler.length <= 2 ?
                        Promise.resolve(handler.call(scope, req, res))
                        :
                        Promise.promisify(handler).call(scope, req, res))
                        .then(function (result) {
                            if (handler.name && result !== undefined && !res.composerResponding) {
                                scope.addResult(handler.name, result);
                            }
                        });
                }).then(function () {
                    if (!res.composerResponding) {
                        next();
                    }
                })
                    //if a response has been sent don't do anything
                    .catch(Responding, noop)
                    .catch(function (err) {
                        if (!res.composerResponding) {
                            next(err);
                        }
                    });
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
            return function composerErrorHandler(err, req, res, next) {
                var scope = req.expressComposerScopeCache.get(scopeProvider.key);

                return Promise.each(handlers, function (handler) {
                    if (res.composerResponding) {
                        return Promise.reject(new Responding());
                    }
                    return (handler.length <= 3 ?
                        Promise.try(handler.bind(scope, err, req, res))
                        :
                        Promise.promisify(handler).call(scope, err, req, res))
                        .then(function (result) {
                            if (handler.name && result !== undefined && !res.composerResponding) {
                                scope.addError(handler.name, result);
                            }
                        }, noop);

                }).then(function () {
                    if (!res.composerResponding) {
                        next(err);
                    }
                })
                    .catch(Responding, noop);
            };
        },
        /**
         * Create an express middle ware that validates an incoming request
         * @param {function} validate - validation function
         * @param {ScopeProvider} scopeProvider - scope variable
         * @returns {Function}
         */
        validateBody: function (validate, scopeProvider) {
            return function composerBodyValidator(req, res, next) {
                var scope = req.expressComposerScopeCache.get(scopeProvider.key);
                validate(req.body, function (err, result) {
                    scope.setBody(result);
                    if (err) {
                        err.status = 400;
                        err.statusCode = 400;
                    }
                    next(err);
                });
            };
        },
        /**
         * Create an express middle ware that validates an incoming request
         * @param {function} validate - validation function
         * @param {ScopeProvider} scopeProvider - scope variable
         * @returns {Function}
         */
        validateQuery: function (validate, scopeProvider) {
            return function composerQueryValidator(req, res, next) {
                var scope = req.expressComposerScopeCache.get(scopeProvider.key);
                validate(req.query, function (err, result) {
                    scope.setQuery(result);
                    if (err) {
                        err.status = 400;
                        err.statusCode = 400;
                    }
                    next(err);
                });
            };
        },

        validateParam: function (validate, scopeProvider) {
            return function composerParamValidator(req, res, next) {
                var scope = req.expressComposerScopeCache.get(scopeProvider.key);
                validate(req.params, function (err, result) {
                    scope.setParam(result);
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
