/**
 * Created by jhorlin.dearmas on 12/31/2014.
 */
(function (expressComposer, supertest, should, handlers) {
    describe("test composer app", function () {

        describe("Create base path", function () {
            var app;
            before(function(){
               app = expressComposer();
                should.exist(app);
            });

            it("should create a base path of '/' ", function(){
               app.compose({
                   routes:[{
                       methods:{
                           get:{
                               handlers:[handlers.respond('hello world').standard]
                           }
                       }
                   }]
               });
            });

        });

    });


}(require('./../index'), require('supertest'), require('should'), require('./utils/handlers')));