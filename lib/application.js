/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function (module, exports, Scope, handler, schemas) {
    'use strict';

    var app = exports = module.exports = {},
        vhost = require('vhost');


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
            conductor = require('./conductor'),
            expressComposer = require('../index');

        schemas.score.app.validate(scoreArg, function (err, score) {
            if (err) {
                throw err;
            }

            if (score.properties) {
                for (var key in score.properties) {
                    if (score.property.hasOwnProperty(key)) {
                        self.set(key, score.properties[key]);
                    }
                }
            }

            //TODO: set up optional parent scope
            var scope = parentScope ? parentScope.new(score.scope) : new Scope(score.scope);

            //cleanup on response
            self.use(handler.destroy(scope));

            if (score.preHandlers) {
                self.use(handler.handle(score.preHandlers, scope));
            }

            if(score.routers){
                (score.routers instanceof Array ? score.routers : [score.routers]).forEach(function (routerScore) {
                    var router = new conductor.Router(routerScore.options, scope);
                    router.conduct(routerScore, scope);
                    self.use(routerScore.path, router);
                });
            }

            if (score.apps) {
                (score.apps instanceof Array ? score.apps : [score.apps]).forEach(function (appScore) {
                    var app = expressComposer(appScore.options);
                    app.conduct(appScore, scope);
                    //its difficult to validate recursively with joi so just handle the edge cases here
                    self.use(appScore.path || '/', appScore.vhost ? vhost(appScore.vhost, app) : app);
                });
            }

            if (score.errorHandlers) {
                if (score.errorHandlers) {
                    self.use(handler.error(score.errorHandlers, scope));
                }
            }
        });
        return self;
    };
}(module, module.exports, require('./scope'), require('./handler'), require('./schemas')));
