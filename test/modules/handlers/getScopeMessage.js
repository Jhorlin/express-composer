/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
(function(module){
    "use strict";
    module.exports = function(req, res){
      return res.status(200).send(this.message);
    };
}(module))