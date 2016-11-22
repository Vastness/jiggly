var browserSync = require('browser-sync').create();

var config = require('./config');

browserSync.init({
  proxy: 'http://localhost:' + config.serverPort,
  open: true
}, function () {
  console.log('develop server proxy at port:' + config.serverPort);
});

browserSync.watch(`${config.filesHome}/**/*.{js,hbs,png}`).on('change', browserSync.reload);
browserSync.watch(`${config.filesHome}/**/*.css`).on('change', browserSync.stream);