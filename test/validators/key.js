/**
 * Created by jhorlin.dearmas on 4/21/2015.
 */
(function(module){
    "use strict";
    var joi = require('joi');
    var schema = joi.object({
        key:joi.string().required()
    })
    module.exports = schema.validate.bind(schema);
}(module))