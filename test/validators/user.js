/**
 * Created by jhorlin.dearmas on 12/29/2014.
 */
(function(module, joi){
    "use strict";
    module.exports = joi.object({
        username:joi.string().required(),
        password:joi.string().required(),
        accept:joi.boolean().required()
    });
}(module, require('joi')))