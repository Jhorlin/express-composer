/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function (module, exports, Scope, composer) {
    "use strict";


    var app = exports = module.exports = {};

    /**
     * Composes the express application and returns the app
     * @example
     * var app = require('express-composer')(),
     *     score = {
     *          routers:[{
     *           path:'/app',
     *           routes:[{
     *              path:'/resource',
     *              methods:{
     *                  get:{
     *                        handlers:[function(req, res){
     *                              res.send('Hello World');
     *                          }]
     *                  }
     *              }
     *           }]
     *          }]
     *     }
     * app.conduct(score);
     *
     * @param {object} scoreArg - the config object used to conduct the app
     * @param {Scope} [parentScope] - optional parent scope
     * @returns {app}
     */
    app.conduct = function (scoreArg, parentScope) {
        var self = this,
        //since conductor depends on this module and this module depends on conductor the require has to be in
        //this function
        //TODO: stop the circular dependency in order to remove the require from this function
            conductor = require('./conductor');
        composer.schemas.score.app.validate(scoreArg, function (err, score) {
            if (err) {
                throw err;
            }
            //TODO: set up optional parent scope
            var scope = parentScope ? parentScope.child(score.scope) : new Scope(score.scope);
            score.routers.forEach(function (score) {
                var router = new conductor.Router(score.options, scope);
                router.conduct(score, scope);
                self.use(score.path, router);
            });
        });
        return self;
    };
}(module, module.exports, require('./scope'), require('./composer')));