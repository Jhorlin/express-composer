/**
 * Created by jhorlin.dearmas on 6/24/2015.
 */
(function(module){
    "use strict";
    module.exports = function concatParams(req, res){
        return res.status(200).send([req.params.router, req.params.route].join(' '));
    };
}(module))