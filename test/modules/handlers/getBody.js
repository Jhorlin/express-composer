/**
 * Created by jhorlin.dearmas on 8/25/15.
 */
(function(module){
    'use strict';
    module.exports = function(req, res){
        res.status(200).json(this.body);
    }
}(module));