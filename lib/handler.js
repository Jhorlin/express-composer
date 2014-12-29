/**
 * Created by jhorlin.dearmas on 12/29/2014.
 */
(function (module, cbQ, q) {
    module.exports = {
        handle: function (handlers, scope) {
            return function (req, res, next) {
                scope.ready(function (scope) {
                    handlers.reduce(function (promise, handler) {
                        return promise.then(function (result) {
                            //if a response has been sent do not call any other handlers
                            if (res.headersSent) {
                                return;
                            }
                            var promise;
                            if (handler.length === 2) {
                                promise = q.when(handler.call(scope, req, res));
                            } else {
                                var cb = cbQ.cb();
                                promise = cb.promise;
                                handler.call(scope, req, res, cb);
                            }
                            return promise;
                        });

                    }, q.when()).then(function () {
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
                            if (res.headersSent) {
                                return;
                            }
                            var promise;
                            if (handler.length === 3) {
                                promise = q.when(handler.call(scope, err, req, res));
                            } else {
                                var cb = cbQ.cb();
                                promise = cb.promise;
                                handler.call(scope, err, req, res, cb);
                            }
                            return promise;
                        });

                    }, q.when()).then(function () {
                        if (res.headersSent) {
                            next(err);
                        }
                    }, next);
                }, next);
            };
        },
        validate: function (schema, scope) {
            return function(req, res, next){
                schema.validate(req.body || req.query, function(err, request){
                    scope.request = request;
                    next(err);
                });
            };
        }
    };
}(module, require('cb-q'), require('q')));