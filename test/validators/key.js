/**
 * Created by jhorlin.dearmas on 4/21/2015.
 */
(function(module, joi){
    "use strict";
    module.exports = joi.object({
        key:joi.string().required()
    });
}(module, require('joi')))