/**
 * Created by jhorlin.dearmas on 3/7/2015.
 */
(function (context, module, require) {
    "use strict";
    var chai = require('chai'),
        Promise = require('bluebird'),
        plugins = ['chai-as-promised', 'chai-http'];
    plugins.forEach(function (plugin) {
        chai.use(require(plugin));
        if (plugin === 'chai-http') {
            chai.request.addPromises(Promise);
        }
    });
    module.exports = chai;
}(this, module, require))