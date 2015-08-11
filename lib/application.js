/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */

/**
 * Extension module for an express app
 * ```javascript
 * var app = require('express-composer')();
 * ```
 * @module app
 */
(function (module, exports) {
    'use strict';

    var app = exports = module.exports = {},
        Scope = require('./scope'),
        handler = require('./handler'),
        schemas = require('./schemas'),
        vhost = require('vhost');


    /**
     * Reads through the score and implements its configuratin onto the app.
     * @example
     * ```javascript
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
     *              },
     *              path:'/scopeMessage',
     *              methods:{
     *                  get:{
     *                      handlers: function(req, res){
     *                          res.send(this.message);
     *                      }
     *                  }
     *              }
     *           }]
     *          }]
     *     }
     * app.conduct(score, {message:'scoped message'});
     * ```
     * @param {Score} scoreArg - the config object used to build up the app
     * @param {Scope} [parentScope] - optional parent scope
     * @alias module:app
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
                    if (score.properties.hasOwnProperty(key)) {
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
                    var router = new conductor.Router(routerScore.options);
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
}(module, module.exports));
