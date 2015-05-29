/**
 * Created by jhorlin.dearmas on 5/29/2015.
 */
(function (require) {
    "use strict";
    var expressComposer = require('../index'),
        handlers = require('./utils/handlers'),
        joi = require('joi'),
        util = require('util'),
        chai = require('./utils/chai'),
        expect = chai.expect;

    describe.only("test that we set the results property for named functions",function(){
        var app,
        request,
        message = "hello world",
        score = {
            routers: {
                preHandlers: function messageHandler(rea, res){
                    return message;
                },
                routes: {
                    methods: {
                        get: {
                            handlers: function(req, res){
                                res.send(this.results.messageHandler);
                            }
                        }
                    }
                }
            }
        };

        beforeEach(function () {
            app = expressComposer();
            app.conduct(score);
            request = chai.request(app);
        });

        it('should respond with ' + message, function(){
            return request
                .get('/')
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res.text).to.equal(message);
                });
        });

    });



}(require))