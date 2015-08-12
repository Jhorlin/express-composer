/**
 * Created by jhorlin.dearmas on 1/1/2015.
 */
(function (require) {
    "use strict";
    var expressComposer = require('../index'),
        handlers = require('./utils/handlers'),
        joi = require('joi'),
        util = require('util'),
        chai = require('chai'),
        supertest = require('supertest-as-promised'),
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

                    describe("test score created with object", function () {
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
                            request = supertest(app);
                        });

                        it("should respond with " + message, function () {
                            return request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal(message);
                                });
                        });
                    });

                    describe("test score created with array", function () {
                        var app,
                            request,
                            message = "hello world",
                            score = {
                                routers: {
                                    path: path.router,
                                    routes: {
                                        path: path.route,
                                        methods: {
                                            get: {
                                                handlers: handlers.respond(message)[handlerType]
                                            }
                                        }
                                    }
                                }
                            };

                        beforeEach(function () {
                            app = expressComposer();
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should respond with " + message, function () {
                            return request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal(message);
                                });
                        });
                    });
                });

                describe(util.format("test route has access to scope with handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {


                    describe("test score created with array", function () {
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
                            request = supertest(app);
                        });

                        it("should respond with scope variable message: " + message, function () {
                            return request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal(message);
                                });
                        });
                    })

                    describe("test score created with object", function () {
                        var app,
                            request,
                            message = "hello world",
                            score = {
                                routers: {
                                    path: path.router,
                                    routes: {
                                        path: path.route,
                                        methods: {
                                            get: {
                                                handlers: [handlers.setScope('message', message)[handlerType], handlers.respondScope('message')[handlerType]]
                                            }
                                        }
                                    }
                                }
                            };
                        beforeEach(function () {
                            app = expressComposer();
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should respond with scope variable message: " + message, function () {
                            return request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal(message);
                                });
                        });
                    })

                });

                describe(util.format("test route validator for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {


                    describe("test score created with array", function () {
                        var app,
                            request,
                            message = "hello world",
                            schema = joi.object({
                                key: joi.string().required()
                            }),
                            score = {
                                routers: [{
                                    path: path.router,
                                    routes: [{
                                        path: path.route,
                                        methods: {
                                            get: {
                                                validator: schema.validate.bind(schema),
                                                handlers: [handlers.respond(message)[handlerType]]
                                            }
                                        }
                                    }]
                                }]
                            };
                        beforeEach(function () {
                            app = expressComposer();
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should respond with error when validation schema does not match", function () {
                            return request
                                .get(([path.router, path.route].join('') || '/') + '?noMatch=test')
                                .expect(400);
                        });

                        it("should respond with " + message, function () {
                            return request
                                .get(([path.router, path.route].join('') || '/') + '?key=test')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal(message);
                                });
                        });
                    });

                    describe("test score created with object", function () {
                        var app,
                            request,
                            message = "hello world",
                            schema = joi.object({
                                key: joi.string().required()
                            }),
                            score = {
                                routers: {
                                    path: path.router,
                                    routes: {
                                        path: path.route,
                                        methods: {
                                            get: {
                                                validator: schema.validate.bind(schema),
                                                handlers: handlers.respond(message)[handlerType]
                                            }
                                        }
                                    }
                                }
                            };
                        beforeEach(function () {
                            app = expressComposer();
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should respond with error when validation schema does not match", function () {
                            return request
                                .get(([path.router, path.route].join('') || '/') + '?noMatch=test')
                                .expect(400);
                        });

                        it("should respond with " + message, function () {
                            return request
                                .get(([path.router, path.route].join('') || '/') + '?key=test')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal(message);
                                });
                        });
                    });

                });

                describe(util.format("test method error for handlerType:%s routerPath:%s routerPath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {

                    describe("test score created with array", function () {
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
                        beforeEach(function () {
                            app = expressComposer();
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            return request
                                .get([path.router, path.route].join('') || '/')
                                .expect(501)
                        });
                    });
                    describe("test score created with object", function () {
                        var app,
                            message = "oops",
                            request,
                            score = {
                                routers: {
                                    path: path.router,
                                    routes: {
                                        path: path.route,
                                        methods: {
                                            get: {
                                                handlers: handlers.throwError(message)[handlerType],
                                                errorHandlers: handlers.error()[handlerType]
                                            }
                                        }
                                    }
                                }
                            };
                        beforeEach(function () {
                            app = expressComposer();
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            return request
                                .get([path.router, path.route].join('') || '/')
                                .expect(501)
                        });
                    });

                });

                describe(util.format("test route error for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {

                    describe("test score created with array", function () {
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
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(501)
                                .then(function (res) {
                                    expect(res.text).to.equal(message);
                                });
                        });
                    });
                    describe("test score created with object", function () {
                        var app,
                            message = "oops",
                            request,
                            score = {
                                routers: {
                                    path: path.router,
                                    routes: {
                                        path: path.route,
                                        methods: {
                                            get: {
                                                handlers: handlers.throwError(message)[handlerType]
                                            }
                                        },
                                        errorHandlers: handlers.error()[handlerType]
                                    }
                                }

                            };
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(501)
                                .then(function (res) {
                                    expect(res.text).to.equal(message);
                                });
                        });
                    });

                });

                describe(util.format("test route method array handler for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {


                    describe("test score created with array", function () {
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
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });


                        it(util.format("should return the message %s", message), function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal(message);
                                });
                        });
                    });
                    describe("test score created with object", function () {
                        var app,
                            message = "hello world",
                            request,
                            score = {
                                routers: {
                                    path: path.router,
                                    routes: {
                                        path: path.route,
                                        methods: {
                                            get: handlers.respond(message)[handlerType]
                                        }
                                    }
                                }

                            };
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });


                        it(util.format("should return the message %s", message), function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal(message);
                                });
                        });
                    });

                });

                describe(util.format("test router error for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {


                    describe("test score created with array", function () {
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
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(501)
                                .then(function (res) {
                                    expect(res.text).to.equal(message);
                                });
                        });
                    });
                    describe("test score created with object", function () {
                        var app,
                            request,
                            message = "oops",
                            score = {
                                routers: {
                                    path: path.router,
                                    routes: {
                                        path: path.route,
                                        methods: {
                                            get: {
                                                handlers: handlers.throwError(message)[handlerType]
                                            }
                                        }
                                    },
                                    errorHandlers: handlers.error()[handlerType]
                                }
                            };
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(501)
                                .then(function (res) {
                                    expect(res.text).to.equal(message);
                                });
                        });
                    });

                });

                describe(util.format("test app error for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {


                    describe("test score created with array", function () {
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
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });


                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(501)
                                .then(function (res) {
                                    expect(res).to.have.property('text', message);
                                });
                        });
                    });
                    describe("test score created with object", function () {
                        var app,
                            message = "oops",
                            request,
                            score = {
                                errorHandlers: handlers.error()[handlerType],
                                routers: {
                                    path: path.router,
                                    routes: {
                                        path: path.route,
                                        methods: {
                                            get: {
                                                handlers: handlers.throwError(message)[handlerType]
                                            }
                                        }
                                    }
                                }
                            };
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });


                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(501)
                                .then(function (res) {
                                    expect(res).to.have.property('text', message);
                                });
                        });
                    });

                });

                describe(util.format("test method preHandler for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {

                    describe("test score created with array", function () {
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
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res).to.have.property('text', message);
                                });
                        });
                    });
                    describe("test score created with object", function () {
                        var app,
                            message = "hello world",
                            request,
                            score = {
                                routers: {
                                    path: path.router,
                                    routes: {
                                        path: path.route,
                                        methods: {
                                            get: {
                                                handlers: handlers.respondScope("message")[handlerType],
                                                preHandlers: handlers.setScope("message", message)[handlerType]
                                            }
                                        }
                                    }
                                }
                            };
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res).to.have.property('text', message);
                                });
                        });
                    });
                    describe("test score created with object and method as function", function () {
                        var app,
                            message = "hello world",
                            request,
                            score = {
                                routers: {
                                    path: path.router,
                                    routes: {
                                        path: path.route,
                                        methods: {
                                            get: handlers.respond(message)[handlerType]
                                        }
                                    }
                                }
                            };
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res).to.have.property('text', message);
                                });
                        });
                    });
                });

                describe(util.format("test route preHandler for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {


                    describe("test score created with array", function () {
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

                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res).to.have.property('text', message);
                                });
                        });
                    });
                    describe("test score created with object", function () {
                        var app,
                            message = "hello world",
                            request,
                            score = {
                                routers: {
                                    path: path.router,
                                    routes: {
                                        path: path.route,
                                        methods: {
                                            get: {
                                                handlers: handlers.respondScope("message")[handlerType]
                                            }
                                        },
                                        preHandlers: handlers.setScope("message", message)[handlerType]
                                    }
                                }
                            };

                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res).to.have.property('text', message);
                                });
                        });
                    });
                });

                describe(util.format("test router preHandler for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {


                    describe("test score created with array", function () {
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
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res).to.have.property('text', message);
                                });
                        });
                    });
                    describe("test score created with object", function () {
                        var app,
                            message = "hello world",
                            request,
                            score = {
                                routers: {
                                    path: path.router,
                                    routes: {
                                        path: path.route,
                                        methods: {
                                            get: {
                                                handlers: handlers.respondScope("message")[handlerType]
                                            }
                                        }
                                    },
                                    preHandlers: handlers.setScope("message", message)[handlerType]
                                }
                            };
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res).to.have.property('text', message);
                                });
                        });
                    });
                });

                describe(util.format("test app preHandler for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {

                    describe("test score created with array", function () {
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
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res).to.have.property('text', message);
                                });
                        });
                    });
                    describe("test score created with object", function () {
                        var app,
                            message = "hello world",
                            request,
                            score = {
                                preHandlers: handlers.setScope("message", message)[handlerType],
                                routers: {
                                    path: path.router,
                                    routes: {
                                        path: path.route,
                                        methods: {
                                            get: {
                                                handlers: handlers.respondScope("message")[handlerType]
                                            }
                                        }
                                    }
                                }
                            };
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res).to.have.property('text', message);
                                });
                        });
                    });
                });

                describe(util.format("test router preHandler order for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {

                    describe("test score created with array", function () {
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
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res).to.have.property('text', message);
                                });
                        });
                    });
                    describe("test score created with object", function () {
                        var app,
                            message = "hello world",
                            request,
                            score = {
                                routers: {
                                    path: path.router,
                                    scope: {
                                        items: []
                                    },
                                    routes: {
                                        path: path.route,

                                        methods: {
                                            get: {
                                                handlers: [handlers.respondScope("message")[handlerType]]
                                            }
                                        }
                                    },
                                    preHandlers: handlers.setScope("message", message)[handlerType]
                                }

                            };
                        beforeEach(function () {
                            app = expressComposer();
                            expect(app).to.be.ok;
                            app.conduct(score);
                            request = supertest(app);
                        });

                        it("should return the error thrown", function () {
                            request
                                .get([path.router, path.route].join('') || '/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res).to.have.property('text', message);
                                });
                        });
                    });
                });
            });
        });

        describe("test parameters in route", function () {
            var app,
                request;
            beforeEach(function () {
                app = expressComposer();
                request = supertest(app);
            });

            it("should return router param 'routerTest' concatenated with router param 'routeTest' separated by a space", function () {
                app.conduct({
                    routers: {
                        path: '/router/:router',
                        routes: {
                            path: '/route/:route',
                            methods: {
                                get: {
                                    handlers: require('./modules/handlers/concatParams')
                                }
                            }
                        },
                        options: {
                            mergeParams: true
                        }
                    }
                });

                return request.get('/router/routerTest/route/routeTest')
                    .expect(200)
                    .then(function (res) {
                        expect(res.text).to.equal('routerTest routeTest');
                    });
            });
        });

        describe("test nested routers", function () {

            describe("test score as array", function () {
                var app,
                    request,
                    message = "hello world",
                    score = {
                        routers: [{
                            routers: [{
                                path: '/router2',
                                routes: [{
                                    methods: {
                                        get: {
                                            handlers: [handlers.respond(message).promise]
                                        }
                                    }
                                }]
                            }],
                            path: '/router1',
                        }]
                    };

                beforeEach(function () {
                    app = expressComposer();
                    app.conduct(score);
                    request = supertest(app);
                });

                it("should respond with " + message, function () {
                    return request
                        .get('/router1/router2')
                        .expect(200)
                        .then(function (res) {
                            expect(res.text).to.equal(message);
                        });
                });
            });

            describe("test score as object", function () {
                var app,
                    request,
                    message = "hello world",
                    score = {
                        routers: {
                            routers: {
                                path: '/router2',
                                routes: {
                                    methods: {
                                        get: {
                                            handlers: handlers.respond(message).promise
                                        }
                                    }
                                }
                            },
                            path: '/router1',

                        }
                    };

                beforeEach(function () {
                    app = expressComposer();
                    app.conduct(score);
                    request = supertest(app);
                });

                it("should respond with " + message, function () {
                    return request
                        .get('/router1/router2')
                        .expect(200)
                        .then(function (res) {
                            expect(res.text).to.equal(message);
                        });
                });
            });

        });

        describe("test app level routing", function () {
            var app,
                request,
                message = "hello world";

            beforeEach(function () {
                app = expressComposer();
                request = supertest(app);
            });

            describe("score array", function () {
                it("should respond with hello world", function () {
                    var score = {
                        apps: [{
                            routers: [{
                                routes: [{
                                    methods: {
                                        get: {
                                            handlers: [handlers.respond(message).promise]
                                        }
                                    }
                                }]
                            }]
                        }
                        ]
                    }

                    app.conduct(score);
                    return request.get('/').then(function (res) {
                        expect(res).to.have.property('text', message)
                    })
                })

                it("should respond with hello world with a route of '/app'", function () {
                    var score = {
                        apps: [{
                            path: '/app',
                            routers: [{
                                routes: [{
                                    methods: {
                                        get: {
                                            handlers: [handlers.respond(message).promise]
                                        }
                                    }
                                }]
                            }]
                        }
                        ]
                    }

                    app.conduct(score);
                    return request.get('/app').then(function (res) {
                        expect(res).to.have.property('text', message)
                    })
                })

                it("should respond with hello world with a route of '/app' and a vhost of www.yo.com", function () {
                    var score = {
                        apps: [{
                            path: '/app',
                            vhost: 'www.yo.com',
                            routers: [{
                                routes: [{
                                    methods: {
                                        get: {
                                            handlers: [handlers.respond(message).promise]
                                        }
                                    }
                                }]
                            }]
                        }
                        ]
                    }

                    app.conduct(score);
                    return request
                        .get('/app')
                        .set('host', 'www.yo.com')
                        .then(function (res) {
                            expect(res).to.have.property('text', message)
                        })
                })

                it("should respond with hello world with a vhost of www.yo.com", function () {
                    var score = {
                        apps: [{
                            vhost: 'www.yo.com',
                            routers: [{
                                routes: [{
                                    methods: {
                                        get: {
                                            handlers: [handlers.respond(message).promise]
                                        }
                                    }
                                }]
                            }]
                        }
                        ]
                    }

                    app.conduct(score);
                    return request
                        .get('/')
                        .set('host', 'www.yo.com')
                        .then(function (res) {
                            expect(res).to.have.property('text', message)
                        })
                })
            });

            describe("score object", function () {
                it("should respond with hello world", function () {
                    var score = {
                        apps: {
                            routers: {
                                routes: {
                                    methods: {
                                        get: {
                                            handlers: handlers.respond(message).promise
                                        }
                                    }
                                }
                            }
                        }
                    }

                    app.conduct(score);
                    return request.get('/').then(function (res) {
                        expect(res).to.have.property('text', message)
                    })
                })

                it("should respond with hello world with a route of '/app'", function () {
                    var score = {
                        apps: {
                            path: '/app',
                            routers: {
                                routes: {
                                    methods: {
                                        get: {
                                            handlers: [handlers.respond(message).promise]
                                        }
                                    }
                                }
                            }
                        }
                    }

                    app.conduct(score);
                    return request.get('/app').then(function (res) {
                        expect(res).to.have.property('text', message)
                    })
                })

                it("should respond with hello world with a route of '/app' and a vhost of www.yo.com", function () {
                    var score = {
                        apps: {
                            path: '/app',
                            vhost: 'www.yo.com',
                            routers: {
                                routes: {
                                    methods: {
                                        get: {
                                            handlers: handlers.respond(message).promise
                                        }
                                    }
                                }
                            }
                        }
                    }

                    app.conduct(score);
                    return request
                        .get('/app')
                        .set('host', 'www.yo.com')
                        .then(function (res) {
                            expect(res).to.have.property('text', message)
                        })
                })

                it("should respond with hello world with a vhost of www.yo.com", function () {
                    var score = {
                        apps: {
                            vhost: 'www.yo.com',
                            routers: {
                                routes: {
                                    methods: {
                                        get: {
                                            handlers: handlers.respond(message).promise
                                        }
                                    }
                                }
                            }
                        }
                    }

                    app.conduct(score);
                    return request
                        .get('/')
                        .set('host', 'www.yo.com')
                        .then(function (res) {
                            expect(res).to.have.property('text', message)
                        })
                })
            });
        })

        describe("test error chaining", function () {
            var app,
                request,
                message = "oops";

            beforeEach(function () {
                app = expressComposer();
                request = supertest(app);
            });

            describe("array scope", function () {
                var score = {
                    routers: [{
                        preHandlers: [handlers.throwError(message).promise],
                        errorHandlers: [function (err, req, res) {
                            return err;
                        }, handlers.error().promise]
                    }]
                }

                beforeEach(function () {
                    app.conduct(score);
                })

                it("should respond with an error message of " + message, function () {
                    return request
                        .get('/')
                        .then(function (response) {

                        }, function (err) {
                            expect(err.response.text).to.equal(message);
                        })
                })
            });

            describe("object scope", function () {
                var score = {
                    routers: {
                        preHandlers: [handlers.throwError(message).promise],
                        errorHandlers: function (err, req, res) {
                            return err;
                        }
                    },
                    errorHandlers: handlers.error().promise
                }

                beforeEach(function () {
                    app.conduct(score);
                })

                it("should respond with an error message of " + message, function () {
                    return request
                        .get('/')
                        .then(function (response) {

                        }, function (err) {
                            expect(err.response.text).to.equal(message);
                        })
                })
            });
        })

        describe("test consecutive calls", function () {
            var app,
                request,
                message = "hello world";

            beforeEach(function () {
                app = expressComposer();
                request = supertest(app);
            });

            it("should respond with " + message, function () {
                app.conduct({
                    routers: [{
                        routes: [{
                            methods: {
                                get: {
                                    handlers: [handlers.respond(message).promise]
                                }
                            }
                        }]
                    }]
                });
                return request
                    .get('/')
                    .expect(200)
                    .then(function (res) {
                        expect(res.text).to.equal(message);
                        // add delay allow cleanup
                        return Promise.delay(500)
                            .then(function () {
                                return request
                                    .get('/')
                                    .expect(200);
                            })

                    });
            });

            it("should respond with scope variable message: " + message, function () {
                var message = 'yo its me';
                app.conduct({
                    routers: [{
                        scope: {
                            message: message
                        },
                        routes: [{
                            methods: {
                                get: {
                                    handlers: handlers.respondScope('message').promise
                                }
                            }
                        }]
                    }]
                })
                return request
                    .get('/')
                    .expect(200)
                    .then(function (res) {
                        expect(res.text).to.equal(message);
                        // add delay allow cleanup
                        return Promise.delay(500)
                            .then(function () {
                                return request
                                    .get('/')
                                    .expect(200)
                                    .then(function (res) {
                                        expect(res.text).to.equal(message);
                                    })
                            })
                    });
            });
        });
    });
}(require))
