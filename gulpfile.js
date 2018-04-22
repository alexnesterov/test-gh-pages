var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var pug = require('gulp-pug');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var browserSync = require('browser-sync');
var del = require('del');
var runSequence = require('run-sequence');
var reload = browserSync.reload;
var zip = require('gulp-zip');
var ghPages = require('gulp-gh-pages');

gulp.task('styles', function() {
  return gulp.src('app/assets/styles/*.scss')
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
          title: 'Styles',
          message: err.message
        }
      })
    }))
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(prefix({
      browsers: ['last 15 versions']
    }))
    .pipe(cssnano({
      autoprefixer: false
    }))
    .pipe(gulp.dest('dist/assets/styles/'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', function() {
  return gulp.src('app/assets/scripts/*.js')
    .pipe(gulp.dest('dist/assets/scripts/'))
    .pipe(reload({stream: true}));
});

gulp.task('html', function() {
  return gulp.src(['app/*.pug', '!app/config.pug'])
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
  return gulp.src('app/assets/images/**/*')
    .pipe(cache(imagemin()))
    .pipe(gulp.dest('dist/assets/images/'));
});

gulp.task('fonts', function() {
  return gulp.src('app/assets/fonts/**/*')
    .pipe(gulp.dest('dist/assets/fonts/'));
});

gulp.task('rootfiles', function() {
  return gulp.src(['app/*.*', '!app/*.pug'])
    .pipe(gulp.dest('dist'));
});

gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

gulp.task('clean', ['clear'], function() {
  return del('dist');
});

gulp.task('build', ['clean'], function(callback) {
  runSequence(
    ['styles', 'scripts'],
    'html',
    'images',
    'fonts',
    'rootfiles',
    callback);
});

gulp.task('serve', ['build'], function() {
  browserSync.init({
    server: {
      baseDir: 'dist',
    },
    port: 1508,
    notify: false
  });

  gulp.watch('dist/*.html').on('change', reload);
  gulp.watch('app/**/*.pug', ['html']);
  gulp.watch(['app/*.*', '!app/*.pug'], ['rootfiles']);
  gulp.watch('app/assets/styles/**/*', ['styles']);
  gulp.watch('app/assets/scripts/**/*', ['scripts']);
  gulp.watch('app/assets/images/**/*', ['images']);
  gulp.watch('app/assets/fonts/**/*', ['fonts']);
});

gulp.task('zip', function () {
  return gulp.src('dist/**/*')
    .pipe(zip('devboost.pack.zip'))
    .pipe(gulp.dest('./'))
});

gulp.task('deploy', ['build'], function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

gulp.task('default', ['serve']);
