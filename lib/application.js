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
        ScopeProvider = require('./scopeProvider'),
        handler = require('./handler'),
        schema = require('./schema'),
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
     * @param {ScopeProvider} [parentScopeProvider] - optional parent scopeProvider
     * @alias module:app
     * @returns {app}
     */
    app.conduct = function (scoreArg, parentScopeProvider) {
        var self = this,
            conductor = require('./conductor'),
            expressComposer = require('../index');

        schema.score.app.validate(scoreArg, function (err, score) {
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


            var scopeProvider = new ScopeProvider(score.scope, parentScopeProvider);

            //We want a clean scope
            self.use(handler.dispose(scopeProvider));

            if (score.preHandlers) {
                self.use(handler.handle(score.preHandlers, scopeProvider));
            }

            if(score.routers){
                (score.routers instanceof Array ? score.routers : [score.routers]).forEach(function (routerScore) {
                    var router = new conductor.Router(routerScore.options);
                    router.conduct(routerScore, scopeProvider);
                    self.use(routerScore.path, router);
                });
            }

            if (score.apps) {
                (score.apps instanceof Array ? score.apps : [score.apps]).forEach(function (appScore) {
                    var app = expressComposer(appScore.options);
                    app.conduct(appScore, scopeProvider);
                    //its difficult to validate recursively with joi so just handle the edge cases here
                    self.use(appScore.path || '/', appScore.vhost ? vhost(appScore.vhost, app) : app);
                });
            }

            if (score.errorHandlers) {
                if (score.errorHandlers) {
                    self.use(handler.error(score.errorHandlers, scopeProvider));
                }
            }
        });
        return self;
    };
}(module, module.exports));
