/**
 * Created by jhorlin.dearmas on 12/29/2014.
 */
(function (module, require) {
    'use strict';
    var Promise = require('bluebird');
    module.exports = {
        /**
         * Creates an express middle ware handler that will iterate through composers handlers
         * @param {Function[]} handlers
         * @param {Scope} scope
         * @returns {Function}
         */
        handle: function composerHandler (handlers, scope) {
            handlers = handlers instanceof Array ? handlers : [handlers];
            return function (req, res, next) {
                scope.ready.then(function (scope) {
                    return handlers.reduce(function (promise, handler) {
                        return promise.then(function () {
                            if (!res.headersSent) {
                                return handler.length === 2 ?
                                    handler.name ?
                                        Promise.resolve(handler.call(scope, req, res))
                                            .then(function (result) {
                                                scope.addResult(handler.name, result);
                                            })
                                        :
                                        Promise.resolve(handler.call(scope, req, res))
                                    :
                                    Promise.promisify(handler).call(scope, req, res);
                            }
                        });
                    }, Promise.resolve())
                        .done(function () {
                            if (!res.headersSent) {
                                next();
                            }
                        }, next);
                }, next);
            };
        },
        /**
         * Creates an express middle ware error handler that will iterate through composers error handlers
         * @param {Function[]} handlers
         * @param {Scope} scope
         * @returns {Function}
         */
        error: function composerErrorHandler (handlers, scope) {
            handlers = handlers instanceof Array ? handlers : [handlers];
            return function (err, req, res, next) {
                scope.ready.then(function (scope) {
                    return handlers.reduce(function (promise, handler) {
                        return promise.then(function () {
                            if (!res.headersSent) {
                                return handler.length === 3 ?
                                    handler.name ?
                                        Promise.resolve(handler.call(scope, err, req, res))
                                            .then(function (result) {
                                                scope.addError(handler.name, result);
                                            })
                                        :
                                        Promise.resolve(handler.call(scope, err, req, res))
                                    :
                                    Promise.promisify(handler).call(scope, err, req, res);
                            }
                        });
                    }, Promise.resolve())
                        .done(function () {
                            if (!res.headersSent) {
                                next(err);
                            }
                        }, next);
                }, next);
            };
        },
        /**
         * Create an express middle ware that validates an incoming request
         * @param {object} schema
         * @param {Scope} scope
         * @returns {Function}
         */
        validate: function composerValidator (schema, scope) {
            return function (req, res, next) {
                schema.validate(req.body || req.query, function (err, request) {
                    scope.request = request;
                    if (err) {
                        err.status = 400;
                    }
                    next(err);
                });
            };
        }
    };
}(module, require));
