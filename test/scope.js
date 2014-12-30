/**
 * Created by jhorlin.dearmas on 12/30/2014.
 */
(function (Scope, should) {
    describe("test scope", function () {
        describe("test parent scope", function(){
            it("should create an instance of a scope", function () {
                var scope = new Scope();
                should.exist(scope);
            });
            it("should create a parent scope extended from an object", function (done) {
                var parentProperties = {
                        name: 'test',
                        age: 33
                    },
                    scope = new Scope(parentProperties);
                scope.ready(function(){
                    try{
                        should.exist(scope);
                        scope.should.have.property('name', 'test');
                        scope.should.have.property('age', 33);
                        done();
                    } catch(err){
                        done(err);
                    }
                });
            });


            it("should set a parent scope extended from an object", function (done) {
                var parentProperties = {
                        name: 'test',
                        age: 33
                    },
                    scope = new Scope(parentProperties);
                scope.ready(function(){
                    try{
                        should.exist(scope);
                        scope.should.have.property('name', 'test');
                        scope.should.have.property('age', 33);
                        scope.set({
                            name: 'testSet',
                            age: 19
                        })(function(){
                            try{
                                scope.should.have.property('name', 'testSet');
                                scope.should.have.property('age', 19);
                                done();
                            } catch(err){
                                done(err);
                            }
                        });
                    } catch(err){
                        done(err);
                    }
                });
            });

            it("should set a parent scope extended from an object and unset any old values", function (done) {
                var parentProperties = {
                        name: 'test',
                        age: 33
                    },
                    scope = new Scope(parentProperties, true);
                scope.ready(function(){
                    try{
                        should.exist(scope);
                        scope.should.have.property('name', 'test');
                        scope.should.have.property('age', 33);
                        scope.set({
                            nameSet: 'testSet',
                            ageSet: 21
                        })(function(){
                            try{
                                scope.should.have.property('nameSet', 'testSet');
                                scope.should.have.property('ageSet', 21);
                                (scope.name === undefined).should.be.true;
                                (scope.age === undefined).should.be.true;
                                done();
                            } catch(err){
                                done(err);
                            }
                        });
                    } catch(err){
                        done(err);
                    }
                });
            });
        });

        describe("test child scope", function(){
           var parentScope;
            before(function(done){
                parentScope = new Scope({
                   name:'test',
                   age:33
               });
                parentScope.ready(function(){
                    done();
                });
            });

            it("should create a child scope", function(done){
               var childScope = parentScope.child({childName:'child', age:1});
                childScope.ready(function(){
                    try{
                        should.exist(childScope);
                        childScope.should.have.property('name', 'test');
                        childScope.should.have.property('age', 1);
                        childScope.should.have.property('childName', 'child');
                        (childScope.parent === parentScope).should.be.true;
                        (childScope.__proto__ === parentScope).should.be.true;
                        done();
                    } catch(err){
                        done(err);
                    }
                });
            });
            it("should reset a childes scope", function(done){
                var childScope = parentScope.child({childName:'child', age:1});
                childScope.ready(function(){
                    try{
                        should.exist(childScope);
                        childScope.should.have.property('name', 'test');
                        childScope.should.have.property('age', 1);
                        childScope.should.have.property('childName', 'child');
                        (childScope.parent === parentScope).should.be.true;
                        (childScope.__proto__ === parentScope).should.be.true;
                       childScope.set({
                          age:3,
                           childName:'setChild'
                       })(function(){
                           try{
                               childScope.should.have.property('name', 'test');
                               childScope.should.have.property('age', 3);
                               childScope.should.have.property('childName', 'setChild');
                               done();
                           } catch(err){
                               done(err);
                           }
                       });
                    } catch(err){
                        done(err);
                    }
                });
            });
        });

    });

}(require('./../lib/scope'), require('should')));