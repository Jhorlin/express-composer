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

                });

                describe(util.format("test route validator for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
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

                describe(util.format("test router preHandler for handlerType:%s routerPath:%s routePath:%s",
                    handlerType, path.router || 'Default', path.route || 'Default'), function () {
                    this.timeout(100000);
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

        describe("test parameters in route", function(){
           var app,
               request;
            beforeEach(function(){
                app = expressComposer();
                request = supertest(app);
            });

            it("should return router param 'routerTest' concatenated with router param 'routeTest' separated by a space", function(){
               app.conduct({
                   routers:{
                       path:'/router/:router',
                       routes:{
                           path:'/route/:route',
                           methods:{
                               get:{
                                   handlers: require('./modules/handlers/concatParams')
                               }
                           }
                       }
                   }
               });

                return request.get('/router/routerTest/route/routeTest')
                    .expect(200)
                    .then(function(res){
                        expect(res.text).to.equal('routerTest routeTest');
                    });
            });
        });
    });
}(require))