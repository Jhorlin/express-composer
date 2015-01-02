/**
 * Created by jhorlin.dearmas on 1/1/2015.
 */
(function (expressComposer, should, supertest, handlers, joi) {
    describe("Test express composer composition and routes", function () {
        var handlerTypes = ['standard', 'promise', 'callback'];
        handlerTypes.forEach(function (handlerType) {
            describe("test that we can create a simple hello world route with handlerType " + handlerType, function () {
                var app,
                    message = "hello world"
                before(function () {
                    app = expressComposer();
                    should.exist(app);
                });
                it("should compose a route with a base path of '/'", function () {
                    app.compose({
                        routes: [{
                            methods: {
                                get: {
                                    handlers: [handlers.respond(message)[handlerType]]
                                }
                            }
                        }]
                    });
                });

                it("should respond with " + message, function (done) {
                    var request = supertest(app);
                    request
                        .get('/')
                        .expect(200)
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            try {
                                res.text.should.eql(message);
                                done();
                            } catch (e) {
                                done(e);
                            }
                        });
                });
            });

            describe("test route has access to scope with handlerType " + handlerType, function () {
                var app,
                    message = "hello world";
                before(function () {
                    app = expressComposer();
                    should.exist(app);
                });

                it("should create handler and set a scope message", function () {
                    app.compose({
                        routes: [{
                            methods: {
                                get: {
                                    handlers: [handlers.setScope('message', message)[handlerType], handlers.respondScope('message')[handlerType]]
                                }
                            }
                        }]
                    });
                });

                it("should respond with scope variable message: " + message, function (done) {
                    var request = supertest(app);
                    request
                        .get('/')
                        .expect(200)
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            try {
                                res.text.should.eql(message);
                                done();
                            } catch (e) {
                                done(e);
                            }
                        });
                });

            });

            describe("test route validator for handlerType " + handlerType, function () {
                var app,
                    message = "hello world",
                    validator = joi.object({
                        key: joi.any().required()
                    });
                before(function () {
                    app = expressComposer();
                    should.exist(app);
                });

                it("should compose a route with a base path of '/'", function () {
                    app.compose({
                        routes: [{
                            methods: {
                                get: {
                                    validator: validator,
                                    handlers: [handlers.respond(message)[handlerType]]
                                }
                            }
                        }]
                    });
                });

                it("should respond with error when validation schema does not match", function (done) {
                    var request = supertest(app);
                    request
                        .get('/?noMatch=test')
                        .expect(400)
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            done();
                        });
                });

                it("should respond with " + message, function (done) {
                    var request = supertest(app);
                    request
                        .get('/?key=test')
                        .expect(200)
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            try {
                                res.text.should.eql(message);
                                done();
                            } catch (e) {
                                done(e);
                            }
                        });
                });
            });

           // describe("")

        });
    });
}(require('../index'), require('should'), require('supertest'), require('./utils/handlers'), require('joi')))