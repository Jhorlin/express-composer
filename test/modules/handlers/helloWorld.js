/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
(function(module){
    "use strict";
     module.exports = function helloWorld(req, res){
         return res.status(200).send("Hello World!");
     };
}(module))