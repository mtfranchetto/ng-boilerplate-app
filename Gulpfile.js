'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    rimraf = require('gulp-rimraf'),
    env = require('node-env-file'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
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
    livereloadport = 35729,
    serverport = 5000,
    server = express();

env(__dirname + '/.env');

var PRODUCTION = process.env.ENVIRONMENT === 'production',
    DIST_FOLDER = 'dist',
    KARMA_CONFIG = '/karma.conf.js',
    BUNDLE_FILENAME = "main";


server.use(livereload({port: livereloadport}));
server.use(express.static('./' + DIST_FOLDER));

server.all('/*', function (req, res) {
    res.sendfile('index.html', { root: DIST_FOLDER });
});

gulp.task('build', ['clean'], function () {
    gulp.start(['views', 'styles', 'browserify']);
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
    stream
        .pipe(gulp.dest(DIST_FOLDER + '/css/'))
        .pipe(refresh(lrserver));
});

gulp.task('browserify', function () {
    var stream = browserify('./bootstrapper.js')
        .bundle({ debug: !PRODUCTION})
        .pipe(plumber())
        .pipe(source('main.js'));
    if (PRODUCTION)
        stream = stream.pipe(streamify(uglify()));
    stream
        .pipe(gulp.dest('./' + DIST_FOLDER + '/js'))
        .pipe(refresh(lrserver));
});

gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + KARMA_CONFIG,
        singleRun: PRODUCTION
    }, done);
});

gulp.task('views', function () {
    gulp.src('index.html')
        .pipe(gulp.dest(DIST_FOLDER));
    gulp.src('views/**/*')
        .pipe(gulp.dest(DIST_FOLDER + '/views/'))
        .pipe(refresh(lrserver));
});

gulp.task('watch', ['build', 'serve'], function () {
    gulp.watch(['bootstrapper.js', 'scripts/**/*.js'], [
        'browserify'
    ]);

    gulp.watch(['bootstrapper.css', 'styles/**/*.scss'], [
        'styles'
    ]);

    gulp.watch(['views/**/*.html'], [
        'views'
    ]);
});

gulp.task('watch-test', ['build', 'serve', 'test']);

gulp.task('serve', function () {
    server.listen(serverport);
    refresh.listen(livereloadport);
    console.log('App listening on http://localhost:' + serverport);
});

gulp.task('default', ['build']);