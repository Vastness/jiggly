
var path = require('path')
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

// var CLIEngine = require('eslint').CLIEngine;

var config = require('../config');

function getEslintDir() {
  return path.join(config.eslint, '/**/*.{js,jsx,es6}');
}

// JavaScript 代码静态检测
gulp.task('eslint', function () {
  let isFixed = function (file) {
    return (file.eslint != null) && file.eslint.fixed;
  }
  var eslintDir = getEslintDir();
  return gulp.src(eslintDir, {base: config.eslint})
      .pipe(plugins.cached('eslint'))
      .pipe(plugins.eslint({
        fix: argv.fix
      }))
      .pipe(plugins.eslint.format())
      .pipe(plugins.if(isFixed, gulp.dest(config.eslint)));
});

module.exports = function() {
  if (!config.eslint) {
    return;
  }

  var eslintDir = getEslintDir();
  let eslintWatcher = gulp.watch(eslintDir, ['eslint']);
  eslintWatcher.on('change', function (event) {
    console.log(`${event.type}:${event.path}`);
  });
}



