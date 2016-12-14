
var express = require("express");

var config = require("./lib/config");

app = express();

// require express server config
require('./lib/express')(app);

// require express routers config
require('./lib/routes')(app);

// add file watcher and reload
require('./lib/file_watcher');

// add file auto reload to browser
// require('./lib/tasks')();

app.listen(config.serverPort);

console.log("server listening at port: " + config.serverPort);
