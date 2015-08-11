/**
 * Created by jhorlin.dearmas on 12/25/2014.
 */
(function(require){
    var expressComposer = require('./../index'),
        chai = require('chai'),
        express = require('express'),
        methods = require('methods'),
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


        describe("test mixin compose methods when an app is mixed", function(){
            var app;
            before(function(){
                app = express();
                expressComposer.extend(app)
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

        describe("test application", function(){
            var app;
            before(function(){
                app = expressComposer();
            });

            it("should throw an error with an invalid score", function(){
               expect(app.conduct).to.throw(Error);
            });

            it("should set express values", function(){
                app.conduct({
                   properties:{
                       'set':'me'
                   }
                })
                expect(app.get('set')).to.equal('me')
            })
        });

        describe("test router", function(){
            var router;
            before(function(){
                router = expressComposer.Router();
            });

            it("should throw an error with an invalid score", function(){
                expect(router.conduct).to.throw(Error);
            });

            it("should create a router", function(){
                expect(router.conduct({})).to.be.ok;
            });

            it("should create a nested routes", function(){
                expect(router.conduct({
                 routers:{
                     routers:{
                         routers:{}
                     }
                 }
                })).to.be.ok;
            });

        });

        describe("test route", function(){
            var route;
            before(function(){
                route = expressComposer.Router().route('/');
            });

            it("should throw an error with an invalid score", function(){
                expect(route.conduct).to.throw(Error);
            });

            it("should create a route", function(){
                expect(route.conduct({})).to.be.ok;
            })

            methods.forEach(function(method){
                it("should create a route with method " + method + " with method object", function(){
                    var score = {methods:{}};
                    score.methods[method] = {};
                    expect(route.conduct(score)).to.be.ok;
                })

                it("should create a route with method " + method + " with array", function(){
                    var score = {methods:{}};
                    score.methods[method] = [function(){}];
                    expect(route.conduct(score)).to.be.ok;
                })

                it("should create a route with method " + method + " with function", function(){
                    var score = {methods:{}};
                    score.methods[method] = function(){};
                    expect(route.conduct(score)).to.be.ok;
                })
            })

            it("should create a route with all methods as an object: " + methods.join(','), function(){
                var score = {methods:{}};
                methods.forEach(function(method){
                   score.methods[method] = {};
                });
                expect(route.conduct(score)).to.be.ok;
            });

            it("should create a route with all methods as an array: " + methods.join(','), function(){
                var score = {methods:{}};
                methods.forEach(function(method){
                    score.methods[method] = [function(){}];
                });
                expect(route.conduct(score)).to.be.ok;
            });

            it("should create a route with all methods as a function: " + methods.join(','), function(){
                var score = {methods:{}};
                methods.forEach(function(method){
                    score.methods[method] = function(){};
                });
                expect(route.conduct(score)).to.be.ok;
            });

        });

    });


}(require));