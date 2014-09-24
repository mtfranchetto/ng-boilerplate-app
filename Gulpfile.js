'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    rimraf = require('gulp-rimraf'),
    fs = require('fs'),
    _ = require('lodash'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
    watchify = require('watchify'),
    gulpif = require('gulp-if'),
    autoprefixer = require('gulp-autoprefixer'),
    minify = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    embedlr = require('gulp-embedlr'),
    minimist = require('minimist'),
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

var DIST_FOLDER = 'dist',
    KARMA_CONFIG = '/karma.conf.js',
    BUNDLE_FILENAME = "main",
    watching = false,
    currentVariant = getVariantOption("debug-main");

server.use(express.static(getDistDirectory()));
server.use(livereload({port: livereloadport}));

server.all('/*', function (req, res) {
    res.sendfile('index.html', { root: getDistDirectory() });
});

gulp.task('build', ['clean'], function () {
    var variant = getVariantOption(),
        variants = [];
    if (watching) {
        variants = [currentVariant];
    } else if (variant !== 'all') {
        variants = [variant];
    } else {
        variants = getDirectories(__dirname + "/boot");
        variants = _.flatten(_.map(variants, function (variant) {
            return ['release-' + variant, 'debug-' + variant];
        }));
    }
    _.forEach(variants, function (variant) {
        currentVariant = variant;
        gulp.start('views', 'styles', 'images', 'browserify');
    });
});

gulp.task('clean', function () {
    return gulp.src([DIST_FOLDER, 'coverage/'], { read: false })
        .pipe(plumber())
        .pipe(rimraf({force: true}));
});

gulp.task('lint', function () {
    gulp.src('scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('styles', function () {
    gulp.src('./boot/' + getVariantPart() + '/bootstrapper.scss')
        .pipe(concat(BUNDLE_FILENAME + '.css'))
        .pipe(plumber())
        .pipe(sass({ includePaths: ['./'] }))
        .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
        .pipe(gulpif(isRelease(), minify()))
        .pipe(gulp.dest(getDistDirectory() + 'css/'))
        .pipe(gulpif(watching, refresh(lrserver)));
});

gulp.task('browserify', function () {
    process.env.DEBUG = currentVariant.indexOf('debug') > -1;

    var browserifyOptions = {
        entries: ['./boot/' + getVariantPart() + '/bootstrapper.js'],
        noParse: [
            require.resolve('jquery'),
            require.resolve('lodash')
        ],
        debug: !isRelease(),
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
            .pipe(gulpif(isRelease(), streamify(uglify())))
            .pipe(gulp.dest(getDistDirectory() + 'js'))
            .pipe(gulpif(watching, refresh(lrserver)));
    }

    return rebundle();
});

gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + KARMA_CONFIG,
        singleRun: !watching
    }, function () {
        if (watching)
            gulp.start('test');
        else
            done();
    });
});

gulp.task('views', function () {
    gulp.src('index.html')
        .pipe(gulpif(watching, embedlr()))
        .pipe(gulp.dest(getDistDirectory()));
    gulp.src('views/**/*')
        .pipe(gulp.dest(getDistDirectory() + 'views/'))
        .pipe(gulpif(watching, refresh(lrserver)));
});

gulp.task('images', function () {
    gulp.src('images/**/*')
        .pipe(gulp.dest(getDistDirectory() + 'images/'))
        .pipe(gulpif(watching, refresh(lrserver)));
});

gulp.task('watch', function () {
    watching = true;
    currentVariant = getVariantOption("debug-main");

    gulp.start('build', 'serve', function () {
        gulp.watch(['./boot/' + getVariantPart() + '/bootstrapper.scss',
            './boot/base.scss',
            './styles/**/*.scss'],
            ['styles']);

        gulp.watch(['views/**/*.html'], ['views']);

        watch(['images/*'], function () {
            gulp.start('images');
        });
    });
});

gulp.task('watch-test', ['watch', 'test']);

gulp.task('serve', function () {
    if (!currentVariant)
        currentVariant = getVariantOption("debug-main");

    server.listen(serverport);
    refresh.listen(livereloadport);
    console.log('Variant ' + currentVariant + ' listening on http://localhost:' + serverport);
});

gulp.task('default', ['build']);

function getDirectories(rootDir) {
    var files = fs.readdirSync(rootDir),
        directories = [];
    _.forEach(files, function (file) {
        if (file[0] != '.') {
            var filePath = rootDir + '/' + file,
                stat = fs.statSync(filePath);
            if (stat.isDirectory())
                directories.push(file);
        }
    });
    return directories;
}

function isRelease() {
    return currentVariant.indexOf("release") > -1;
}

function getDistDirectory() {
    return DIST_FOLDER + '/' + currentVariant + '/';
}

function getVariantPart() {
    return currentVariant.split('-')[1];
}

function getVariantOption(defaultOption) {
    return minimist(process.argv.slice(2), {
        string: 'variant',
        default: { variant: defaultOption || 'release-main' }
    }).variant;
}