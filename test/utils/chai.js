/**
 * Created by jhorlin.dearmas on 3/7/2015.
 */
(function(module, require){
    "use strict";
    var chai = require('chai'),
        plugins = ['chai-as-promised'];
    plugins.forEach(function(plugin){
        chai.use(require(plugin));
    });
    module.exports = chai;
}(module, require))