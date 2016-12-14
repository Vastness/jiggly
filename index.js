
var express = require('express');

var debug = require('debug')('zcyjiggly:index');
var config = require('./lib/config');
var dataProvider = require('./lib/data_provider');

app = express();

dataProvider.init()
  .then(function() {
    // require express server config
    require('./lib/express')(app);

    // require express routers config
    require('./lib/routes')(app);

    // add file watcher and reload
    require('./lib/file_watcher');

    // add file auto reload to browser
    // require('./lib/tasks')();

    app.listen(config.serverPort);

    debug('server listening at port: ' + config.serverPort);
  })
  .catch(function(err) {
    debug('server error ', err);
  })


