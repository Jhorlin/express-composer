/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
(function(module){
    "use strict";
    module.exports = function setScopeMessage(req, res){
        this.message = "Hello World!";
    };
}(module))