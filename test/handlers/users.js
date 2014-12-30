/**
 * Created by jhorlin.dearmas on 12/29/2014.
 */
(function(module, q){
    "use strict";
    module.exports = function(req, res){
        var deferred = q.defer();
        setTimeout(function(){
            res.status(200).send();
        },1000);
        return q.promise;
    };
}(module, require('q')))