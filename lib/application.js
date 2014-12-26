/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function(module, exports, joi){
    var app = exports = module.exports = {},
        routerSchema = joi.object({
            preHandlers: joi.array().includes(joi.func()).optional(),
            routes:joi.array(),
            postHandlers: joi.array().includes(joi.func()).optional(),
            errorHandlers: joi.array().includes(joi.func()).optional(),
            scope:  joi.alternatives().try(joi.object(), joi.func()).optional(),
            path: joi.string().default('/'),
            routers: joi.object(),
            options:joi.object()
        }).unknown().options({stripUnknown :false}),
        scoresSchema = joi.array().min(1);

    app.compose = function(pathArg, scoreArg){
        var path = '/',
            score;
        if(typeof path === 'string'){
            path = pathArg;
            score = scoreArg;
        } else {
            score = pathArg;
        }
        scoresSchema.validate(score instanceof Array ? score : [score], function(err, scores){
            if(err){
                throw err;
            }
           // var appRouter = this._router;
            scores.forEach(function(score){
                var router = new app.Router(score.options);
                router.compose(score);
                app.use(score.path, router);
            });
        });
    };
}(module, module.exports, require('joi')));