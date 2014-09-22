'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    rimraf = require('gulp-rimraf'),
    env = require('node-env-file'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
    watchify = require('watchify'),
    gulpif = require('gulp-if'),
    autoprefixer = require('gulp-autoprefixer'),
    minify = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'),
    karma = require('karma').server,
    uglify = require('gulp-uglify'),
    express = require('express'),
    refresh = require('gulp-livereload'),
    livereload = require('connect-livereload'),
    lrserver = require('tiny-lr')(),
    gutil = require('gulp-util'),
    livereloadport = 35729,
    serverport = 5000,
    server = express();

env(__dirname + '/.env');

var PRODUCTION = process.env.ENVIRONMENT === 'production',
    DIST_FOLDER = 'dist',
    KARMA_CONFIG = '/karma.conf.js',
    BUNDLE_FILENAME = "main",
    watching = false;


server.use(livereload({port: livereloadport}));
server.use(express.static('./' + DIST_FOLDER));

server.all('/*', function (req, res) {
    res.sendfile('index.html', { root: DIST_FOLDER });
});

gulp.task('build', ['clean'], function () {
    gulp.start('views', 'styles', 'images', 'browserify');
});

gulp.task('clean', function () {
    return gulp.src('./' + DIST_FOLDER + '/', { read: false })
        .pipe(plumber())
        .pipe(rimraf({force: true}));
});

gulp.task('lint', function () {
    gulp.src('scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('styles', function () {
    gulp.src(['bootstrapper.scss', 'styles/*.scss'])
        .pipe(concat(BUNDLE_FILENAME + '.css'))
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
        .pipe(gulpif(PRODUCTION, minify()))
        .pipe(gulp.dest(DIST_FOLDER + '/css/'))
        .pipe(gulpif(watching, refresh(lrserver)));
});

gulp.task('browserify', function () {
    var browserifyOptions = {
        entries: ['./bootstrapper.js'],
        noParse: [
            require.resolve('jquery'),
            require.resolve('browserify-angular/angular'),
            require.resolve('browserify-angular/angular.mocks'),
            require.resolve('browserify-angular/angular.sanitize'),
            require.resolve('browserify-angular/angular.resource'),
            require.resolve('browserify-angular/angular.route'),
            require.resolve('browserify-angular/angular.animate'),
            require.resolve('underscore')
        ],
        debug: !PRODUCTION,
        cache: {},
        packageCache: {},
        fullPaths: true
    };

    var bundleStream = watching ? watchify(browserify(browserifyOptions)) :
        browserify(browserifyOptions);
    if (watching)
        bundleStream.on('update', rebundle);

    function rebundle() {
        bundleStream.bundle()
            .on('error', gutil.log)
            .pipe(source('main.js'))
            .pipe(gulpif(PRODUCTION, streamify(uglify())))
            .pipe(gulp.dest('./' + DIST_FOLDER + '/js'))
            .pipe(gulpif(watching, refresh(lrserver)));
    }

    return rebundle();
});

gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + KARMA_CONFIG,
        singleRun: PRODUCTION
    }, function () {
        if (!PRODUCTION)
            gulp.start('test');
        else
            done();
    });
});

gulp.task('views', function () {
    gulp.src('index.html')
        .pipe(gulp.dest(DIST_FOLDER));
    gulp.src('views/**/*')
        .pipe(gulp.dest(DIST_FOLDER + '/views/'))
        .pipe(gulpif(watching, refresh(lrserver)));
});

gulp.task('images', function () {
    gulp.src('images/**/*')
        .pipe(gulp.dest(DIST_FOLDER + '/images/'))
        .pipe(gulpif(watching, refresh(lrserver)));
});

gulp.task('watch', function () {
    watching = true;

    gulp.start('build', 'serve', function () {
        gulp.watch(['bootstrapper.scss', 'styles/**/*.scss'], ['styles']);

        gulp.watch(['views/**/*.html'], ['views']);

        watch(['images/*'], function () {
            gulp.start('images');
        });
    });
});

gulp.task('watch-test', ['watch', 'test']);

gulp.task('serve', function () {
    server.listen(serverport);
    refresh.listen(livereloadport);
    console.log('App listening on http://localhost:' + serverport);
});

gulp.task('default', ['build']);