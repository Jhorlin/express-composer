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
    describe("test Scope", function () {
        it("should create a scopeProvider", function () {
            var scopeProvider = new ScopeProvider();
            expect(scopeProvider).to.be.an.instanceof(ScopeProvider);
        });

        it("should create a scopeProvider without the keyword 'new'", function () {
            var scopeProvider = ScopeProvider();
            expect(scopeProvider).to.be.an.instanceof(ScopeProvider);
        });

        it("should create a scope", function (done) {
            var scopeProvider = new ScopeProvider(),
                req = {};
            scopeProvider.init(req, {}, function (err) {
                if (err) {
                    done(err);
                }
                var scope = req.expressComposerScopeCache.get(scopeProvider.key);
                expect(scope).to.be.ok;
                done();
            });
        });

        it("should create a scope with the properties of an object when primed with an object", function (done) {
            var primer = {
                a: 'b',
                c: 'd',
                e: 'f'
            }

            var scopeProvider = new ScopeProvider(primer),
                req = {};
            scopeProvider.init(req, {}, function (err) {
                if (err) {
                    done(err);
                }
                var scope = req.expressComposerScopeCache.get(scopeProvider.key);
                Object.keys(primer).forEach(function (key) {
                    expect(scope).to.have.property(key, primer[key]);
                })
                done();
            });

        });

        it("should create a scope with the properties of an object when primed with a function returning that object", function (done) {
            var primer = {
                a: 'b',
                c: 'd',
                e: 'f'
            }

            var scopeProvider = new ScopeProvider(function () {
                    return primer;
                }),
                req = {};
            scopeProvider.init(req, {}, function (err) {
                if (err) {
                    done(err);
                }
                var scope = req.expressComposerScopeCache.get(scopeProvider.key);
                Object.keys(primer).forEach(function (key) {
                    expect(scope).to.have.property(key, primer[key]);
                })
                done();
            })
        });

        it("should create a scope with the properties of an object when primed with a promise of an object", function (done) {
            var primer = {
                    a: 'b',
                    c: 'd',
                    e: 'f'
                },
                promise = new Promise(function (resolve) {
                    resolve(primer);
                });

            var scopeProvider = new ScopeProvider(promise),
                req = {};
            scopeProvider.init(req, {}, function (err) {
                if (err) {
                    done(err);
                }
                var scope = req.expressComposerScopeCache.get(scopeProvider.key);
                Object.keys(primer).forEach(function (key) {
                    expect(scope).to.have.property(key, primer[key]);
                })
                done();
            })
        });

        it("should create a scope with the properties of an object when primed with a function returning a promise of object", function (done) {
            var primer = {
                a: 'b',
                c: 'd',
                e: 'f'
            };

            var scopeProvider = new ScopeProvider(function () {
                    return new Promise(function (resolve) {
                        resolve(primer);
                    });
                }),
                req = {};
            scopeProvider.init(req, {}, function (err) {
                if (err) {
                    done(err);
                }
                var scope = req.expressComposerScopeCache.get(scopeProvider.key);
                Object.keys(primer).forEach(function (key) {
                    expect(scope).to.have.property(key, primer[key]);
                })
                done();
            })
        });

        describe('test parent ScopeProvider', function () {
            var scopeProvider,
                primer = {
                    a: 'b',
                    c: 'd',
                    e: 'f'
                },
                req = {};

            beforeEach(function (done) {
                scopeProvider = new ScopeProvider(primer)
                scopeProvider.init(req, {}, done);
            });

            afterEach(function () {
                req = {};
            });


            describe("test child inherits parent properties ", function () {
                var childScopeProvider,
                    childPrimer = {
                        g: 'h',
                        i: 'j',
                        k: 'k'
                    };
                beforeEach(function (done) {
                    childScopeProvider = new ScopeProvider(childPrimer, scopeProvider);
                    childScopeProvider.init(req, {}, done);
                })

                it("should create a scope with a prototype of the parent scopeProvider's scope", function () {
                    var scope = req.expressComposerScopeCache.get(childScopeProvider.key);
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
                })
            })

            describe('test scope', function () {
                var scope,
                    scopeProperties = ['addResult', 'addError', 'setQuery', 'setBody', 'setParam', 'body', 'query', 'param', 'errors'];


                beforeEach(function () {
                    scope = req.expressComposerScopeCache.get(scopeProvider.key);
                })

                it("should have the properties:" + scopeProperties.join(', '), function () {
                    expect(scope).to.be.ok;
                    scopeProperties.forEach(function (property) {
                        expect(scope).to.have.property(property)
                    });
                })

                describe('test param', function () {
                    var param = {
                        key1: 'value1',
                        key2: 'value2'
                    }
                    beforeEach(function () {
                        scope.setParam(param);
                    })

                    it('should get the param', function () {
                        expect(scope.param).to.eql(param);
                    });

                    describe('test param for child scope', function () {
                        var childScope,
                            childParam = {
                                key2: 'childValue2',
                                key3: 'childValue3'
                            }
                        beforeEach(function () {
                            childScope = scope.new();
                            childScope.setParam(childParam);
                        });

                        it('should get the param', function () {
                            expect(childScope.param).to.eql(extend({}, param, childParam));
                        });

                        it('should inherit param from the parent', function () {
                            var extended = extend({}, param, childParam);
                            Object.keys(extended).forEach(function (property) {
                                expect(childScope.param).to.have.property(property, extended[property]);
                            })
                        })
                    })
                })

                describe('test body', function () {
                    var body = {
                        key1: 'value1',
                        key2: 'value2'
                    }
                    beforeEach(function () {
                        scope.setBody(body);
                    })

                    it('should get the body', function () {
                        expect(scope.body).to.eql(body);
                    });

                    describe('test body for child scope', function () {
                        var childScope,
                            childBody = {
                                key2: 'childValue2',
                                key3: 'childValue3'
                            }
                        beforeEach(function () {
                            childScope = scope.new();
                            childScope.setBody(childBody);
                        });

                        it('should get the body', function () {
                            expect(childScope.body).to.eql(extend({}, body, childBody));
                        });

                        it('should inherit body from the parent', function () {
                            var extended = extend({}, body, childBody);
                            Object.keys(extended).forEach(function (property) {
                                expect(childScope.body).to.have.property(property, extended[property]);
                            })
                        })
                    })
                })

                describe('test query', function () {
                    var query = {
                        key1: 'value1',
                        key2: 'value2'
                    }
                    beforeEach(function () {
                        scope.setQuery(query);
                    })

                    it('should get the query', function () {
                        expect(scope.query).to.eql(query);
                    });

                    describe('test query for child scope', function () {
                        var childScope,
                            childQuery = {
                                key2: 'childValue2',
                                key3: 'childValue3'
                            }
                        beforeEach(function () {
                            childScope = scope.new();
                            childScope.setQuery(childQuery);
                        });

                        it('should get the query', function () {
                            expect(childScope.query).to.eql(extend({}, query, childQuery));
                        });

                        it('should inherit query from the parent', function () {
                            var extended = extend({}, query, childQuery);
                            Object.keys(extended).forEach(function (property) {
                                expect(childScope.query).to.have.property(property, extended[property]);
                            })
                        })
                    })
                })

                describe('test result', function () {
                    var results = {
                        key1: 'value1',
                        key2: 'value2'
                    }

                    beforeEach(function () {
                        Object.keys(results).forEach(function (property) {
                            scope.addResult(property, results[property]);
                        });
                    })

                    it("should be able to access the results", function () {
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
                            Object.keys(childResults).forEach(function (property) {
                                childScope.addResult(property, childResults[property]);
                            });
                        });

                        it("should be able to access the results", function () {
                            expect(childScope.results).to.eql(extend({}, results, childResults));
                        })
                    })
                })

                describe('test errors', function () {
                    var results = {
                        key1: 'value1',
                        key2: 'value2'
                    }

                    beforeEach(function () {
                        Object.keys(results).forEach(function (property) {
                            scope.addError(property, results[property]);
                        });
                    })

                    it("should be able to access the results", function () {
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
                            Object.keys(childResults).forEach(function (property) {
                                childScope.addError(property, childResults[property]);
                            });
                        });

                        it("should be able to access the results", function () {
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