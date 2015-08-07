/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
(function (require, describe, before, it) {
    'use strict';

    var expressComposer = require('../index'),
        chai = require('chai'),
        util = require('util'),
        Promise = require('bluebird'),
        expect = chai.expect;
    describe("test composer", function () {
        describe("test instantiation of default factory", function () {
            var composer
            before(function () {
                composer = expressComposer.composer();
                composer.initialize();
            });

            it("should create an instance of default composer", function () {
                expect(composer).to.be.ok;
            });

            ['', 'Sync'].forEach(function (type) {
                describe("test compose" + type, function () {
                    it("should throw an error for invalid values", function () {
                        return new Promise(function (resolve, reject) {
                            try {
                                resolve(composer['compose' + type]());
                            } catch (e) {
                                reject(e);
                            }
                        })
                            .catch(function (err) {
                                expect(err).to.be.instanceof(Error);
                            })
                    })

                    it("should create a a score", function () {
                        return new Promise(function (resolve, reject) {
                            try {
                                resolve(composer['compose' + type]({}));
                            } catch (e) {
                                reject(e);
                            }
                        })
                    })
                })

                describe("test composeApp", function () {
                    it("should throw an error for invalid values", function () {
                        return new Promise(function (resolve, reject) {
                            try {
                                resolve(composer['composeApp' + type]());
                            } catch (e) {
                                reject(e);
                            }
                        })
                            .catch(function (err) {
                                expect(err).to.be.instanceof(Error);
                            })
                    })

                    it("should create a a score", function () {
                        return new Promise(function (resolve, reject) {
                            try {
                                resolve(composer['composeApp' + type]({}));
                            } catch (e) {
                                reject(e);
                            }
                        })
                    })
                })

                describe("test composeRouter", function () {
                    it("should throw an error for invalid values", function () {
                        return new Promise(function (resolve, reject) {
                            try {
                                resolve(composer['composeRouter' + type]());
                            } catch (e) {
                                reject(e);
                            }
                        })
                            .catch(function (err) {
                                expect(err).to.be.instanceof(Error);
                            })
                    })

                    it("should create a a score", function () {
                        return new Promise(function (resolve, reject) {
                            try {
                                resolve(composer['composeRouter' + type]({}));
                            } catch (e) {
                                reject(e);
                            }
                        })
                    })
                })


                describe("test composeRoute", function () {
                    it("should throw an error for invalid values", function () {
                        return new Promise(function (resolve, reject) {
                            try {
                                resolve(composer['composeRoute' + type]());
                            } catch (e) {
                                reject(e);
                            }
                        })
                            .catch(function (err) {
                                expect(err).to.be.instanceof(Error);
                            })
                    })

                    it("should create a a score", function () {
                        return new Promise(function (resolve, reject) {
                            try {
                                resolve(composer['composeRoute' + type]({}));
                            } catch (e) {
                                reject(e);
                            }
                        })
                    })
                })
            })


        });

        describe("test resolver", function () {
            var Resolver,
                instance;
            before(function () {
                Resolver = expressComposer.composer.Resolver;
                instance = new Resolver();
            });

            it("should create an instance of default composer", function () {
                expect(Resolver).to.be.ok;
                expect(Resolver.prototype).to.have.property('resolve');
                expect(Resolver.prototype).to.have.property('resolveSync');
            });

            it('should throw an error when resolve is called', function () {
                expect(instance.resolve).to.throw('resolve has not been implemented');
            });

            it('should throw an error when resolveAsync is called', function () {
                expect(instance.resolveSync).to.throw('resolveSync has not been implemented');
            });

        });

        describe("test default composer", function () {
            var composer,
                properties = ['compose', 'composeSync', 'composeApp', 'composeAppSync', 'composeRouter', 'composeRouterSync', 'composeRoute', 'composeRouteSync'];

            function TestResolver () {
            };

            util.inherits(TestResolver, expressComposer.composer.Resolver);

            TestResolver.prototype.resolve = function () {
            };

            TestResolver.prototype.resolveSync = function () {
            };

            beforeEach(function () {
                composer = new expressComposer.composer.Factory(TestResolver, TestResolver, TestResolver);
            });

            it("should exist", function () {
                expect(composer).to.be.ok
            });

            it('should contain properties: ' + properties.join(','), function () {

                properties.forEach(function (property) {
                    expect(composer).to.have.property(property);
                })
            });

            it('should throw an exception if composer has not been initialized', function () {
                return Promise.each(properties, function (property) {
                    return new Promise(function (resolve, reject) {
                        try {
                            resolve(composer[property]())
                        } catch (err) {
                            reject(err);
                        }
                    })
                        .catch(Error, function (err) {
                            expect(err).to.be.an.instanceof(Error);
                            return err;
                        })
                });
            });

            it("should initialize an instance of default composer", function () {
                expect(composer.initialized).to.equal(false);
                composer.initialize();
                expect(composer.initialized).to.equal(true);
                return composer.ready;
            });
        });


    });
}(require, describe, before, it))