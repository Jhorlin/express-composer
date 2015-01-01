/**
 * Created by jhorlin.dearmas on 12/26/2014.
 */
(function (module, exports, joi, handler) {
    "use strict";
    var route = exports = module.exports = {},
        methodSchema = joi.object({
            validator: joi.object({
                validate: joi.func().required()
            }).optional(),
            preHandlers: joi.array().includes(joi.func()).min(1).optional(),
            scope: joi.alternatives().try(joi.object(), joi.func()).optional(),
            handlers: joi.array().includes(joi.func()).min(1),
            errorHandlers: joi.array().includes(joi.func()).optional()
        }),
        routeSchema = joi.object({
            methods: joi.object({
                get: methodSchema,
                put: methodSchema,
                post: methodSchema,
                delete: methodSchema,
                all: methodSchema
            }).xor('get', 'put', 'post', 'delete', 'all'),
            scope: joi.alternatives().try(joi.object(), joi.func()).optional()
        }).unknown().options({stripUnknown: true});

    route.compose = function (scoreArg, scope) {
        var self = this;
        routeSchema.validate(scoreArg, function (err, score) {
            if (err) {
                throw(err);
            }
            var routeScope = scope.child(score.scope);
            Object.keys(score.methods).forEach(function (method) {
                var methodScore = score.methods[method],
                    methodHandlers = [],
                    methodScope = routeScope.child(methodScore.scope);
                if (methodScore.preHandlers) {
                    methodHandlers.push(handler.handle(methodScore.preHandlers, methodScope));
                }
                if (methodScore.validator) {
                    methodHandlers.push(handler.validate(methodScore.validator, methodScope));
                }
                methodHandlers.push(handler.handle(methodScore.handlers, methodScope));
                if (methodScore.errorHandlers) {
                    methodHandlers.push(handler.error(methodScore.errorHandlers, methodScope));
                }
                self[method].apply(self, methodHandlers);
            });
        });
    };
}(module, module.exports, require('joi'), require('./handler')));