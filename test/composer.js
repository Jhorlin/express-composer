/**
 * Created by jhorlin.dearmas on 1/14/2015.
 */
(function (expressComposer, should, supertest) {
    describe("test composer", function () {
        describe("test instantiation of default factory", function () {
            var scoreFactory;
            before(function () {
                scoreFactory = expressComposer.composer.defaultFactory();
            });

            it("should create an instance of default composer", function () {
                should.exist(scoreFactory);
            });

        });

        describe("test default scoreFactory initialization", function () {
            var scoreFactory;
            before(function () {
                scoreFactory = expressComposer.composer.defaultFactory();
            });

            it("should create an instance of default composer", function (done) {
                scoreFactory.ready(function () {
                    done();
                }, done);
                scoreFactory.initialize('/', '/', '/');
            });
        });

        describe("test default scoreFactory syncResolver", function () {
            var scoreFactory,
                app,
                request;
            before(function () {
                scoreFactory = expressComposer.composer.defaultFactory();
                scoreFactory.initialize('../test/modules/handlers', '../test/modules/schemas', '../test/modules/scopes');
            });

            beforeEach(function () {
                app = expressComposer();
                request = supertest(app);
            });

            it("should create a score", function () {
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            methods: {
                                get: {
                                    handlers: ['getScopeMessage']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                should.exist(score);
            });

            it("should create a score and compose an app with the message 'Hello World!'", function (done) {
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            methods: {
                                get: {
                                    handlers: ['helloWorld']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                request
                    .get('/')
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        try {
                            res.text.should.eql('Hello World!');
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });

            it("should create a score and compose an app with a router preHandler and a route get message of 'Hello World!'", function(done){
                var scoreConfig = {
                    routers: [{
                        preHandlers:['setScopeMessage'],
                        routes: [{
                            methods: {
                                get: {
                                    handlers: ['getScopeMessage']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                request
                    .get('/')
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        try {
                            res.text.should.eql('Hello World!');
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });

            it("should create a score and compose an app with a route preHandler and a route get message of 'Hello World!'", function(done){
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            preHandlers:['setScopeMessage'],
                            methods: {
                                get: {
                                    handlers: ['getScopeMessage']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                request
                    .get('/')
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        try {
                            res.text.should.eql('Hello World!');
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });

            it("should create a score and compose an app with the message 'Hello World!' with a validation schema for 'key'", function (done) {
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            methods: {
                                get: {
                                    validator:'keyParam',
                                    handlers: ['helloWorld']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                request
                    .get('/?key=123')
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        try {
                            res.text.should.eql('Hello World!');
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });

            it("should create a score and compose an app with a validation schema for 'key'", function (done) {
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            methods: {
                                get: {
                                    validator:'keyParam',
                                    handlers: ['helloWorld']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                request
                    .get('/')
                    .expect(400)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        try {
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });

            it("should create a score and compose an app with a router error handler", function(done){
                var scoreConfig = {
                    routers: [{
                        errorHandlers:['sendError'],
                        routes: [{
                            methods: {
                                get: {
                                    handlers: ['throwError']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                request
                    .get('/')
                    .expect(501)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        try {
                            res.text.should.equal('oops...');
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });

            it("should create a score and compose an app with a route error handler", function(done){
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            errorHandlers:['sendError'],
                            methods: {
                                get: {
                                    handlers: ['throwError']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                request
                    .get('/')
                    .expect(501)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        try {
                            res.text.should.equal('oops...');
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });

            it("should create a score and compose an app with a method error handler", function(done){
                var scoreConfig = {
                    routers: [{
                        routes: [{
                            methods: {
                                get: {
                                    errorHandlers:['sendError'],
                                    handlers: ['throwError']
                                }
                            }
                        }]
                    }]
                };
                var score = scoreFactory.composeAppSync(scoreConfig);
                app.conduct(score);
                request
                    .get('/')
                    .expect(501)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        try {
                            res.text.should.equal('oops...');
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });

        });

    });
}(require('../index'), require('should'), require('supertest')))