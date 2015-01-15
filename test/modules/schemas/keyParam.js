/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
(function (module, expressComposer) {
    "use strict";
    var Validator = expressComposer.Validator;
    module.exports = Validator.object({
        key: Validator.string().required()
    });
}(module, require('../../../index')))