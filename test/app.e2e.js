/**
 * Created by jhorlin.dearmas on 1/1/2015.
 */
(function (require) {
    "use strict";
    var expressComposer = require('../index'),
        handlers = require('./utils/handlers'),
        joi = require('joi'),
        util = require('util'),
        chai = require('./utils/chai'),
        expect = chai.expect;

    describe("Test express composer composition and routes", function () {
        var handlerTypes = ['standard', 'promise', 'callback'],
            paths = [{
                router: undefined,
                route: undefined
            }, {
                router: '/router',
                route: '/route'
            }];

        handlerTypes.forEach(function (handlerType) {
            paths.forEach(function (path) {
                describe(util.format("test that we can create a simple hello world route with handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    var app,
                        request,
                        message = "hello world",
                        score = {
                            routers: [{
                                path: path.router,
                                routes: [{
                                    path: path.route,
                                    methods: {
                                        get: {
                                            handlers: [handlers.respond(message)[handlerType]]
                                        }
                                    }
                                }]
                            }]
                        };

                    beforeEach(function () {
                        app = expressComposer();
                        app.conduct(score);
                        request = chai.request(app);
                    });

                    it("should respond with " + message, function () {
                        return request
                            .get([path.router, path.route].join('') || '/')
                            .then(function (res) {
                                expect(res).to.have.status(200);
                                expect(res.text).to.equal(message);
                            });
                    });
                });

                describe(util.format("test route has access to scope with handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    var app,
                        request,
                        message = "hello world",
                        score = {
                            routers: [{
                                path: path.router,
                                routes: [{
                                    path: path.route,
                                    methods: {
                                        get: {
                                            handlers: [handlers.setScope('message', message)[handlerType], handlers.respondScope('message')[handlerType]]
                                        }
                                    }
                                }]
                            }]
                        };
                    beforeEach(function () {
                        app = expressComposer();
                        app.conduct(score);
                        request = chai.request(app);
                    });

                    it("should respond with scope variable message: " + message, function () {
                        return request
                            .get([path.router, path.route].join('') || '/')
                            .then(function (res) {
                                expect(res).to.have.status(200);
                                expect(res.text).to.equal(message);
                            });
                    });

                });

                describe(util.format("test route validator for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    var app,
                        request,
                        message = "hello world",
                        validator = joi.object({
                            key: joi.any().required()
                        }),
                        score = {
                            routers: [{
                                path: path.router,
                                routes: [{
                                    path: path.route,
                                    methods: {
                                        get: {
                                            validator: validator,
                                            handlers: [handlers.respond(message)[handlerType]]
                                        }
                                    }
                                }]
                            }]
                        };
                    before(function () {
                        app = expressComposer();
                        app.conduct(score);
                        request = chai.request(app);
                    });

                    it("should respond with error when validation schema does not match", function () {
                        return request
                            .get(([path.router, path.route].join('') || '/') + '?noMatch=test')
                            .then(function (res) {
                               expect(res).to.have.status(400);
                            });
                    });

                    it("should respond with " + message, function (done) {
                        return request
                            .get(([path.router, path.route].join('') || '/') + '?key=test')
                            .then(function (res) {
                                expect(res).to.have.status(200);
                                expect(res.text).to.equal(message);
                            });
                    });
                });

                describe(util.format("test method error for handlerType:%s routerPath:%s routerPath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    var app,
                        message = "oops",
                        request,
                        score = {
                            routers: [{
                                path: path.router,
                                routes: [{
                                    path: path.route,
                                    methods: {
                                        get: {
                                            handlers: [handlers.throwError(message)[handlerType]],
                                            errorHandlers: [handlers.error()[handlerType]]
                                        }
                                    }
                                }]
                            }]
                        };
                    before(function () {
                        app = expressComposer();
                        app.conduct(score);
                        request = chai.request(app);
                    });

                    it("should return the error thrown", function (done) {
                        return request
                            .get([path.router, path.route].join('') || '/')
                            .then(function (res) {
                                expect(res).to.have.status(501);
                            });
                    });

                });

                describe(util.format("test route error for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    var app,
                        message = "oops",
                        request,
                        score = {
                            routers: [
                                {
                                    path: path.router,
                                    routes: [{
                                        path: path.route,
                                        methods: {
                                            get: {
                                                handlers: [handlers.throwError(message)[handlerType]]
                                            }
                                        },
                                        errorHandlers: [handlers.error()[handlerType]]
                                    }]
                                }
                            ]
                        };
                    before(function () {
                        app = expressComposer();
                        expect(app).to.be.ok;
                        app.conduct(score);
                        request = chai.request(app);
                    });

                    it("should return the error thrown", function (done) {
                        request
                            .get([path.router, path.route].join('') || '/')
                            .then(function (res) {
                                expect(res).to.have.status(501);
                                expect(res.text).to.equal(message);
                            });
                    });

                });

                describe(util.format("test route method array handler for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    var app,
                        message = "hello world",
                        request,
                        score = {
                            routers: [
                                {
                                    path: path.router,
                                    routes: [{
                                        path: path.route,
                                        methods: {
                                            get: [handlers.respond(message)[handlerType]]
                                        }
                                    }]
                                }
                            ]
                        };
                    before(function () {
                        app = expressComposer();
                        expect(app).to.be.ok;
                        app.conduct(score);
                        request = chai.request(app);
                    });


                    it(util.format("should return the message %s", message), function (done) {
                        request
                            .get([path.router, path.route].join('') || '/')
                            .then(function (res) {
                                expect(res).to.have.status(200);
                                expect(res.text).to.equal(message);
                            });
                    });

                });

                describe(util.format("test router error for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    var app,
                        request,
                        message = "oops",
                        score = {
                            routers: [{
                                path: path.router,
                                routes: [{
                                    path: path.route,
                                    methods: {
                                        get: {
                                            handlers: [handlers.throwError(message)[handlerType]]
                                        }
                                    }
                                }],
                                errorHandlers: [handlers.error()[handlerType]]
                            }]
                        };
                    before(function () {
                        app = expressComposer();
                        expect(app).to.be.ok;
                        app.conduct(score);
                        request = chai.request(app);
                    });

                    it("should return the error thrown", function (done) {
                        request
                            .get([path.router, path.route].join('') || '/')
                            .then(function (res) {
                                expect(res).to.have.status(501);
                                expect(res.text).to.equal(message);
                            });
                    });

                });

                describe(util.format("test app error for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    var app,
                        message = "oops",
                        request,
                        score = {
                            errorHandlers: [handlers.error()[handlerType]],
                            routers: [{
                                path: path.router,
                                routes: [{
                                    path: path.route,
                                    methods: {
                                        get: {
                                            handlers: [handlers.throwError(message)[handlerType]]
                                        }
                                    }
                                }]
                            }]
                        };
                    before(function () {
                        app = expressComposer();
                        expect(app).to.be.ok;
                        app.conduct(score);
                        request = chai.request(app);
                    });


                    it("should return the error thrown", function (done) {
                        var request = supertest(app);
                        request
                            .get([path.router, path.route].join('') || '/')
                            .then(function (res) {
                                expect(res).to.have.status(501);
                                expect(res).to.have.property('text', message);
                            });
                    });

                });

                describe(util.format("test method preHandler for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    var app,
                        message = "hello world",
                        request,
                        score = {
                            routers: [{
                                path: path.router,
                                routes: [{
                                    path: path.route,
                                    methods: {
                                        get: {
                                            handlers: [handlers.respondScope("message")[handlerType]],
                                            preHandlers: [handlers.setScope("message", message)[handlerType]]
                                        }
                                    }
                                }]
                            }]
                        };
                    before(function () {
                        app = expressComposer();
                        expect(app).to.be.ok;
                        app.conduct(score);
                        request = chai.request(app);
                    });

                    it("should return the error thrown", function (done) {
                        request
                            .get([path.router, path.route].join('') || '/')
                            .expect(200)
                            .then(function (res) {
                                expect(res).to.have.status(200);
                                expect(res).to.have.property('text', message);
                            });
                    });
                });

                describe(util.format("test route preHandler for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    var app,
                        message = "hello world",
                        request,
                        score = {
                            routers: [{
                                path: path.router,
                                routes: [{
                                    path: path.route,
                                    methods: {
                                        get: {
                                            handlers: [handlers.respondScope("message")[handlerType]]
                                        }
                                    },
                                    preHandlers: [handlers.setScope("message", message)[handlerType]]
                                }]
                            }]
                        };

                    before(function () {
                        app = expressComposer();
                        expect(app).to.be.ok;
                        app.conduct(score);
                        request = chai.request(app);
                    });

                    it("should return the error thrown", function (done) {
                        request
                            .get([path.router, path.route].join('') || '/')
                            .then(function (res) {
                                expect(res).to.have.status(200);
                                expect(res).to.have.property('text', message);
                            });
                    });
                });

                describe(util.format("test router preHandler for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    var app,
                        message = "hello world",
                        request,
                        score = {
                            routers: [
                                {
                                    path: path.router,
                                    routes: [{
                                        path: path.route,
                                        methods: {
                                            get: {
                                                handlers: [handlers.respondScope("message")[handlerType]]
                                            }
                                        }
                                    }],
                                    preHandlers: [handlers.setScope("message", message)[handlerType]]
                                }
                            ]
                        };
                    before(function () {
                        app = expressComposer();
                        expect(app).to.be.ok;
                        app.conduct(score);
                        request = chai.request(app);
                    });

                    it("should return the error thrown", function (done) {
                        var request = supertest(app);
                        request
                            .get([path.router, path.route].join('') || '/')
                            .then(function (res) {
                                expect(res).to.have.status(200);
                                expect(res).to.have.property('text', message);
                            });
                    });
                });

                describe(util.format("test app preHandler for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    var app,
                        message = "hello world",
                        request,
                        score = {
                            preHandlers: [handlers.setScope("message", message)[handlerType]],
                            routers: [
                                {
                                    path: path.router,
                                    routes: [{
                                        path: path.route,
                                        methods: {
                                            get: {
                                                handlers: [handlers.respondScope("message")[handlerType]]
                                            }
                                        }
                                    }]
                                }
                            ]
                        };
                    before(function () {
                        app = expressComposer();
                        expect(app).to.be.ok;
                        app.conduct(score);
                        request = chai.request(app);
                    });


                    it("should return the error thrown", function (done) {
                        request
                            .get([path.router, path.route].join('') || '/')
                            .then(function (res) {
                                expect(res).to.have.status(200);
                                expect(res).to.have.property('text', message);
                            });
                    });
                });

                describe(util.format("test router preHandler order for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    var app,
                        message = "hello world",
                        request,
                        score = {
                            routers: [
                                {
                                    path: path.router,
                                    scope: {
                                        items: []
                                    },
                                    routes: [{
                                        path: path.route,

                                        methods: {
                                            get: {
                                                handlers: [handlers.respondScope("message")[handlerType]]
                                            }
                                        }
                                    }],
                                    preHandlers: [handlers.setScope("message", message)[handlerType]]
                                }
                            ]
                        };
                    before(function () {
                        app = expressComposer();
                        expect(app).to.be.ok;
                        app.conduct(score);
                        request = chai.request(app);
                    });

                    it("should return the error thrown", function (done) {
                        request
                            .get([path.router, path.route].join('') || '/')
                            .then(function (res) {
                                expect(res).to.have.status(200);
                                expect(res).to.have.property('text', message);
                            });
                    });
                });
            });
        });
    });
}(require))