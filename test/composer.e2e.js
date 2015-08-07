/**
 * Created by jhorlin.dearmas on 8/6/2015.
 */

(function (require) {
    var expressComposer = require('../index'),
        chai = require('chai'),
        superTest = require('supertest-as-promised'),
        Promise = require('bluebird'),
        expect = chai.expect;

    describe("test composer", function () {
        ['compose', 'composeSync'].forEach(function(method){
            describe("test default scoreFactory " + method, function () {
                var scoreFactory,
                    app,
                    request;
                before(function () {
                    scoreFactory = expressComposer.composer();
                    scoreFactory.initialize();
                });

                beforeEach(function () {
                    app = expressComposer();
                    request = superTest(app);
                });

                describe('array', function () {
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            expect(score).to.be.ok;
                        });
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

                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/?key=123')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(400);
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(501);
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
                        var score = scoreFactory.composeSync(scoreConfig);
                        app.conduct(score);
                        return request
                            .get('/')
                            .expect(501);
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(501)
                                .then(function (res) {
                                    expect(res.text).to.equal('oops...');
                                });
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(501)
                                .then(function (res) {
                                    expect(res.text).to.equal('oops...');
                                });
                        });

                    });

                    it("should create a score and compose an app with an app that message 'Hello World!'", function () {
                        var scoreConfig = {
                            apps: [{
                                routers: [{
                                    routes: [{
                                        methods: {
                                            get: {
                                                handlers: ['test/modules/handlers/helloWorld']
                                            }
                                        }
                                    }]
                                }]
                            }]
                        };
                        return Promise.resolve(scoreFactory[method](scoreConfig))
                            .then(function (score) {
                                app.conduct(score);
                                return request
                                    .get('/')
                                    .expect(200)
                                    .then(function (res) {
                                        expect(res.text).to.equal('Hello World!');
                                    });
                            })
                    });
                });

                describe('object', function () {
                    it("should create a score", function () {
                        var scoreConfig = {
                            routers: {
                                routes: {
                                    methods: {
                                        get: {
                                            handlers: 'test/modules/handlers/getScopeMessage'
                                        }
                                    }
                                }
                            }
                        };
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            expect(score).to.be.ok;
                        });
                    });

                    it("should create a score and compose an app with the message 'Hello World!'", function () {
                        var scoreConfig = {
                            routers: {
                                routes: {
                                    methods: {
                                        get: {
                                            handlers: ['test/modules/handlers/helloWorld']
                                        }
                                    }
                                }
                            }
                        };

                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
                        });
                    });

                    it("should create a score and compose an app with a router preHandler and a route get message of 'Hello World!'", function () {
                        var scoreConfig = {
                            routers: {
                                preHandlers: 'test/modules/handlers/setScopeMessage',
                                routes: {
                                    methods: {
                                        get: {
                                            handlers: 'test/modules/handlers/getScopeMessage'
                                        }
                                    }
                                }
                            }
                        };
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
                        });

                    });

                    it("should create a score and compose an app with a route preHandler and a route get message of 'Hello World!'", function () {
                        var scoreConfig = {
                            routers: {
                                routes: {
                                    preHandlers: 'test/modules/handlers/setScopeMessage',
                                    methods: {
                                        get: {
                                            handlers: 'test/modules/handlers/getScopeMessage'
                                        }
                                    }
                                }
                            }
                        };
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/?key=123')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(400);
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(501);
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
                        var score = scoreFactory.composeSync(scoreConfig);
                        app.conduct(score);
                        return request
                            .get('/')
                            .expect(501);
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
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(501)
                                .then(function (res) {
                                    expect(res.text).to.equal('oops...');
                                });
                        });
                    });

                    it("should create a score and compose an app with a app error handler", function () {
                        var scoreConfig = {
                            errorHandlers: ['test/modules/handlers/sendError'],
                            routers: {
                                routes: {
                                    methods: {
                                        get: {

                                            handlers: ['test/modules/handlers/throwError']
                                        }
                                    }
                                }
                            }
                        };
                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(501)
                                .then(function (res) {
                                    expect(res.text).to.equal('oops...');
                                });
                        });

                    });

                    it("should create a score and compose an app with an app that message 'Hello World!'", function () {
                        var scoreConfig = {
                            apps: {
                                routers: {
                                    routes: {
                                        methods: {
                                            get: {
                                                handlers: 'test/modules/handlers/helloWorld'
                                            }
                                        }
                                    }
                                }
                            }
                        };
                        return Promise.resolve(scoreFactory[method](scoreConfig))
                            .then(function (score) {
                                app.conduct(score);
                                return request
                                    .get('/')
                                    .expect(200)
                                    .then(function (res) {
                                        expect(res.text).to.equal('Hello World!');
                                    });
                            })
                    });
                });

                describe('test scope', function(){
                    it("get the message 'Hello World!' from app scope", function () {
                        var scoreConfig = {
                            scope:'test/modules/scopes/message',
                            routers: {
                                routes: {
                                    methods: {
                                        get: {
                                            handlers: 'test/modules/handlers/getScopeMessage'
                                        }
                                    }
                                }
                            }
                        };

                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
                        });
                    });

                    it("get the message 'Hello World!' from router scope", function () {
                        var scoreConfig = {
                            routers: {
                                scope:'test/modules/scopes/message',
                                routes: {
                                    methods: {
                                        get: {
                                            handlers: 'test/modules/handlers/getScopeMessage'
                                        }
                                    }
                                }
                            }
                        };

                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
                        });
                    });
                    it("get the message 'Hello World!' from route scope", function () {
                        var scoreConfig = {
                            routers: {
                                routes: {
                                    scope:'test/modules/scopes/message',
                                    methods: {
                                        get: {
                                            handlers: 'test/modules/handlers/getScopeMessage'
                                        }
                                    }
                                }
                            }
                        };

                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
                        });
                    });

                    it("get the message 'Hello World!' from method scope", function () {
                        var scoreConfig = {
                            routers: {
                                routes: {
                                    methods: {
                                        get: {
                                            scope:'test/modules/scopes/message',
                                            handlers: 'test/modules/handlers/getScopeMessage'
                                        }
                                    }
                                }
                            }
                        };

                        return Promise.resolve(scoreFactory[method](scoreConfig)).then(function (score) {
                            app.conduct(score);
                            return request
                                .get('/')
                                .expect(200)
                                .then(function (res) {
                                    expect(res.text).to.equal('Hello World!');
                                });
                        });
                    });

                })
            });
        });
    });

}(require));

