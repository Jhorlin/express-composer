/**
 * Created by jhorlin.dearmas on 12/28/2014.
 */

/**
 * @example
 * ```javascript
 * Scope = require('express-Composer).ScopeFactory
 * ```
 * @module ScopeFactory
 */
(function (module, require) {
    "use strict";
    var extend = require('extend'),
        Promise = require('bluebird');
    module.exports = ScopeFactory;

    /**
     *
     * @param scopeProperties
     * @constructor
     */
    function ScopeFactory (scopeProperties, parentScopeProvider) {
        var scopePropertiesPromise = new Promise(function (resolve) {
                resolve(typeof scopeProperties === 'function' ? scopeProperties() : scopeProperties);
            }),
            scope;
            //create a scope
            function create () {
                return scopePropertiesPromise
                    .then(function (result) {
                        return parentScopeProvider ?
                            parentScopeProvider.scope.then(function(scope){
                                return scope.new(result);
                            })
                            :
                            new Scope(result);
                    })
            }

        this.dispose = function(){
            scope = null;
        };

        Object.defineProperty(this, 'scope', {
            get: function(){
                return scope ? scope : scope = create();
            }
        })
    }

    /**
     * Creates an instance of a scope
     * @param {object | function } arg - argument to create a scope
     * @returns {Scope}
     * @alias module:Scope
     * @constructor
     */
    function Scope (arg) {
        if (!(this instanceof Scope)) {
            return new Scope(arg);
        }
        var self = this,
            results = {},
            errors = {},
            request = {};

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
         * Sets the request object properties into the scope
         * @param {object} validatedRequest - a validated request object
         */
        this.setRequest = function (validatedRequest) {
            extend(request, validatedRequest);
        };

        Object.defineProperty(this, 'results', {
            value: results
        });

        Object.defineProperty(this, 'errors', {
            value: errors
        });

        Object.defineProperty(this, 'request', {
            //value: request
            get: function () {
                return request;
            }
        });
    }

    Scope.prototype.new = function (arg) {
        if (!this.hasOwnProperty('_new')) {
            this._new = function (arg, parent) {
                var self = this,
                    results = Object.create(parent.results),
                    errors = Object.create(parent.errors),
                    request = Object.create(parent.request);

                extend(self, arg);

                this.addResult = function (name, result) {
                    results[name] = result;
                };

                this.addError = function (name, error) {
                    errors[name] = error;
                };

                this.setRequest = function (validatedRequest) {
                    extend(request, validatedRequest);
                };

                Object.defineProperty(this, 'results', {
                    value: results
                });

                Object.defineProperty(this, 'errors', {
                    value: errors
                });

                Object.defineProperty(this, 'request', {
                    // value: request
                    get: function () {
                        return request;
                    }
                });

                Object.defineProperty(this, 'parent', {
                    value: parent
                });
            }
            this._new.prototype = this;
        }
        return new this._new(arg, this);
    };

}(module, require));
