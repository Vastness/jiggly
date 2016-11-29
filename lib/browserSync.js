var browserSync = require('browser-sync').create();

var config = require('./config');

browserSync.init({
  proxy: 'http://localhost:' + config.serverPort,
  open: false
}, function () {
  console.log('develop server proxy at port:' + config.serverPort);
});

browserSync.watch(`${config.filesHome}/**/*.{js,hbs,png}`, {
  awaitWriteFinish: true
}).on('change', browserSync.reload);
browserSync.watch(`${config.filesHome}/**/*.css`, {
  awaitWriteFinish: true
}).on('change', browserSync.stream);