/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function(expressComposer, should, Scope){
    describe("test composer mixin", function(){
        describe("test the composer app mixin", function(){
            it("should require an instance of express app with", function(){
                var app = expressComposer();
                should.exist(app);
            });
        });

        describe("test mixin compose methods", function(){
           var app;
           before(function(){
              app = expressComposer();
           });

            it("app should contain a conduct method", function(){
                should(app.conduct).be.a.Function;
            });

            it("Router should contain a conduct method", function(){
               var router = new expressComposer.Router();
                should.exist(router);
                should(router.conduct).be.a.Function;
            });

            it("Route should contain a conduct method", function(){
                var router = new expressComposer.Router(),
                    route = router.route('/');
                should.exist(route);
                should(route.conduct).be.a.Function;
            });

            it("expressComposer should contain a Scope class", function(){
                should.exist(expressComposer.Scope);
            });
        });

    });


}(require('./../index'), require('should'), require('./scope')));