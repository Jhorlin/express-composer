/**
 * Created by jhorlin.dearmas on 12/30/2014.
 */
(function (require) {
    'use strict';
    //dependencies
    var Promise = require('bluebird'),
        chai = require('chai'),
        ScopeProvider = require('../index').ScopeProvider,
        extend = require('extend'),
        expect = chai.expect;
    describe("test ScopeProvider", function () {
        it("should create a scopeProvider", function () {
            var scopeProvider = new ScopeProvider();
            expect(scopeProvider).to.be.an.instanceof(ScopeProvider);
        });

        it("should create a scopeProvider without the keyword 'new'", function () {
            var scopeProvider = ScopeProvider();
            expect(scopeProvider).to.be.an.instanceof(ScopeProvider);
        });

        it("should create a scope", function () {
            var scopeProvider = new ScopeProvider();
            return scopeProvider.scope.then(function (scope) {
                expect(scope).to.be.ok;
            });
        });

        it("should create a scope with the properties of an object when primed with an object", function () {
            var primer = {
                a: 'b',
                c: 'd',
                e: 'f'
            }

            var scopeProvider = new ScopeProvider(primer);
            return scopeProvider.scope.then(function (scope) {
                Object.keys(primer).forEach(function (key) {
                    expect(scope).to.have.property(key, primer[key]);
                })
            });

        });

        it("should create a scope with the properties of an object when primed with a function returning that object", function () {
            var primer = {
                a: 'b',
                c: 'd',
                e: 'f'
            }

            var scopeProvider = new ScopeProvider(function () {
                return primer;
            });
            return scopeProvider.scope.then(function (scope) {
                Object.keys(primer).forEach(function (key) {
                    expect(scope).to.have.property(key, primer[key]);
                })
            });

        });

        it("should create a scope with the properties of an object when primed with a promise of an object", function () {
            var primer = {
                    a: 'b',
                    c: 'd',
                    e: 'f'
                },
                promise = new Promise(function (resolve) {
                    resolve(primer);
                });

            var scopeProvider = new ScopeProvider(promise);
            return scopeProvider.scope.then(function (scope) {
                Object.keys(primer).forEach(function (key) {
                    expect(scope).to.have.property(key, primer[key]);
                })
            });

        });

        it("should create a scope with the properties of an object when primed with a function returning a promise of object", function () {
            var primer = {
                a: 'b',
                c: 'd',
                e: 'f'
            };

            var scopeProvider = new ScopeProvider(function () {
                return new Promise(function (resolve) {
                    resolve(primer);
                });
            });
            return scopeProvider.scope.then(function (scope) {
                Object.keys(primer).forEach(function (key) {
                    expect(scope).to.have.property(key, primer[key]);
                })
            });

        });

        describe('test that we can dispose of a scope', function () {
            var scopeProvider,
                primer = {
                    a: 'b',
                    c: 'd',
                    e: 'f'
                };
            beforeEach(function () {
                scopeProvider = new ScopeProvider(primer)
            });

            it("should have a dispose property", function () {
                expect(scopeProvider).to.have.property('dispose');
            });

            it("should reset to its original state after being disposed", function () {
                var newValues = {
                    g: 'h',
                    i: 'j',
                    k: 'k'
                };
                return scopeProvider.scope.then(function (scope) {
                    Object.keys(newValues).forEach(function (key) {
                        expect(scope).not.to.have.property(key);
                    })
                    Object.keys(newValues).forEach(function (key) {
                        scope[key] = newValues[key];
                    })
                    Object.keys(newValues).forEach(function (key) {
                        expect(scope).to.have.property(key, newValues[key]);
                    })
                    //dispose
                    scopeProvider.dispose();
                    return scopeProvider.scope.then(function (scope) {
                        Object.keys(newValues).forEach(function (key) {
                            expect(scope).not.to.have.property(key);
                        })
                    })
                })
            })

            describe("test parent scope provider", function () {
                var childScopeProvider,
                    childPrimer = {
                        g: 'h',
                        i: 'j',
                        k: 'k'
                    };
                beforeEach(function () {
                    childScopeProvider = new ScopeProvider(childPrimer, scopeProvider);
                })

                it("should create a scope with a prototype of the parent scopeProvider's scope", function () {
                    return childScopeProvider.scope.then(function (scope) {
                        Object.keys(primer).forEach(function (key) {
                            expect(scope).to.have.property(key, primer[key]);
                        });
                        Object.keys(childPrimer).forEach(function (key) {
                            expect(scope).to.have.property(key, childPrimer[key]);
                        })
                        Object.keys(childPrimer).forEach(function (key) {
                            expect(scope).to.have.ownProperty(key, childPrimer[key]);
                        })
                        Object.keys(primer).forEach(function (key) {
                            expect(scope).to.not.have.ownProperty(key, primer[key]);
                        });
                    });
                })

            })

            describe('test scope', function () {
                var scope,
                    scopeProperties = ['addResult', 'addError', 'setRequest', 'results', 'errors', 'request'];


                beforeEach(function () {
                    return scopeProvider.scope.then(function (providedScope) {
                        scope = providedScope;
                    })
                })

                it("should have the properties:" + scopeProperties.join(', '), function () {
                    expect(scope).to.be.ok;
                    scopeProperties.forEach(function (property) {
                        expect(scope).to.have.property(property)
                    });
                })

                describe('test request', function () {
                    var request = {
                        key1: 'value1',
                        key2: 'value2'
                    }
                    beforeEach(function () {
                        scope.setRequest(request);
                    })

                    it('should get the request', function () {
                        expect(scope.request).to.eql(request);
                    });

                    describe('test request for child scope', function () {
                        var childScope,
                            childRequest = {
                                key2: 'childValue2',
                                key3: 'childValue3'
                            }
                        beforeEach(function () {
                            childScope = scope.new();
                            childScope.setRequest(childRequest);
                        });

                        it('should get the request', function () {
                            expect(childScope.request).to.eql(extend({}, request, childRequest));
                        });

                        it('should inherit request from the parent', function(){
                            var extended = extend({}, request, childRequest);
                            Object.keys(extended).forEach(function(property){
                                expect(childScope.request).to.have.property(property, extended[property]);
                            })
                        })
                    })
                })

                describe('test results', function () {
                    var results = {
                        key1: 'value1',
                        key2: 'value2'
                    }

                    beforeEach(function(){
                        Object.keys(results).forEach(function(property){
                           scope.addResult(property, results[property]);
                        });
                    })

                    it("should be able to access the results", function(){
                        expect(scope.results).to.eql(results);
                    })

                    describe('test results for child scope', function () {
                        var childScope,
                            childResults = {
                                key2: 'childValue2',
                                key3: 'childValue3'
                            }
                        beforeEach(function () {
                            childScope = scope.new();
                            Object.keys(childResults).forEach(function(property){
                                scope.addResult(property, childResults[property]);
                            });
                        });

                        it("should be able to access the results", function(){
                            expect(childScope.results).to.eql(extend({}, results, childResults));
                        })
                    })
                })


                describe('test errors', function () {
                    var results = {
                        key1: 'value1',
                        key2: 'value2'
                    }

                    beforeEach(function(){
                        Object.keys(results).forEach(function(property){
                            scope.addError(property, results[property]);
                        });
                    })

                    it("should be able to access the results", function(){
                        expect(scope.errors).to.eql(results);
                    })

                    describe('test results for child scope', function () {
                        var childScope,
                            childResults = {
                                key2: 'childValue2',
                                key3: 'childValue3'
                            }
                        beforeEach(function () {
                            childScope = scope.new();
                            Object.keys(childResults).forEach(function(property){
                                childScope.addError(property, childResults[property]);
                            });
                        });

                        it("should be able to access the results", function(){
                            expect(childScope.errors).to.eql(extend({}, results, childResults));
                        })
                    })
                })

                describe('test child scope', function () {
                    var childScope,
                        childPrimer = {
                            g: 'h',
                            i: 'j',
                            k: 'k'
                        },
                        childScopeProperties = scopeProperties.concat(['parent']);

                    beforeEach(function () {
                        childScope = scope.new(childPrimer);
                    });

                    it("should have the properties:" + childScopeProperties.join(', '), function () {
                        expect(scope).to.be.ok;
                        scopeProperties.forEach(function (property) {
                            expect(scope).to.have.property(property)
                        });
                    });

                    it("should have the prototype of its parent", function () {
                        expect(childScope.__proto__).to.equal(scope);
                    });

                    it("should have the parent of its parent", function () {
                        expect(childScope.parent).to.equal(scope);
                    })

                    it("should have all the properties of the parent and the child", function () {
                        Object.keys(primer).forEach(function (property) {
                            expect(childScope).to.have.property(property, primer[property]);
                        })
                        Object.keys(childPrimer).forEach(function (property) {
                            expect(childScope).to.have.property(property, childPrimer[property]);
                        })

                    })

                    it("should have int's own properties of the child and not from the parent", function () {
                        Object.keys(primer).forEach(function (property) {
                            expect(childScope).to.not.have.ownProperty(property, primer[property]);
                        })
                        Object.keys(childPrimer).forEach(function (property) {
                            expect(childScope).to.have.ownProperty(property, childPrimer[property]);
                        })
                    })

                });
            })

        })

    });

}(require));