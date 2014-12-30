/**
 * Created by jhorlin.dearmas on 12/29/2014.
 */
(function (module, q) {
    module.exports = {
        handle: function (handlers, scope) {
            return function (req, res, next) {
                scope.ready(function (scope) {
                    handlers.reduce(function (promise, handler) {
                        return promise.then(function (result) {
                            //if a response has been sent do not call any other handlers
                            var returnPromise;
                            if (res.headersSent) {
                                returnPromise = promise.done();
                            } else {
                                if (handler.length === 2) {
                                    returnPromise = q.when(handler.call(scope, req, res));
                                } else {
                                    var deferred = q.defer();
                                    returnPromise = deferred.promise;
                                    handler.call(scope, req, res, deferred.makeNodeResolver());
                                }
                            }
                            return returnPromise;
                        });

                    }, q.when()).done(function () {
                        if (!res.headersSent) {
                            next();
                        }
                    }, next);
                }, next);
            };
        },
        error: function (handlers, scope) {
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
                                    returnPromise = q.when(handler.call(scope, err, req, res));
                                } else {
                                    var deferred = q.defer();
                                    returnPromise = deferred.promise;
                                    handler.call(scope, err, req, res, deferred.makeNodeResolver());
                                }
                            }
                            return returnPromise;
                        });
                    }, q.when()).done(function () {
                        if (!res.headersSent) {
                            next();
                        }
                    }, next);
                }, next);
            };
        },
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
}(module, require('q')));