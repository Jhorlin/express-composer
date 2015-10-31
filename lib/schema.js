/**
 * Created by jhorlin.dearmas on 1/19/2015.
 */
(function (module) {
    'use strict';

    var joi = require('joi'),
        methods = require('methods'),
        /**
         * @typedef {(Object | Function | Promise<Object>)} scopeArg
         */
        scopeSchema = joi.alternatives().try(joi.object(), joi.func()).optional(),
        scopeJsonSchema = joi.string().optional(),
        validatorSchema = joi.alternatives().try(joi.func(), joi.object({
            body: joi.func(),
            query: joi.func(),
            param: joi.func()
        }).or('body', 'query', 'param')),
        validatorJsonSchema = joi.alternatives().try(joi.string(), joi.object({
            body: joi.string(),
            query: joi.string(),
            param: joi.string()
        }).or('body', 'query', 'param')),
        /**
         * @typedef {(Function | Function[])} requestHandlers
         */
        handlersSchema = joi.alternatives().try(joi.func(), joi.array().items(joi.func()).min(1)),
        handlersJsonSchema = joi.alternatives().try(joi.string(), joi.array().items(joi.string()).min(1)),
        /**
         * @typedef {String} pathArg
         */
        pathSchema = joi.string().default('/').optional(),
        /**
         * Express application options passed into [express](http://expressjs.com/api.html)
         * @typedef {Object} appOptions
         * @property {String} [dotFiles] - Option for serving dotfiles. Possible values are 'allow', 'deny', and 'ignore'
         * @property {Boolean} [etag] - Enable or disable etag generation
         * @property {Boolean} [extentions] - Sets file extension fallbacks.
         * @property {Object | String} [index] - Sends directory index file. Set false to disable directory indexing.
         * @property {Boolean} [lastModified] - Set the Last-Modified header to the last modified date of the file on the OS. Possible values are true or false.
         * @property {Boolean} [maxAge] - Set the max-age property of the Cache-Control header in milliseconds or a string in ms format
         * @property {Number} [redirect] - Redirect to trailing when the pathname is a directory.
         * @property {Function} [setHeaders] - Function for setting HTTP headers to serve with the file.
         */
        appOptionsSchema = joi.object({
            dotFiles: joi.string().optional(),
            etag: joi.boolean().optional(),
            extentions: joi.boolean().optional(),
            index: joi.alternatives().try(joi.boolean(), joi.string()).optional(),
            lastModified: joi.boolean().optional(),
            maxAge: joi.number().optional(),
            redirect: joi.boolean().optional(),
            setHeaders: joi.func().optional()
        }),
        /**
         * Options passed into express [Router]{http://expressjs.com/api.html#router}
         * @typedef {Object} routerOptions
         * @property {Boolean} caseSensitive - Enable case sensitivity.
         * @property {Boolean} mergeParams - Preserve the req.params values from the parent router. If the parent and the child have conflicting param names, the child's value take precedence.
         * @property {Boolean} strict - Enable strict routing.
         */
        routerOptionsSchema = joi.object().keys({
            caseSensitive: joi.boolean().optional(),
            mergeParams: joi.boolean().default(true).optional(),
            strict: joi.boolean().optional()
        }),
        /**
         * @typedef {Object} requestMethod
         * @property {function} validator - function used to validate the request
         * @property {requestHandlers} preHandlers - handlers that will be called during execution of the route
         * @property {scopeArg} scope - scope values to inject into the context of the handlers
         * @property {requestHandlers} errorHandlers - handlers called if there is an error during the request
         * @property {String} name - name of the method
         * @property {String} description - description about what this method does
         */
        methodSchema = joi.object({
            validator: validatorSchema.optional(),
            scope: joi.alternatives().try(joi.object(), joi.func()).optional(),
            handlers: handlersSchema,
            errorHandlers: handlersSchema.optional(),
            name: joi.string().optional(),
            description: joi.string().optional()
        }),
        methodJsonSchema = joi.object({
            validator: validatorJsonSchema.optional(),
            scope: joi.string().optional(),
            handlers: handlersJsonSchema,
            errorHandlers: handlersJsonSchema.optional(),
            name: joi.string().optional(),
            description: joi.string().optional()
        }),
        /**
         * @typedef {Object} requestMethods
         * @property {requestMethod | requestHandlers} checkout - handles checkout requests
         * @property {requestMethod | requestHandlers} connect - handles connect requests
         * @property {requestMethod | requestHandlers} copy - handles copy requests
         * @property {requestMethod | requestHandlers} delete - handles delete requests
         * @property {requestMethod | requestHandlers} get - handles get requests
         * @property {requestMethod | requestHandlers} head - handles head requests
         * @property {requestMethod | requestHandlers} lock - handles lock requests
         * @property {requestMethod | requestHandlers} m-search - handles m-search requests
         * @property {requestMethod | requestHandlers} merge - handles merge requests
         * @property {requestMethod | requestHandlers} mkactivity - handles mkactivity requests
         * @property {requestMethod | requestHandlers} mkcol - handles mkcol requests
         * @property {requestMethod | requestHandlers} move - handles move requests
         * @property {requestMethod | requestHandlers} notify - handles notify requests
         * @property {requestMethod | requestHandlers} options - handles options requests
         * @property {requestMethod | requestHandlers} patch - handles patch requests
         * @property {requestMethod | requestHandlers} post - handles post requests
         * @property {requestMethod | requestHandlers} propfind - handles propfind requests
         * @property {requestMethod | requestHandlers} proppatch - handles proppatch requests
         * @property {requestMethod | requestHandlers} purge - handles purge requests
         * @property {requestMethod | requestHandlers} put - handles put requests
         * @property {requestMethod | requestHandlers} report - handles report requests
         * @property {requestMethod | requestHandlers} search - handles search requests
         * @property {requestMethod | requestHandlers} subscribe - handles subscribe requests
         * @property {requestMethod | requestHandlers} trace - handles trace requests
         * @property {requestMethod | requestHandlers} unlock - handles unlock requests
         * @property {requestMethod | requestHandlers} unsubscribe - handles unsubscribe requests
         */
        methodsSchemaObject = {},
        methodsJsonSchemaObject = {};
    methods.forEach(function (method) {
        methodsSchemaObject[method] = joi.alternatives().try(methodSchema, handlersSchema);
        methodsJsonSchemaObject[method] = joi.alternatives().try(methodJsonSchema, handlersJsonSchema);
    });
    var methodsSchema = joi.object(methodsSchemaObject),
        methodsJsonSchema = joi.object(methodsJsonSchemaObject);

    /**
     * @typedef {Object} routeScore
     * @property {requestMethods} methods - methods for this route
     * @property {requestHandlers} preHandlers - handlers that are executed before a route method
     * @property {requestHandlers} errorHandlers - handlers for errors within this route
     * @property {scopeArg} scope - scope argument for this route
     * @property {String} name - the name of the route
     * @property {String} description - a description of the route
     * @property {pathArg} path - the path for the route
     */
    var routeSchema = joi.object({
            methods: methodsSchema,
            preHandlers: handlersSchema,
            errorHandlers: handlersSchema,
            scope: scopeSchema,
            name: joi.string().optional(),
            description: joi.string().optional(),
            path: pathSchema
        }),
        routeJsonSchema = joi.object({
            methods: methodsJsonSchema,
            preHandlers: handlersJsonSchema,
            errorHandlers: handlersJsonSchema,
            scope: scopeJsonSchema,
            name: joi.string().optional(),
            description: joi.string().optional(),
            path: pathSchema
        }),
        /**
         * @typedef {Object} routerScore
         * @property {requestHandlers} preHandlers - handlers that are executed during this route
         * @property {routeScore | routeScore[]} routes - routes for this router
         * @property {requestHandlers} errorHandlers - handles errors tha occurred in this route
         * @property {scopeArg} scope - scope options to include in this scope
         * @property {routerScore} routers - nested routers
         * @property {String} name - name of this route
         * @property {String} description - a description of this route
         * @property {pathArg} path - the path to this route
         * @property {routerOptions} - options for the router
         */
        routerSchema = joi.object({
            preHandlers: handlersSchema.optional(),
            routes: joi.alternatives().try(routeSchema, joi.array().items(routeSchema).min(1).required()),
            errorHandlers: handlersSchema.optional(),
            scope: joi.alternatives().try(joi.object(), joi.func()).optional(),
            routers: joi.alternatives().try(joi.object(), joi.array().min(1)).optional(),
            name: joi.string().optional(),
            description: joi.string().optional(),
            path: pathSchema,
            options: routerOptionsSchema.default({
                mergeParams: true
            }).optional()
        }),
        routerJsonSchema = joi.object({
            preHandlers: handlersJsonSchema.optional(),
            routes: joi.alternatives().try(routeJsonSchema, joi.array().items(routeJsonSchema).min(1).required()),
            errorHandlers: handlersJsonSchema.optional(),
            scope: scopeJsonSchema,
            routers: joi.alternatives().try(joi.object(), joi.array().min(1)).optional(),
            name: joi.string().optional(),
            path: pathSchema,
            options: routerOptionsSchema.default({
                mergeParams: true
            }).optional(),
            description: joi.string().optional(),
        }),
        /**
         * @typedef {Object} appScore
         * @property {requestHandlers} preHandlers - handlers that are executed for this app
         * @property {requestHandlers} errorHandlers - handles errors tha occurred in this route
         * @property {scopeArg} scope - scope options to include in this scope
         * @property {routerScore | routerScore[]} routers - nested routers
         * @property {String} name - name of this route
         * @property {String} description - a description of this route
         * @property {appOptions} - options for the router
         * @property {appScore | appScore[]} - apps for this app
         * @property {pathArg} path - the path for the app
         * @property {String}  vhost - a vhost routing string
         * @property {Object} properties - an object used to [set express options](http://expressjs.com/api.html#app.set)
         */
        appSchema = joi.object({
            preHandlers: handlersSchema.optional(),
            errorHandlers: handlersSchema.optional(),
            routers: joi.alternatives().try(routerSchema, joi.array().items(routerSchema).min(1)),
            scope: scopeSchema,
            name: joi.string().optional(),
            description: joi.string().optional(),
            options: appOptionsSchema.optional(),
            path: pathSchema,
            apps: joi.alternatives().try(joi.object(), joi.array().items(joi.object()).min(1)),
            vhost: joi.string(),
            properties: joi.object().optional()
        }),
        appJsonSchema = joi.object({
            preHandlers: handlersJsonSchema.optional(),
            errorHandlers: handlersJsonSchema.optional(),
            routers: joi.alternatives().try(routerJsonSchema, joi.array().items(routerJsonSchema).min(1)),
            scope: scopeJsonSchema,
            name: joi.string().optional(),
            description: joi.string().optional(),
            options: appOptionsSchema.optional(),
            path: pathSchema,
            apps: joi.alternatives().try(joi.object(), joi.array().items(joi.object()).min(1)),
            vhost: joi.string(),
            properties: joi.object().optional()
        }),
        schemas = {
            composer: {
                app: appJsonSchema.required(),
                router: routerJsonSchema.required(),
                route: routeJsonSchema.required()
            },
            score: {
                app: appSchema.required(),
                router: routerSchema.required(),
                route: routeSchema.required(),
                routerPath: pathSchema,
                routerOptions: routerOptionsSchema
            }
        };

    module.exports = schemas;

}(module));
