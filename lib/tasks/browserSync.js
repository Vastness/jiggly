
var gulp = require('gulp');
var browserSync = require('browser-sync').create();

var config = require('../config');

browserSync.init({
  proxy: 'http://localhost:' + config.serverPort,
  open: false
}, function () {
  console.log('develop server proxy at port:' + config.serverPort);
});

gulp.watch(`${config.filesHome}/**/*.{js,hbs,png}`, browserSync.reload);
gulp.watch(`${config.filesHome}/**/*.css`, function (event) {
  gulp.src(event.path)
    .pipe(browserSync.stream());
});
// browserSync.watch(`${config.filesHome}/**/*.{js,hbs,png}`, {
//   awaitWriteFinish: true
// }).on('change', browserSync.reload);
// browserSync.watch(`${config.filesHome}/**/*.css`, {
//   awaitWriteFinish: true
// }).on('change', browserSync.stream);