
var Promise = require('bluebird')
var handlebars = require('handlebars');

var PromisedHandlebars = require('../promise').Handlebars;

handlebars.registerHelper('i18n', function(key, options) {
  return key;
});

PromisedHandlebars.registerHelper('i18n', function(key, options) {
  return Promise.resolve(key);
});

handlebars.registerHelper('i18nJs', function() {
  return '';
});

handlebars.registerHelper('i18nJsHelper', function() {
  return new handlebars.SafeString('if (window.Handlebars) {Handlebars.registerHelper("i18n", function(key) {return key;});}');
});
