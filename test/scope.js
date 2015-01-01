/**
 * Created by jhorlin.dearmas on 12/30/2014.
 */
(function (Scope, should, q) {
    describe("test scope", function () {
        describe("test parent scope", function () {
            it("should create an instance of a scope", function () {
                var scope = new Scope();
                should.exist(scope);
            });
            var argument = {
                    name: 'test',
                    age: 33
                },
                argumentTypes = [
                    {
                        type: "object",
                        value: argument
                    },
                    {
                        type: "function",
                        value: function () {
                            return argument;
                        }
                    },
                    {
                        type: "promise",
                        value: q.when(argument)
                    },
                    {
                        type: "function returning a promise",
                        value: function () {
                            return q.when(argument);
                        }
                    }
                ];

            argumentTypes.forEach(function (arg) {
                it("should create a parent scope extended from " + arg.type, function (done) {
                    var scope = new Scope(arg.value);
                    scope.ready(function () {
                        try {
                            should.exist(scope);
                            scope.should.have.property('name', 'test');
                            scope.should.have.property('age', 33);
                            done();
                        } catch (err) {
                            done(err);
                        }
                    });
                });

                it("should set a parent scope extended from " + arg.type, function (done) {
                    var scope = new Scope(arg.value);
                    scope.ready(function () {
                        try {
                            should.exist(scope);
                            scope.should.have.property('name', 'test');
                            scope.should.have.property('age', 33);
                            scope.set({
                                setName: 'testSet',
                                age: 19
                            })(function () {
                                try {
                                    scope.should.have.property('name', 'test');
                                    scope.should.have.property('setName', 'testSet');
                                    scope.should.have.property('age', 19);
                                    done();
                                } catch (err) {
                                    done(err);
                                }
                            });
                        } catch (err) {
                            done(err);
                        }
                    });
                });


                it("should set a parent scope extended from " + arg.type + " and unset any old values", function (done) {
                    var scope = new Scope(arg.value, true);
                    scope.ready(function () {
                        try {
                            should.exist(scope);
                            scope.should.have.property('name', 'test');
                            scope.should.have.property('age', 33);
                            scope.set({
                                nameSet: 'testSet',
                                ageSet: 21
                            })(function () {
                                try {
                                    scope.should.have.property('nameSet', 'testSet');
                                    scope.should.have.property('ageSet', 21);
                                    (scope.name === undefined).should.be.true;
                                    (scope.age === undefined).should.be.true;
                                    done();
                                } catch (err) {
                                    done(err);
                                }
                            });
                        } catch (err) {
                            done(err);
                        }
                    });
                });


            });

        });

        describe("test child scope", function () {
            var parentScope,
                parentUnsetScope
            before(function (done) {
                parentScope = new Scope({
                    name: 'test',
                    age: 33
                });
                parentUnsetScope = new Scope({
                    name: 'test',
                    age: 33
                }, true);
                parentScope.ready(function () {
                    parentUnsetScope.ready(function () {
                        done();
                    });
                });
            });


            var argument = {
                    childName: 'child',
                    age: 1
                },
                setArgument = {
                    age: 3,
                    childSetName: 'setChild'

                },
                argumentTypes = [
                    {
                        type: "object",
                        value: argument,
                        set:setArgument
                    },
                    {
                        type: "function",
                        value: function () {
                            return argument;
                        },
                        set:function(){
                            return setArgument;
                        }
                    },
                    {
                        type: "promise",
                        value: q.when(argument),
                        set: q.when(setArgument)
                    },
                    {
                        type: "function returning a promise",
                        value: function () {
                            return q.when(argument);
                        },
                        set:function(){
                            return q.when(setArgument);
                        }
                    }
                ];

            argumentTypes.forEach(function (arg) {


                it("should create a child scope from " + arg.type, function (done) {
                    var childScope = parentScope.child(arg.value);
                    childScope.ready(function () {
                        try {
                            should.exist(childScope);
                            childScope.should.have.property('name', 'test');
                            childScope.should.have.property('age', 1);
                            childScope.should.have.property('childName', 'child');
                            (childScope.parent === parentScope).should.be.true;
                            (childScope.__proto__ === parentScope).should.be.true;
                            done();
                        } catch (err) {
                            done(err);
                        }
                    });
                });

                it("should create a child's scope from unset parent with " + arg.type, function (done) {
                    var childScope = parentUnsetScope.child(arg.value);
                    childScope.ready(function () {
                        try {
                            should.exist(childScope);
                            childScope.should.have.property('name', 'test');
                            childScope.should.have.property('age', 1);
                            childScope.should.have.property('childName', 'child');
                            (childScope.parent === parentUnsetScope).should.be.true;
                            (childScope.__proto__ === parentUnsetScope).should.be.true;
                            done();
                        } catch (err) {
                            done(err);
                        }
                    });
                });

                it("should set a child's scope with " + arg.type, function (done) {
                    var childScope = parentScope.child(arg.value);
                    childScope.ready(function () {
                        try {
                            should.exist(childScope);
                            childScope.should.have.property('name', 'test');
                            childScope.should.have.property('age', 1);
                            childScope.should.have.property('childName', 'child');
                            (childScope.parent === parentScope).should.be.true;
                            (childScope.__proto__ === parentScope).should.be.true;
                            childScope.set(arg.set)(function () {
                                try {
                                    childScope.should.have.property('name', 'test');
                                    childScope.should.have.property('age', 3);
                                    childScope.should.have.property('childName', 'child');
                                    childScope.should.have.property('childSetName', 'setChild');
                                    done();
                                } catch (err) {
                                    done(err);
                                }
                            });
                        } catch (err) {
                            done(err);
                        }
                    });
                });

                it("should reset a childes unset scope with " + arg.type, function (done) {
                    var childScope = parentUnsetScope.child(arg.value);
                    childScope.ready(function () {
                        try {
                            should.exist(childScope);
                            childScope.should.have.property('name', 'test');
                            childScope.should.have.property('age', 1);
                            childScope.should.have.property('childName', 'child');
                            (childScope.parent === parentUnsetScope).should.be.true;
                            (childScope.__proto__ === parentUnsetScope).should.be.true;
                            childScope.set(arg.set)(function () {
                                try {
                                    childScope.should.have.property('name', 'test');
                                    childScope.should.have.property('age', 3);
                                    childScope.should.have.property('childSetName', 'setChild');
                                    (childScope.childName === undefined).should.be.true;
                                    done();
                                } catch (err) {
                                    done(err);
                                }
                            });
                        } catch (err) {
                            done(err);
                        }
                    });
                });


            });

        });
    });

}(require('./../lib/scope'), require('should'), require('q')));