(function () {
    'use strict';
    var gulp = require('gulp'),
        cover = require('gulp-coverage'),
        exit = require('gulp-exit'),
        mocha = require('gulp-mocha'),
        docjs2md = require('gulp-jsdoc-to-markdown'),
        concat = require('gulp-concat'),
        coveralls = require('gulp-coveralls'),
        fs = require('fs'),
        gutil = require('gulp-util'),
        streamProcessors,
        runSequence = require('run-sequence'),
        paths = {
            src: ['./index.js', 'lib/**/*.js'],
            unit: ['test/**/*.unit.js'],
            e2e:['test/**/*.e2e.js'],
            lcov: ['reports/coverage.lcov']
        };

    gulp.task('exit', function () {
        streamProcessors.push(exit());
    });

    gulp.task('src', function () {
        streamProcessors = [gulp.src(paths.src)];
    });

    gulp.task('lcov', function () {
        streamProcessors = [gulp.src(paths.lcov)];
    });

    gulp.task('unit', function () {
        streamProcessors = [gulp.src(paths.unit)];
    });

    gulp.task('e2e', function () {
        streamProcessors = [gulp.src(paths.e2e)];
    });

    gulp.task('unit:e2e', function(){
        streamProcessors = [gulp.src(paths.e2e.concat(paths.unit))];
    })

    gulp.task('process', function () {
        var stream = streamProcessors.shift();
        return streamProcessors.reduce(function (stream, processor) {
            return stream.pipe(processor);
        }, stream);
    });

    gulp.task('coveralls', function () {
        var errored = false;
        streamProcessors.push(coveralls()
                .on('error', function (err) {
                    errored = true;
                    gutil.log("coveralls failed:", err.message);
                })
                .on('end', function () {
                    if (errored) {
                        process.exit(0);
                    }
                })
        );
    });

    gulp.task('mocha', function () {
        var errored = false;
        streamProcessors.push(mocha()
                .on('error', function (err) {
                    errored = true;
                    gutil.log("mocha failed:", err.message);
                })
                .on('end', function () {
                    if (errored) {
                        process.exit(0);
                    }
                })
        );
        return streamProcessors;
    })

    gulp.task('instrument', function () {
        return streamProcessors.push(cover.instrument({pattern: paths.src}));
    });


    gulp.task('gather', function () {
        return streamProcessors.push(cover.gather());
    });

    gulp.task('enforce', function () {
        return streamProcessors.push(cover.enforce({
            statements: 80,
            blocks: 80,
            lines: 80,
            uncovered: undefined
        })
            .on('error', function (err) {
                gutil.log("enforce failed:", err.message);
            }));
    })

    gulp.task('format', function () {
        return streamProcessors.push(cover.format([
            {reporter: 'html'},
            {reporter: 'lcov'}
        ]));
    });

    gulp.task('report', function () {
        return streamProcessors.push(gulp.dest('reports'));
    });

    gulp.task('docjs2md', function () {
        streamProcessors.push(concat("README.md"));
        streamProcessors.push(docjs2md({template: fs.readFileSync("docjs2md/README.hbs", "utf8")})
                .on('error', function (err) {
                    gutil.log("jsdoc2md failed:", err.message);
                })
        );
        streamProcessors.push(gulp.dest("."));
    })

    /************* TASKS ******************/
    gulp.task('test:unit', ['unit', 'mocha', 'process']);
    gulp.task('test:e2e', ['e2e', 'mocha', 'process']);
    gulp.task('test', ['unit:e2e', 'mocha', 'process']);
    gulp.task('cover', ['unit:e2e', 'instrument', 'mocha', 'gather', 'format', 'report', 'enforce', 'process'], function () {
        return runSequence(['lcov', 'coveralls','exit','process']);
    });
    gulp.task('doc', ['src', 'docjs2md', 'process']);
    /**************************************/

    gulp.task('default', ['cover']);

}())