/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
(function (require, describe, before, it) {
    'use strict';

    var expressComposer = require('../index'),
        chai = require('./utils/chai'),
        httpRequest = chai.request,
        expect = chai.expect;
    describe("test composer", function () {
        describe("test instantiation of default factory", function () {
            var scoreFactory;
            before(function () {
                scoreFactory = expressComposer.composer.defaultFactory();
            });

            it("should create an instance of default composer", function () {
                expect(scoreFactory).to.be.ok;
            });

        });

        describe("test default scoreFactory initialization", function () {
            var scoreFactory;
            before(function () {
                scoreFactory = expressComposer.composer.defaultFactory();
            });

            it("should initialize an instance of default composer", function () {
                scoreFactory.initialize();
                return scoreFactory.ready;
            });
        });

        describe("test default scoreFactory syncResolver", function () {
            var scoreFactory,
                app,
                request;
            before(function () {
                scoreFactory = expressComposer.composer.defaultFactory();
                scoreFactory.initialize();
            });

            beforeEach(function () {
                app = expressComposer();
                request = httpRequest(app);
            });

            it("should create a score", function () {
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            methods: {
                                get: {
                                    handlers: ['test/modules/handlers/getScopeMessage']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                expect(score).to.be.ok;
            });

            it("should create a score and compose an app with the message 'Hello World!'", function () {
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            methods: {
                                get: {
                                    handlers: ['test/modules/handlers/helloWorld']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                return request
                    .get('/')
                    .then(function (res) {
                        expect(res).to.have.status(200);
                        expect(res.text).to.equal('Hello World!');
                    });
            });

            it("should create a score and compose an app with a router preHandler and a route get message of 'Hello World!'", function () {
                var scoreConfig = {
                    routers: [{
                        preHandlers: ['test/modules/handlers/setScopeMessage'],
                        routes: [{
                            methods: {
                                get: {
                                    handlers: ['test/modules/handlers/getScopeMessage']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                return request
                    .get('/')
                    .then(function (res) {
                        expect(res).to.have.status(200);
                        expect(res.text).to.equal('Hello World!');
                    });
            });

            it("should create a score and compose an app with a route preHandler and a route get message of 'Hello World!'", function () {
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            preHandlers: ['test/modules/handlers/setScopeMessage'],
                            methods: {
                                get: {
                                    handlers: ['test/modules/handlers/getScopeMessage']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                return request
                    .get('/')
                    .then(function (res) {
                        expect(res).to.have.status(200);
                        expect(res.text).to.equal('Hello World!');
                    });
            });

            it("should create a score and compose an app with a method preHandler and a route get message of 'Hello World!'", function () {
                var scoreConfig = {
                    routers: [{
                        routes: [{

                            methods: {
                                get: {
                                    preHandlers: ['test/modules/handlers/setScopeMessage'],
                                    handlers: ['test/modules/handlers/getScopeMessage']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                return request
                    .get('/')
                    .then(function (res) {
                        expect(res).to.have.status(200);
                        expect(res.text).to.equal('Hello World!');
                    });
            });

            it("should create a score and compose an app with a app preHandler and a route get message of 'Hello World!'", function () {
                var scoreConfig = {
                    preHandlers: ['test/modules/handlers/setScopeMessage'],
                    routers: [{
                        routes: [{

                            methods: {
                                get: {
                                    handlers: ['test/modules/handlers/getScopeMessage']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                return request
                    .get('/')
                    .then(function (res) {
                        expect(res).to.have.status(200);
                        expect(res.text).to.equal('Hello World!');
                    });
            });

            it("should create a score and compose an app with the message 'Hello World!' with a validation schema for 'key'", function () {
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            methods: {
                                get: {
                                    validator: 'test/validators/key',
                                    handlers: ['test/modules/handlers/helloWorld']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                return request
                    .get('/?key=123')
                    .then(function (res) {
                        expect(res).to.have.status(200);
                        expect(res.text).to.equal('Hello World!');
                    });
            });

            it("should create a score and compose an app with a validation schema for 'key'", function () {
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            methods: {
                                get: {
                                    validator: 'test/validators/user',
                                    handlers: ['test/modules/handlers/helloWorld']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                return request
                    .get('/')
                    .then(function (res) {
                        expect(res).to.have.status(400);
                    });
            });

            it("should create a score and compose an app with a router error handler", function () {
                var scoreConfig = {
                    routers: [{
                        errorHandlers: ['test/modules/handlers/sendError'],
                        routes: [{
                            methods: {
                                get: {
                                    handlers: ['test/modules/handlers/throwError']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                return request
                    .get('/')
                    .then(function (res) {
                        expect(res).to.have.status(501);
                    });
            });

            it("should create a score and compose an app with a route error handler", function () {
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            errorHandlers: ['test/modules/handlers/sendError'],
                            methods: {
                                get: {
                                    handlers: ['test/modules/handlers/throwError']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                return request
                    .get('/')
                    .then(function (res) {
                        expect(res).to.have.status(501);
                    });
            });

            it("should create a score and compose an app with a method error handler", function () {
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            methods: {
                                get: {
                                    errorHandlers: ['test/modules/handlers/sendError'],
                                    handlers: ['test/modules/handlers/throwError']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                return request
                    .get('/')
                    .then(function (res) {
                        expect(res).to.have.status(501);
                        expect(res.text).to.equal('oops...');
                    });
            });

            it("should create a score and compose an app with a app error handler", function () {
                var scoreConfig = {
                    errorHandlers: ['test/modules/handlers/sendError'],
                    routers: [{
                        routes: [{
                            methods: {
                                get: {

                                    handlers: ['test/modules/handlers/throwError']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                return request
                    .get('/')
                    .then(function (res) {
                        expect(res).to.have.status(501);
                        expect(res.text).to.equal('oops...');
                    });
            });

        });

    });
}(require, describe, before, it))