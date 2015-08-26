/**
 * Created by jhorlin.dearmas on 8/25/15.
 */
(function (module) {
    'use strict';
    var Joi = require('joi');
    var schema = Joi.object({
        value: Joi.number().required()
    });
    module.exports = schema.validate.bind(schema);
}(module))