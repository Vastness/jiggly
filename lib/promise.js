var Promise = require('bluebird')
var promisedHandlebars = require('promised-handlebars')
var Handlebars = promisedHandlebars(require('handlebars'), {Promise: Promise});

var fs = require('fs');
Promise.promisifyAll(fs);

var request = require('request');
Promise.promisifyAll(request);

module.exports = {

  Handlebars: Handlebars,

  fs: fs,

  request: request
};