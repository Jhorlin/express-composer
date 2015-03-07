/**
 * Created by jhorlin.dearmas on 3/6/2015.
 */
(function (require) {
    "use strict";
    var gulp = require('gulp'),
        mocha = require('gulp-mocha'),
        through = require('through')(function(data){
            this.queue(data);
        }, function(){
            this.emit('end');
        }),
        cover = require('gulp-coverage');

    function srcUnit() {
        return gulp.src('test/**/*.unit.js', {read: false});
    }

    function srcE2E() {
        return gulp.src('test/**/*.e2e.js', {read: false});
    }

    function testUnit(inst) {
        var instrument = inst || through;
        return srcUnit()
            .pipe(instrument)
            .pipe(mocha());
    }

    function testE2E(inst) {
        var instrument = inst || through;
        return srcE2E()
            .pipe(instrument)
            .pipe(mocha())
            .pipe(cover.gather())
            .pipe(cover.format())
            .pipe(gulp.dest('reports'));
    }

    function coverUnit() {
        return testUnit(cover.instrument({
            pattern: ['lib/**/*.js']
        }))
            .pipe(cover.gather())
            .pipe(cover.format())
            .pipe(gulp.dest('reports'));
    }

    function coverE2E() {
        return testE2E(cover.instrument({
            pattern: ['lib/**/*.js']
        }));
    }

    gulp.task('test:unit', function(){
        return testUnit();
    });

    gulp.task('test:e2e', function(){
        return testE2E();
    });

    gulp.task('cover:unit', function(){
        return coverUnit();
    });

    gulp.task('cover:e2e', function(){
        return coverE2E();
    });

    gulp.task('test', ['test:unit', 'test:e2e']);

    gulp.task('cover', ['cover:unit', 'cover:e2e']);

}(require));