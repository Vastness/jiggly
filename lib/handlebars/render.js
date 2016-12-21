var path = require('path');
var debug = require('debug')('render');
var fs = require('fs');
var handlebars = require('handlebars');

var debug = require('debug')('zcyjiggly:render');

var promisedHandlebars = require('../promise').Handlebars;
var config = require('../config');

function compileSync(path, context) {
  if (!fs.existsSync(path)) {
    return;
  }
  debug('compileSync path:', path)
  var fileContent = fs.readFileSync(path, {encoding: 'utf-8'});
  var template = handlebars.compile(fileContent);
  return template && template(context);
}

function compileAsync(path, context) {
  return fs.statAsync(path)
    .then(function(stat) {
      if (!stat) {
        debug('file is not exists', path)
        return;
      }

      return fs.readFileAsync(path, {encoding: 'utf-8'})
        .then(function(fileContent) {
          debug('start compile content:', path)
          let template = promisedHandlebars.compile(fileContent);
          return template(context);
        });
    });
}

function getRealPath(viewPath) {
  return path.join(config.viewsHome, viewPath) + (config.pageMode ? '/view.hbs' : '.hbs');
};

function getComponentViewPath(compPath) {
  return path.join(config.componentsHome, compPath, 'view.hbs');
};

module.exports = {

  renderFile: function(viewPath, context) {
    return compileAsync(getRealPath(viewPath || 'index'), context);
  },

  renderComponent: function(compPath, context) {
    context = context || {};
    // set global COMP_PATH
    context[this.CONST.COMP_PATH] = compPath;
    try {
      return compileSync(getComponentViewPath(compPath), context);
    } catch (error) {
      throw error;
    }
  },

  CONST: {
    COMP_PATH: 'COMP_PATH'
  }
};

require('./helpers');
require('./render_helpers');
require('./partial_register');
