/**
 * Created by jhorlin.dearmas on 12/30/2014.
 */
(function (Scope) {
    'use strict';

    var Promise = require('bluebird'),
        chai = require('chai'),
        expect = chai.expect;
    describe("test scope", function () {
        describe("test parent scope", function () {
            it("should create an instance of a scope", function () {
                var scope = new Scope();
                expect(scope).to.be.ok;
            });

            it("should create an instance of a scope with out new", function () {
                var scope = Scope();
                expect(scope).to.be.ok;
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
                it("should create a parent scope extended from " + arg.type, function () {
                    var scope = new Scope(arg.value);
                    expect(scope).to.be.ok
                    return scope.ready.then(function (scope) {
                        expect(scope).to.be.ok
                        expect(scope).to.have.property('name', 'test');
                        expect(scope).to.have.property('age', 33);
                    });
                });

            });

        });

        describe("test child scope", function () {
            var parentScope;
            before(function () {
                parentScope = new Scope({
                    parentName: 'test',
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
                    expect(childScope).to.be.ok;
                    expect(childScope).to.have.property('parentName', 'test');
                    expect(childScope).to.have.property('age', 33);
                    return childScope.ready.then(function (childScope) {
                        expect(childScope).to.have.property('parentName', 'test');
                        expect(childScope).to.be.ok;
                        expect(childScope).to.have.property('age', 1);
                        expect(childScope).to.have.property('childName', 'child');
                        expect(childScope.parent).to.equal(parentScope);
                        expect(childScope.__proto__).to.equal(parentScope);
                    });
                });

            });

        });
    });

}(require('../index').Scope));