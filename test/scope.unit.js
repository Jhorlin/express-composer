/**
 * Created by jhorlin.dearmas on 12/30/2014.
 */
(function (Scope, should) {
    'use strict';

    var Promise = require('bluebird');
    describe("test scope", function () {
        describe("test parent scope", function () {
            it("should create an instance of a scope", function () {
                var scope = new Scope();
                should.exist(scope);
            });

            it("should create an instance of a scope with out new", function () {
                var scope = Scope();
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
                        value: Promise.resolve(argument)
                    },
                    {
                        type: "function returning a promise",
                        value: function () {
                            return Promise.resolve(argument);
                        }
                    }
                ];

            argumentTypes.forEach(function (arg) {
                it("should create a parent scope extended from " + arg.type, function (done) {
                    var scope = new Scope(arg.value);
                    scope.ready.then(function () {
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

                it("should set a parent scope extended from " + arg.type, function () {
                    var scope = new Scope(arg.value);
                    return scope.ready.then(function () {
                        should.exist(scope);
                        scope.should.have.property('name', 'test');
                        scope.should.have.property('age', 33);
                        scope.set({
                            setName: 'testSet',
                            age: 19
                        }).then(function () {
                            scope.should.have.property('name', 'test');
                            scope.should.have.property('setName', 'testSet');
                            scope.should.have.property('age', 19);
                        });
                    });
                });


                it("should set a parent scope extended from " + arg.type + " and unset any old values", function () {
                    var scope = new Scope(arg.value, true);
                    return scope.ready.then(function () {
                        should.exist(scope);
                        scope.should.have.property('name', 'test');
                        scope.should.have.property('age', 33);
                        scope.set({
                            nameSet: 'testSet',
                            ageSet: 21
                        }).then(function () {
                            scope.should.have.property('nameSet', 'testSet');
                            scope.should.have.property('ageSet', 21);
                            (scope.name === undefined).should.be.true;
                            (scope.age === undefined).should.be.true;
                        });
                    });
                });
            });

        });

        describe("test child scope", function () {
            var parentScope;
            before(function () {
                parentScope = new Scope({
                    name: 'test',
                    age: 33
                })
                return parentScope.ready;
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
                        set: setArgument
                    },
                    {
                        type: "function",
                        value: function () {
                            return argument;
                        },
                        set: function () {
                            return setArgument;
                        }
                    },
                    {
                        type: "promise",
                        value: Promise.resolve(argument),
                        set: Promise.resolve(setArgument)
                    },
                    {
                        type: "function returning a promise",
                        value: function () {
                            return Promise.resolve(argument);
                        },
                        set: function () {
                            return Promise.resolve(setArgument);
                        }
                    }
                ];

            argumentTypes.forEach(function (arg) {


                it("should create a child scope from " + arg.type, function () {
                    var childScope = parentScope.new(arg.value);
                    return childScope.ready.then(function () {
                        should.exist(childScope);
                        childScope.should.have.property('name', 'test');
                        childScope.should.have.property('age', 1);
                        childScope.should.have.property('childName', 'child');
                        (childScope.parent === parentScope).should.be.true;
                        (childScope.__proto__ === parentScope).should.be.true;
                    });
                });


                it("should set a child's scope with " + arg.type, function () {
                    var childScope = parentScope.new(arg.value);
                    return childScope.ready.then(function () {
                        should.exist(childScope);
                        childScope.should.have.property('name', 'test');
                        childScope.should.have.property('age', 1);
                        childScope.should.have.property('childName', 'child');
                        (childScope.parent === parentScope).should.be.true;
                        (childScope.__proto__ === parentScope).should.be.true;
                        return childScope.set(arg.set).then(function () {
                            childScope.should.have.property('age', 3);
                            childScope.should.have.property('childSetName', 'setChild');
                        });
                    });
                });

            });

        });
    });

}(require('../index').Scope, require('should')));