/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function(expressComposer, should){
    describe("test composer app", function(){
        describe("test the composer app", function(){
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
            it("app should contain a compose method", function(){
                should(app.compose).be.a.Function;
            });
            it("Router should contain a compose method", function(){
               var router = new expressComposer.Router();
                should.exist(router);
                should(router.compose).be.a.Function;
            });
            it("Route should contain a compose method", function(){
                var router = new expressComposer.Router(),
                    route = router.route('/');
                should.exist(route);
                should(route.compose).be.a.Function;
            });
        });

    });


}(require('./../index'), require('should')));