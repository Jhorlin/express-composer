/**
 * Created by jhorlin.dearmas on 3/6/2015.
 */
(function (require) {
    "use strict";
    var gulp = require('gulp'),
        mocha = require('gulp-mocha');
    gulp.task('test:unit', function () {
        return gulp.src('test/**/*.unit.js', {read: false})
            .pipe(mocha());
    });

    gulp.task('test:e2e', function () {
        return gulp.src('test/**/*.e2e.js', {read: false})
            .pipe(mocha());
    });

    gulp.task('test',['test:unit', 'test:e2e']);

}(require));