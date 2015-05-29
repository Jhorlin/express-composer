/**
 * Created by jhorlin.dearmas on 12/29/2014.
 */
(function (module) {
    "use strict";
    var Promise = require('bluebird');

    function createHandlerTypes(handler, delay) {
        var handlers = {
            standard: handler,
            promise: function (req, res) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        try {
                            resolve(handler.call(self, req, res));
                        } catch (err) {
                            reject(err);
                        }

                    }, delay || 0);
                });
            },
            callback: function (req, res, next) {
                setTimeout(function () {
                    try {
                        handler.call(this, req, res);
                        next();
                    } catch (err) {
                        next(err);
                    }

                    next();
                }.bind(this), delay || 0);
            }
        }

        return handlers;
    }

    function createErrorHandlerTypes(handler, delay) {
        return {
            standard: handler,
            promise: function (err, req, res) {
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve(handler.call(this, err, req, res));
                    }.bind(this), delay || 0);
                });
            },
            callback: function (err, req, res, next) {
                setTimeout(function () {
                    handler.call(this, err, req, res);
                    next();
                }.bind(this), delay || 0);
            }
        };
    }

    module.exports = {
        log: function (message) {
            var handler = function log(req, res) {
                console.log(message);
            };
            return createHandlerTypes(handler);
        },
        setScope: function (property, value) {
            var handler = function setScope(req, res) {
                var self = this;
                return Promise.resolve(typeof value === 'function' ? value() : value).then(function () {
                    var properties = property.split('.'),
                        lastIndex = properties.length - 1,
                        object = self;
                    properties.forEach(function (property, index) {
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
        pushScope: function (property, value, delay) {
            var handler = function pushScope(req, res) {
                var self = this;
                q.when(typeof value === 'function' ? value() : value).then(function () {
                    var properties = property.split('.'),
                        lastIndex = properties.length - 1,
                        object = self;
                    properties.forEach(function (property, index) {
                        if (index === lastIndex) {
                            object[property].push(value);
                        } else {
                            object = object[property];
                        }
                    });
                });
            };
            return createHandlerTypes(handler, delay);
        },
        respond: function (message) {
            var handler = function response(req, res) {
                res.send(message);
            };
            return createHandlerTypes(handler);
        },
        respondScope: function (property) {
            var handler = function respondScope(req, res) {
                var properties = property.split('.'),
                    object = this;
                properties.forEach(function (property) {
                    object = object[property];
                });
                res.send(object);
            };
            return createHandlerTypes(handler);
        },
        respondScopeJson: function (property, delay) {
            var handler = function respondScopeJson(req, res) {
                var properties = property.split('.'),
                    object = this;
                properties.forEach(function (property) {
                    object = object[property];
                });
                res.json(object);
            };
            return createHandlerTypes(handler, delay);
        },
        throwError: function (message) {
            var handler = function throwError(req, res) {
                throw new Error(message);
            };
            return createHandlerTypes(handler);
        },
        error: function () {
            var handler = function error(err, req, res) {
                res.status(501).send(err.message);
            };
            return createErrorHandlerTypes(handler);
        }
    };
}(module))