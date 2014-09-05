'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    rimraf = require('gulp-rimraf'),
    env = require('node-env-file'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
    watchify = require('watchify'),
    autoprefixer = require('gulp-autoprefixer'),
    minify = require('gulp-minify-css'),
    concat = require('gulp-concat'),
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
    var stream = gulp.src(['bootstrapper.scss', 'styles/*.scss'])
        .pipe(concat(BUNDLE_FILENAME + '.css'))
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'));
    if (PRODUCTION)
        stream = stream.pipe(minify());
    stream = stream.pipe(gulp.dest(DIST_FOLDER + '/css/'))
    if (watching)
        stream.pipe(refresh(lrserver));
});

gulp.task('browserify', function () {
    var browserifyOptions = {
        entries: ['./bootstrapper.js'],
        noParse: [
            require.resolve('jquery'),
            require.resolve('angular/angular'),
            require.resolve('angular/angular.mocks'),
            require.resolve('angular/angular.sanitize'),
            require.resolve('angular/angular.resource'),
            require.resolve('angular/angular.route'),
            require.resolve('angular/angular.animate'),
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
        var stream = bundleStream.bundle()
            .on('error', gutil.log)
            .pipe(source('main.js'));
        if (PRODUCTION)
            stream = stream.pipe(streamify(uglify()));
        stream = stream.pipe(gulp.dest('./' + DIST_FOLDER + '/js'));
        if (watching)
            stream.pipe(refresh(lrserver));
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
    var stream = gulp.src('views/**/*').pipe(gulp.dest(DIST_FOLDER + '/views/'));
    if (watching)
        stream.pipe(refresh(lrserver));
});

gulp.task('images', function () {
    gulp.src('images/**/*').pipe(gulp.dest(DIST_FOLDER + '/images/'));
});

gulp.task('watch', function () {
    watching = true;

    gulp.start('build', 'serve', function () {
        gulp.watch(['bootstrapper.scss', 'styles/**/*.scss'], [
            'styles'
        ]);

        gulp.watch(['views/**/*.html'], [
            'views'
        ]);
    });
});

gulp.task('watch-test', ['watch', 'test']);

gulp.task('serve', function () {
    server.listen(serverport);
    refresh.listen(livereloadport);
    console.log('App listening on http://localhost:' + serverport);
});

gulp.task('default', ['build']);