/**
 * Created by jhorlin.dearmas on 6/4/2015.
 */
(function () {
    'use strict';
    var gulp = require('gulp'),
        path = require('path'),
        runSequence = require('run-sequence').use(gulp),
        coveralls = require('gulp-coveralls'),
        cover = require('gulp-coverage'),
        jshint = require('gulp-jshint'),
        eslint = require('gulp-eslint'),
        stylish = require('jshint-stylish'),
        jsinspect = require('gulp-jsinspect'),
        nsp = require('gulp-nsp'),
        jscs = require('gulp-jscs'),
        docjs2md = require('gulp-jsdoc-to-markdown'),
        fs = require('fs'),
        mocha = require('gulp-mocha'),
        buddy = require('gulp-buddy.js'),
        concat = require('gulp-concat'),
        expect = require('gulp-expect-file'),
        paths = {
            src: ['lib/**/*.js'],
            unit: 'test/**/*.unit.js',
            e2e: 'test/**/*.e2e.js',
            lcov: 'reports/coverage.lcov'
        },
        streamProcessors;

    gulp.task('process', function (done) {
        var stream = streamProcessors.shift();
        return streamProcessors.reduce(function (stream, processor) {
            return stream.pipe(processor
                    .on('error', function (err) {
                        done(err);
                    })
            );
        }, stream);

    });

    gulp.task('unit', function () {
        streamProcessors = [gulp.src(paths.unit)];
    })

    gulp.task('e2e', function () {
        streamProcessors = [gulp.src(paths.e2e)];
    })

    gulp.task('src', function () {
        streamProcessors = [gulp.src(paths.src)];
    })

    gulp.task('e2e:unit', function () {
        streamProcessors = [gulp.src([paths.e2e, paths.unit])];
    })

    gulp.task('mocha', function () {
        streamProcessors.push(mocha());
    })

    gulp.task('jsinspect', function () {
        streamProcessors.push(jsinspect());
    });

    gulp.task('buddy', function () {
        streamProcessors.push(buddy());
    });

    gulp.task('jshint', function () {
        streamProcessors.push(jshint());
        streamProcessors.push(jshint.reporter(stylish));
    });

    gulp.task('eslint', function () {
        streamProcessors.push(eslint());
        streamProcessors.push(eslint.format());
        streamProcessors.push(eslint.failAfterError());
    });

    gulp.task('instrument', function () {
        streamProcessors.push(cover.instrument({pattern: paths.src}));
    });

    gulp.task('gather', function () {
        streamProcessors.push(cover.gather());
    });

    gulp.task('enforce', function () {
        streamProcessors.push(cover.enforce({
                statements: 99,
                blocks: 100,
                lines: 100,
                uncovered: undefined
            })
        )
    });

    gulp.task('report', function () {
        streamProcessors.push(gulp.dest('reports'));
    });

    gulp.task('format', function () {
        streamProcessors.push(cover.format([
            {reporter: 'html'},
            {reporter: 'lcov'}
        ]));
    });

    gulp.task('coveralls', function () {
        streamProcessors.push(coveralls());
    });

    gulp.task('inspect', ['src', 'jsInspect', 'process']);

    gulp.task('nsp', function (done) {
        nsp({
            path: './package.json'
        }, done);
    });

    gulp.task('jscs', function () {
        streamProcessors.push(jscs());
    });

    gulp.task('lcov', function () {
        streamProcessors = [gulp.src(paths.lcov)];
        // coveralls doesn't check that the file exists so we want to check that it does
        streamProcessors.push(expect(paths.lcov));
    });

    gulp.task('docjs2md', function () {
        streamProcessors = [];
        streamProcessors.push(concat("README.md"));
        streamProcessors.push(docjs2md({template: fs.readFileSync("docjs2md/README.hbs", "utf8")}));
        streamProcessors.push(gulp.dest("."));
    })

    gulp.task('track', ['lcov', 'coveralls', 'process']);

    /** tasks **/

    gulp.task('test:unit', ['unit', 'mocha', 'process']);

    gulp.task('test:e2e', ['e2e', 'mocha', 'process']);

    gulp.task('test', function () {
        return runSequence(['test:unit', 'test:e2e']);
    });

    gulp.task('test', ['e2e:unit', 'mocha', 'process']);

    gulp.task('quality', ['src', 'buddy', 'jsinspect', 'process']);

    gulp.task('secure', ['nsp']);

    gulp.task('doc', ['src', 'docjs2md', 'process']);

    gulp.task('style', ['src', 'eslint', 'jshint', 'jscs', 'process']);

    gulp.task('cover', ['e2e:unit', 'instrument', 'mocha', 'gather', 'format', 'report', 'enforce', 'process']);

    gulp.task('travis', function () {
        return runSequence('cover'/*,'quality'*/, 'secure', 'style', 'track');
    })

    /**********/

    gulp.task('default', function () {
        return runSequence('cover'/*,'quality'*/, 'secure', 'style');
    });
}())