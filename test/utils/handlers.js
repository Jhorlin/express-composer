/**
 * Created by jhorlin.dearmas on 12/29/2014.
 */
(function (module, q) {
    "use strict";

    function createHandlerTypes(handler) {
        return {
            standard: handler,
            promise: function (req, res) {
                handler.call(this, req, res);
                return q.when();
            },
            callback: function (req, res, next) {
                handler.call(this, req, res);
                next();
            }
        };
    }

    function createErrorHandlerTypes(handler) {
        return {
            standard: handler,
            promise: function (err, req, res) {
                handler.call(this, err, req, res);
                return q.when();
            },
            callback: function (err, req, res, next) {
                handler.call(this, err, req, res);
                next();
            }
        };
    }

    module.exports = {
        log: function (message) {
            var handler = function (req, res) {
                console.log(message);
            };
            return createHandlerTypes(handler);
        },
        setScope: function (property, value) {
            var handler = function (req, res) {
                var self = this;
                q.when(typeof value === 'function' ? value() : value).then(function () {
                    var properties = property.split('.'),
                        lastIndex = properties.length - 1,
                        object = this;
                    properties.split('.').forEach(function (property, index) {
                        if (index === lastIndex) {
                            object[property] = value;
                        } else {
                            object = object[property];
                        }
                    });
                });
            };
            return createHandlerTypes(handler);
        },
        respond: function (message) {
            var handler = function (req, res) {
                res.send(message);
            };
            return createHandlerTypes(handler);
        },
        respondScope: function (property) {
            var handler = function (req, res) {
                var properties = property.split('.'),
                    object = this;
                properties.split('.').forEach(function (property) {
                    object = object[property];
                });
                res.send(object);
            };
            return createHandlerTypes(handler);
        },
        throwError: function (message) {
            var handler = function (req, res) {
                throw new Error(message);
            };
            return createHandlerTypes(handler);
        },
        error: function () {
            var handler = function (err, req, res) {
                res.status(req.status).send(err.message);
            };
            return createErrorHandlerTypes(handler);
        }
    };
}(module, require('q')))