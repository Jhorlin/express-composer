/**
 * Created by jhorlin.dearmas on 1/1/2015.
 */
(function (require) {
    "use strict";
    var expressComposer = require('../index'),
        handlers = require('./utils/handlers'),
        joi = require('joi'),
        util = require('util'),
        Promise = require('bluebird'),
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

        describe('test named function that do not return a result are not added to a scopes result', function () {
            var app,
                request;
            beforeEach(function () {
                app = expressComposer();
                request = supertest(app);
            });

            it("should return router param 'routerTest' concatenated with router param 'routeTest' separated by a space", function () {
                app.conduct({
                    routers: {
                        routes: {
                            methods: {
                                get: {
                                    handlers: [function undefinedValue (req, res) {
                                        return;
                                    },
                                        function (req, res) {
                                            return res.send(this.results.undefinedValue);
                                        }]
                                }
                            }
                        },
                        options: {
                            mergeParams: true
                        }
                    }
                });

                return request.get('/')
                    .expect(200)
                    .then(function (res) {
                        expect(res.text).to.equal("");
                    });
            });
        })

        describe('test a handler array does not continue when the first handler responds', function () {
            var app,
                message = 'hello world',
                request;
            beforeEach(function () {
                app = expressComposer();
                request = supertest(app);
            });

            it("should return a message of " + message, function () {
                app.conduct({
                    routers: {
                        routes: {
                            methods: {
                                get: {
                                    handlers: [function sendNow (req, res) {
                                        res.send(message);
                                    },
                                        function (req, res) {
                                            return res.send('oops');
                                        }]
                                }
                            }
                        },
                        options: {
                            mergeParams: true
                        }
                    }
                });

                return request.get('/')
                    .expect(200)
                    .then(function (res) {
                        expect(res.text).to.equal(message);
                    });
            });
        })

        describe('test a error handler array', function () {
            var app,
                message = 'oops',
                request;
            beforeEach(function () {
                app = expressComposer();
                request = supertest(app);
            });

            it("should return as soon as the first error handler responds", function () {
                app.conduct({
                    routers: {
                        routes: {
                            methods: {
                                get: {
                                    handlers: [function (req, res) {
                                        throw new Error(message);
                                    }],
                                    errorHandlers: [function (err, req, res) {
                                        res.status(500).send(err.message);
                                    }, function (err) {
                                        res.status(501).send('not the right message');
                                    }]
                                }
                            }
                        },
                        options: {
                            mergeParams: true
                        }
                    }
                });

                return request.get('/')
                    .expect(500)
                    .then(function (res) {
                        expect(res.text).to.equal(message);
                    });
            });

            it("should continue to propagate the error up even if an error throws an exception ", function () {
                app.conduct({
                    routers: {
                        routes: {
                            methods: {
                                get: {
                                    handlers: [function (req, res) {
                                        throw new Error(message);
                                    }],
                                    errorHandlers: [function message (err) {
                                        return err.message
                                    },
                                        function (err) {
                                            throw new Error("not handled within an error");
                                        }]
                                }
                            }
                        },
                        errorHandlers: function (err, req, res) {
                            res.status(500).send(err.message);
                        }
                    }
                });

                return request.get('/')
                    .expect(500)
                    .then(function (res) {
                        expect(res.text).to.equal(message);
                    });
            });

            it("should continue to propagate the error even if an error throws an exception ", function () {
                app.conduct({
                    routers: {
                        routes: {
                            methods: {
                                get: {
                                    handlers: [function (req, res) {
                                        throw new Error(message);
                                    }],
                                    errorHandlers: [function message (err) {
                                        return err.message
                                    },
                                        function (err) {
                                            throw new Error("not handled within an error");
                                        },
                                        function (err, req, res) {
                                            res.status(500).send(this.errors.message);
                                        }]
                                }
                            }
                        },
                        options: {
                            mergeParams: true
                        }
                    }
                });

                return request.get('/')
                    .expect(500)
                    .then(function (res) {
                        expect(res.text).to.equal(message);
                    });
            });

            it("should set scope.errors", function () {
                app.conduct({
                    routers: {
                        routes: {
                            methods: {
                                get: {
                                    handlers: [function (req, res) {
                                        throw new Error(message);
                                    }],
                                    errorHandlers: [function message (err) {
                                        return err.message
                                    }, function (err, req, res) {
                                        res.status(500).send(this.errors.message);
                                    }]
                                }
                            }
                        },
                        options: {
                            mergeParams: true
                        }
                    }
                });

                return request.get('/')
                    .expect(500)
                    .then(function (res) {
                        expect(res.text).to.equal(message);
                    });
            });

        })

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

        describe('test validator of a route', function () {

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
        });

        describe('test merge parameters as default', function () {
            var app,
                request;
            beforeEach(function () {
                app = expressComposer();
                request = supertest(app);
            });
            it("should have merged parameters by default", function () {
                var message = 'myMessage';
                app.conduct({
                    routers: {
                        path: '/router/:merged',
                        routes: {
                            methods: {
                                get: {
                                    handlers: function (req, res) {
                                        res.send(req.params.merged);
                                    }
                                }
                            }
                        }
                    }
                })

                return request
                    .get('/router/' + message)
                    .expect(200)
                    .then(function (res) {
                        expect(res.text).to.equal(message);
                    });
            });

            it("should have merged parameters by default for nested routers", function () {
                var message = 'myMessage';
                app.conduct({
                    routers: {
                        path: '/router',
                        routers: {
                            path: '/:merged',
                            routes: {
                                methods: {
                                    get: {
                                        handlers: function (req, res) {
                                            res.send(req.params.merged);
                                        }
                                    }
                                }
                            }
                        }
                    }
                })

                return request
                    .get('/router/' + message)
                    .expect(200)
                    .then(function (res) {
                        expect(res.text).to.equal(message);
                    });
            });

        });

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

        describe("test parallel requests", function () {
            var app,
                request;

            before(function () {
                app = expressComposer();
                app.conduct({
                    routers: {
                        routes: {
                            path: '/:num',
                            preHandlers: function number (req) {
                                return req.params.num
                            },
                            methods: {
                                get: function (req, res, err) {
                                    var self = this;
                                    setTimeout(function () {
                                        res.send(self.results.number)
                                    }, Math.floor(Math.random() * 1000))
                                }
                            }
                        }
                    }
                });
                request = supertest(app);
            })

            it('should respond with a random number in a random amout of time less than 500ms', function () {
                var promises = []
                for (var i = 0; i < 10; ++i) {
                    promises.push((function (number) {
                        return request.get('/' + number)
                            .expect(200)
                            .then(function (response) {
                                expect(response.text).to.eql(number.toString())
                            })
                    }(Math.floor(Math.random() * 1000))));

                }
                return Promise.all(promises);
            })
        })
    });
}(require))
