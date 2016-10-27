var fs = require("fs");
var path = require('path');
var handlebars = require("handlebars");

var config = require("../config");

var FileNotFoundError = require("../errors").FileNotFoundError;

function compileSync(path) {
  if (!fs.existsSync(path)) {
    return;
  }
  var template = fs.readFileSync(path, {
    encoding: "utf-8"
  });
  return handlebars.compile(template);
}



function getRealPath(viewPath) {
  return path.join(config.viewsHome, viewPath) + (config.pageMode ? "/view.hbs" : ".hbs");
};

function getComponentViewPath(compPath) {
  return path.join(config.componentsHome, compPath, "view.hbs");
};

function renderFromRealPath(realPath, context) {
  var template = compileSync(realPath);
  return template && template(context);
};

module.exports = {

  renderFile: function(viewPath, context) {
    return renderFromRealPath(getRealPath(viewPath), context);
  },

  renderComponent: function(compPath, context) {
    context = context || {};
    // set global COMP_PATH
    context[this.CONST.COMP_PATH] = compPath;
    try {
      return renderFromRealPath(getComponentViewPath(compPath), context);
    } catch (error) {
      if (error instanceof FileNotFoundError) {
        console.log("[Component Not Found] " + error.path);
        return "component not found: " + error.path;
      }
      throw error;
    }
  },

  CONST: {
    COMP_PATH: "COMP_PATH"
  }
};

require("./helpers");
require("./render_helpers");
require('./partial_register');
