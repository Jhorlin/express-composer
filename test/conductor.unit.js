/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function(expressComposer){
    var chai = require('chai'),
        expect = chai.expect;
    describe("test conductor mixin", function(){
        describe("test the conductor app mixin", function(){
            it("should require an instance of express app with", function(){
                var app = expressComposer();
                expect(app).to.be.ok;
            });
        });

        describe("test mixin compose methods", function(){
           var app;
           before(function(){
              app = expressComposer();
           });

            it("app should contain a conduct method", function(){
                expect(app.conduct).to.be.an.instanceOf(Function);
            });

            it("Router should contain a conduct method", function(){
               var router = new expressComposer.Router();
                expect(router).to.be.ok;
                expect(router.conduct).to.be.an.instanceOf(Function);
            });

            it("Route should contain a conduct method", function(){
                var router = new expressComposer.Router(),
                    route = router.route('/');
                expect(route).to.be.ok;
                expect(route.conduct).to.be.an.instanceOf(Function)
            });

            it("expressComposer should contain a Scope class", function(){
                expect(expressComposer.Scope).to.be.ok;
            });

            it("expressComposer should contain a Validator class", function(){
                expect(expressComposer.Validator).to.be.ok;
            });

            it("expressComposer should contain a composer function", function(){
                expect(expressComposer.composer).to.be.ok;
            });
        });

    });


}(require('./../index')));