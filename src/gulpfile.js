var gulp = require('gulp'),
    fs = require('fs'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    csso = require('gulp-csso'),
    autoprefixer = require('gulp-autoprefixer'),
    html = require('gulp-htmlmin'),
    rename = require('gulp-rename'),
    header = require('gulp-header'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    stylish = require('jshint-stylish'),
    http = require('http'),
    https = require('https'),
    express = require('express'),
    logger = require('morgan');

// package config
var pkg = require('./package.json');

//dirs
var dirs = {
    src: './assets',
    dist: '../public/assets',
    index: '../public',
    bower: './bower_components'
};

//paths
var paths = {
    scripts: {
        singldout: [dirs.src + '/js/**/*.js'],
        configs: {
            stage: dirs.src + '/config/config-stage.js',
            prod: dirs.src + '/config/config-prod.js', 
            dev: dirs.src + '/config/config-dev.js',
        },
        angular : [
            dirs.bower + '/angular/angular.js',
            dirs.bower + '/angular-animate/angular-animate.js',
            dirs.bower + '/angular-touch/angular-touch.js',
            dirs.bower + '/angular-route/angular-route.js',
            dirs.bower + '/angular-sanitize/angular-sanitize.js',
            dirs.bower + '/angular-deferred-bootstrap/angular-deferred-bootstrap.js'
        ],
        vendors: [
            dirs.bower + '/jquery/dist/jquery.js',
            dirs.bower + '/jcrop/js/jquery.Jcrop.js',
            dirs.bower + '/underscore/underscore.js',
            dirs.bower + '/moment/moment.js'
        ]
    },
    scss: [
        dirs.src + '/scss/style.scss'
    ],
    css: {
        vendors: [
            dirs.bower + '/normalize-css/normalize.css',
            dirs.bower + '/jcrop/css/jquery.Jcrop.min.css',
            dirs.bower + '/jcrop/css/Jcrop.gif',
            dirs.bower + '/jquery-ui/themes/redmond/jquery-ui.min.css'
        ]
    },
    images: [dirs.src + '/images/**'],
    jqueryuiimages: [dirs.bower + '/jquery-ui/themes/redmond/images/**'],
    html: [dirs.src + '/templates/**/*.html'],
    indexHtml: [dirs.src + '/index.html'],
    indexHtmlProd: [dirs.src + '/index-prod.html'],
    fonts: [dirs.src + '/fonts/**'],
    sounds: [dirs.src + '/sounds/**']
};


// cleanup task
gulp.task('cleanup', function() {
    return gulp.src(dirs.index, {read: false})
        .pipe(clean({force: true}));
});

// lint task
gulp.task('lint', function() {
    gulp.src(paths.scripts.singldout)
        .pipe(jshint('./.jshintrc'))
        .pipe(jshint.reporter(stylish));
});


gulp.task('app-dev', function() {
    paths.scripts.singldout.push(paths.scripts.configs.dev);

    gulp.src(paths.scripts.singldout)
        .pipe(concat('singldout.js'))
        .pipe(gulp.dest(dirs.dist + '/js'))
});

gulp.task('app-prod', function() {
    paths.scripts.singldout.push(paths.scripts.configs.prod);

    gulp.src(paths.scripts.singldout)
        .pipe(concat('singldout.js'))
        .pipe(gulp.dest(dirs.dist + '/js'))
        .pipe(rename('singldout.min.js'))
        .pipe(uglify({
            preserveComments: 'some',
            outSourceMap: true
        }))
        .pipe(gulp.dest(dirs.dist + '/js'));
});

gulp.task('app-stage', function() {
    paths.scripts.singldout.push(paths.scripts.configs.stage);

    gulp.src(paths.scripts.singldout)
        .pipe(concat('singldout.js'))
        .pipe(gulp.dest(dirs.dist + '/js'))
        .pipe(rename('singldout.min.js'))
        .pipe(uglify({
            preserveComments: 'some',
            outSourceMap: true
        }))
        .pipe(gulp.dest(dirs.dist + '/js'));
});

// concatenate and minify js
gulp.task('scripts-dev', function() {
    // angular
    gulp.src(paths.scripts.angular)
        .pipe(concat('angular.js'))
        .pipe(gulp.dest(dirs.dist + '/js'));

    // vendors
    gulp.src(paths.scripts.vendors)
        .pipe(gulp.dest(dirs.dist + '/js'));
});

gulp.task('scripts-prod', function() {
    // angular
    gulp.src(paths.scripts.angular)
        .pipe(concat('angular.js'))
        .pipe(gulp.dest(dirs.dist + '/js'))
        .pipe(rename('angular.min.js'))
        .pipe(uglify({
            preserveComments: 'some',
            outSourceMap: true
        }))
        .pipe(gulp.dest(dirs.dist + '/js'));

    // vendors
    gulp.src(paths.scripts.vendors)
        .pipe(gulp.dest(dirs.dist + '/js'))
        .pipe(rename(function(path) {
            path.basename += '.min';
        }))
        .pipe(uglify({
            preserveComments: 'some',
            outSourceMap: true
        }))
        .pipe(gulp.dest(dirs.dist + '/js'));
});


// compile scss
gulp.task('scss', function() {
    gulp.src(paths.scss)
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest(dirs.dist + '/css'))
        .pipe(rename(function(path) {
            path.basename += '.min';
        }))
        .pipe(csso())
        .pipe(gulp.dest(dirs.dist + '/css'));
});

// minify html
gulp.task('html-dev', function() {
    gulp.src(paths.html)
        .pipe(gulp.dest(dirs.dist + '/templates'));

    gulp.src(paths.indexHtml)
        .pipe(gulp.dest(dirs.index + '/'));
});

gulp.task('html-prod', function() {
    gulp.src(paths.html)
        .pipe(gulp.dest(dirs.dist + '/templates'));

    gulp.src(paths.indexHtmlProd)
        .pipe(rename(function(path) {
            path.basename = 'index';
            path.extname = '.html';
        }))
        .pipe(gulp.dest(dirs.index + '/'));
});

// copy all static assets
gulp.task('copy', function() {
    gulp.src(paths.images)
        .pipe(gulp.dest(dirs.dist + '/images'));

    gulp.src(paths.fonts)
        .pipe(gulp.dest(dirs.dist + '/fonts'));

    gulp.src(paths.css.vendors)
        .pipe(gulp.dest(dirs.dist + '/css'));

    gulp.src(paths.jqueryuiimages)
        .pipe(gulp.dest(dirs.dist + '/css/images'));

    gulp.src(paths.sounds)
        .pipe(gulp.dest(dirs.dist + '/sounds'));
});

// static file server
gulp.task('server', function() {
    var app = express(),
        rootdir = __dirname + '/' + dirs.index,
        options = {
            key: fs.readFileSync('ssl/server.key', 'utf8'),
            cert: fs.readFileSync('ssl/server.crt', 'utf8')
        };

    app.set('port', Number(process.env.PORT) || 8888);
    app.use(logger('dev'));
    app.use(express.static(rootdir));

    https.createServer(options, app).listen(app.get('port'), function() {
        console.log('HTTPS server listening on port %d', app.get('port'));
    });
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts.singldout, ['lint', 'scripts-dev', 'app-dev']);
    gulp.watch(paths.scripts.angular, ['scripts-dev']);
    gulp.watch(paths.scripts.angular, ['app-dev']);
    gulp.watch(dirs.src + '/scss/*.scss', ['scss']);
    gulp.watch(paths.html, ['html-dev']);
    gulp.watch(paths.images, ['copy']);
});


// composite task
gulp.task('default', function() {
    gulp.start('lint', 'scripts-dev', 'app-dev', 'scss', 'html-dev', 'copy', 'watch');
});

gulp.task('build-dev', ['cleanup'], function() {
    gulp.start('lint', 'scripts-dev', 'app-dev', 'scss', 'html-dev', 'copy');
});

gulp.task('build-prod', ['cleanup'], function() {
    gulp.start('lint', 'scripts-prod', 'app-prod', 'scss', 'html-prod', 'copy');
});

gulp.task('build-stage', ['cleanup'], function() {
    gulp.start('lint', 'scripts-prod', 'app-stage', 'scss', 'html-prod', 'copy');
});