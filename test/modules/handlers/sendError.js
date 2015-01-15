/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
(function(module){
    "use strict";
    module.exports = function(err, req, res){
        res.status(501).send(err.message);
    };
}(module))