/**
 * Created by jhorlin.dearmas on 12/29/2014.
 */
(function(module, joi){
    "use strict";
    var schema = joi.object({
        username:joi.string().required(),
        password:joi.string().required(),
        accept:joi.boolean().required()
    });
    module.exports = schema.validate.bind(schema);
}(module, require('joi')));