/**
 * Created by jhorlin.dearmas on 12/28/2014.
 */

/**
 * @example
 * ```javascript
 * scopeProvider = require('express-Composer).Scope
 * ```
 * @module scopeProvider
 */
(function (module, require) {
    "use strict";
    var extend = require('extend'),
        uuid = require('node-uuid'),
        Promise = require('bluebird');

    module.exports = ScopeProvider;

    /**
     * Factory class that generates a new scope per request
     * @param {Object} scopeProperties - the properties used when creating a scope
     * @param {Scope} [parentScopeProvider] - an optional parent scope to extend from
     * @alis module:scopeProvider
     * @constructor
     */
    function ScopeProvider (scopeProperties, parentScopeProvider) {
        if (!(this instanceof ScopeProvider)) {
            return new ScopeProvider(scopeProperties, parentScopeProvider);
        }
        var scopePropertiesPromise = new Promise(function (resolve) {
                resolve(typeof scopeProperties === 'function' ? scopeProperties() : scopeProperties);
            }),
            self = this;

        this.key = uuid.v4();

        /**
         * middleware used to initialize the provider
         * @method init
         * @param req
         * @param res
         * @param next
         */
        this.init = function (req, res, next) {
            var cacheStore = getCacheStore(req),
                parentScope;
            if(parentScopeProvider){
                parentScope = cacheStore.get(parentScopeProvider.key);
            }
            scopePropertiesPromise.then(function (result) {
                cacheStore.set(self.key, parentScope ? parentScope.new(result) : new Scope(result));
                next();
            }, next);
        }
    }

    function getCacheStore (req) {
        return req.expressComposerScopeCache ? req.expressComposerScopeCache : req.expressComposerScopeCache = new Cache();
    }

    /**
     * Scope object used during handler execution
     * @param {Object} arg
     * @constructor
     */
    function Scope (arg) {
        //this class is not exposed but if we ever do comment out the guard
        //if (!(this instanceof Scope)) {
        //    return new Scope(arg);
        //}
        var self = this,
            results = {},
            errors = {},
            body = {},
            param = {},
            query = {};

        extend(self, arg);

        /**
         * Adds a result to the scope
         * @param {string} name
         * @param result
         */
        this.addResult = function (name, result) {
            results[name] = result;
        };

        /**
         * Adds an error to the scope
         * @param name
         * @param error
         */
        this.addError = function (name, error) {
            errors[name] = error;
        };

        /**
         * Sets the body object properties into the scope
         * @param {object} validatedRequest - a validated body object
         */
        this.setBody = function (validatedBody) {
            extend(body, validatedBody);
        };

        this.setQuery = function(validatedQuery){
            extend(query, validatedQuery);
        };

        this.setParam = function(validatedParam){
            extend(param, validatedParam);
        };

        /**
         * @property {Object} results - exposes the results of named handlers
         */
        Object.defineProperty(this, 'results', {
            value: results
        });

        /**
         * @property {Object} errors - exposes the errors of named handlers
         */
        Object.defineProperty(this, 'errors', {
            value: errors
        });

        /**
         * @Property {object} body - exposes a body object
         */
        Object.defineProperty(this, 'body', {
            value: body
        });

        Object.defineProperty(this, 'query', {
            value: query
        });

        Object.defineProperty(this, 'param', {
            value: param
        });
    }

    /**
     *
     * @param {Object} arg - extend argument properties onto the scope
     * @returns {Scope}
     */
    Scope.prototype.new = function (arg) {
        if (!this.hasOwnProperty('_new')) {
            this._new = function (arg, parent) {
                var self = this,
                    results = Object.create(parent.results),
                    errors = Object.create(parent.errors),
                    body = Object.create(parent.body),
                    param = Object.create(parent.param),
                    query = Object.create(parent.query);

                extend(self, arg);

                this.addResult = function (name, result) {
                    results[name] = result;
                };

                this.addError = function (name, error) {
                    errors[name] = error;
                };

                this.setBody = function (validatedBody) {
                    extend(body, validatedBody);
                };

                this.setQuery = function (validatedQuery) {
                    extend(query, validatedQuery);
                };

                this.setParam = function (validatedQuery) {
                    extend(param, validatedQuery);
                };

                Object.defineProperty(this, 'results', {
                    value: results
                });

                Object.defineProperty(this, 'errors', {
                    value: errors
                });

                Object.defineProperty(this, 'body', {
                    value: body
                });

                Object.defineProperty(this, 'query', {
                    value: query
                });

                Object.defineProperty(this, 'param', {
                    value: param
                });

                Object.defineProperty(this, 'parent', {
                    value: parent
                });
            };
            this._new.prototype = this;
        }
        return new this._new(arg, this);
    };

    function Cache () {
        var cache = {};
        this.set = function (key, item) {
            cache[key] = item;
        };

        this.get = function (key) {
            return cache[key]
        };
    }

}(module, require));
