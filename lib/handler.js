/**
 * Created by jhorlin.dearmas on 12/29/2014.
 */

/**
 *
 */
(function (module, require) {
    'use strict';
    var Promise = require('bluebird')
    module.exports = {
        /**
         * Creates an express middle ware handler that will iterate through composers handlers
         * @param {function[] | function} handlers
         * @param {Scope} scope - the scope of these handlers
         * @returns {function}
         */
        handle: function composerHandler (handlers, scope) {
            handlers = handlers instanceof Array ? handlers : [handlers];
            return function (req, res, next) {
                scope.ready.then(function (scope) {
                    return Promise.each(handlers, function (handler) {
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
                    })

                })
                    .done(function () {
                        if (!res.headersSent) {
                            next();
                        }
                    }, next)
            };
        },
        /**
         * Creates an express middle ware error handler that will iterate through composers error handlers
         * @param {function[] | function} handlers
         * @param {Scope} scope - the scope for these handlers
         * @returns {function}
         */
        error: function composerErrorHandler (handlers, scope) {
            handlers = handlers instanceof Array ? handlers : [handlers];
            return function (err, req, res, next) {
                scope.ready.then(function (scope) {
                    return Promise.each(handlers, function (handler) {
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
                    })

                })
                    .done(function () {
                        if (!res.headersSent) {
                            next(err);
                        }
                    }, next)
            };
        },
        /**
         * Create an express middle ware that validates an incoming request
         * @param {function} validate - validation function
         * @param {Scope} scope - scope variable
         * @returns {Function}
         */
        validate: function composerValidator (validate, scope) {
            return function (req, res, next) {
                validate(req.body || req.query, function (err, request) {
                    scope.setRequest(request);
                    if (err) {
                        err.status = 400;
                    }
                    next(err);
                });
            };
        },
        /**
         * Cleans up memory for a scope
         * @param {object} scope - the scope to destroy
         * @returns {Function}
         */
        destroy: function (scope) {
            return function (req, res, next) {
                res.on('finish', scope.destroy.bind(scope));
                res.on('close', scope.destroy.bind(scope));
                next();
            };
        }
    };
}(module, require));
