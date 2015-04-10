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
            var promisifiedHandlers = handlers
            return function (req, res, next) {
                scope.ready(function (scope) {
                   return handlers.reduce(function (promise, handler) {
                        return promise.then(function (result) {
                            //if a response has been sent do not call any other handlers
                            var returnPromise;
                            if (res.headersSent) {
                                returnPromise = promise.resolve();
                            } else {
                                if (handler.length === 2) {
                                    returnPromise = Promise.resolve(handler.call(scope, req, res));
                                } else {
                                    returnPromise = Promise.fromNode(handler.bind(scope, req, res));
                                }
                            }
                            return returnPromise;
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
            return function (err, req, res, next) {
                scope.ready(function (scope) {
                    handlers.reduce(function (promise, handler) {
                        return promise.then(function (result) {
                            //if a response has been sent do not call any other handlers
                            var returnPromise;
                            if (res.headersSent) {
                                returnPromise = promise.done();
                            } else {
                                if (handler.length === 3) {
                                    returnPromise = Promise.resolve(handler.call(scope, err, req, res));
                                } else {
                                    return Promise.fromNode(handler.bind(scope, err, req, res));
                                }
                            }
                            return returnPromise;
                        });
                    }, Promise.resolve()).done(function () {
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
        validate: function (schema, scope) {
            return function (req, res, next) {
                schema.validate(req.body || req.query, function (err, request) {
                    scope.request = request;
                    if(err){
                        err.status = 400;
                    }
                    next(err);
                });
            };
        }
    };
}(module, require));