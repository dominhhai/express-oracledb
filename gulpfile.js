var gulp = require('gulp')
var nodemon = require('gulp-nodemon')
var concat = require('gulp-concat')
var del = require('del')
var path = require('path')

gulp.task('default', ['build', 'cssmin', 'start'])

gulp.task('start', function () {
  nodemon({
    script: 'bin/www',
    ext: 'js css',
    ignore: ['public/bin'],
    tasks: function (files) {
      var tasks = []
      files.forEach(function (file) {
        if (path.extname(file) === '.js' && !~tasks.indexOf('build')) {
          tasks.push('build')
        }
        if (path.extname(file) === '.css' && !~tasks.indexOf('cssmin')) {
          tasks.push('cssmin')
        }
      })
      return tasks
    }
  })
})

gulp.task('clean', function () {
  return del(['public/bin'])
})

gulp.task('build', ['clean'], function () {
  return gulp.src('public/**/*.js')
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('public/bin'))
})

gulp.task('cssmin', ['clean'], function () {
  return gulp.src('public/**/*.css')
    .pipe(concat('all.min.css'))
    .pipe(gulp.dest('public/bin'))
})
