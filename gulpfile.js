/**
 * Created by jhorlin.dearmas on 3/6/2015.
 */
(function (require) {
    "use strict";
    var gulp = require('gulp'),
        mocha = require('gulp-mocha'),
        through = require('through2'),
        passThrough = through.obj(function(file, enc, cb){
            cb(null, file);
        }),
        runSequence = require('run-sequence').use(gulp),
        cover = require('gulp-coverage'),
        watch = require('gulp-watch');

    function srcUnit() {
        return gulp.src('test/**/*.unit.js', {read: false});
    }

    function srcE2E() {
        return gulp.src('test/**/*.e2e.js', {read: false});
    }

    function testUnit(inst) {
        var instrument = inst || passThrough;
        return srcUnit()
            .pipe(instrument)
            .pipe(mocha());
    }

    function testE2E(inst) {
        var instrument = inst || passThrough;
        return srcE2E()
            .pipe(instrument)
            .pipe(mocha());
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
        }))
            .pipe(cover.gather())
            .pipe(cover.format())
            .pipe(gulp.dest('reports'));
    }

    gulp.task('test:unit', function () {
        return testUnit();
    });

    gulp.task('test:e2e', function () {
        return testE2E();
    });

    gulp.task('cover:unit', function () {
        return coverUnit();
    });

    gulp.task('cover:e2e', function () {
        return coverE2E();
    });

    gulp.task('watch:unit', function () {
        return srcUnit()
            .pipe(watch('test/**/*.unit.js'))
            .pipe(through(function (data) {
                this.queue(testUnit());
            }, function () {
                this.emit('end');
            }))
            ;
    });

    gulp.task('watch:e2e', function () {
        this.watch('test/**/*.e2e.js',['test:e2e']);
    });

    gulp.task('watch', ['watch:unit', 'watch:e2e']);

    gulp.task('test', ['test:unit', 'test:e2e']);

    gulp.task('cover', ['cover:unit', 'cover:e2e']);

}(require));