var _ = require('lodash');
var Promise = require('bluebird');
var handlebars = require('handlebars');

var debug = require('debug')('zcyjiggly:render-helper');

var render = require('./render');
var config = require('../config');
var dataProvider = require('../data_provider');
var promisedHandlebars = require('../promise').Handlebars;

var blocks = {};  // 保存所有的block，partial

/**
 * 不支持内嵌inject，所以内嵌使用同步的inject
 */
handlebars.registerHelper('inject', function(path, options) {
  var tempContext = _.clone(this);
  _.assign(tempContext, options.hash);
  if (options.fn) {
    var compData = JSON.parse(options.fn());
    _.assign(tempContext, compData);
  }
  return new handlebars.SafeString(render.renderComponent(path, tempContext));
});

/**
 * 由于promisedHandlebars不支持inject的内嵌helper异步调用
 * 所以inject包含的helper暂时还是以同步的方式执行
 * 外层的helper才以异步的方式执行
 */
promisedHandlebars.registerHelper('inject', function(path, options) {
  var _this = this
  return Promise.resolve()
    .then(function() {
      var tempContext = _.clone(_this);
      _.assign(tempContext, options.hash);
      if (!options.fn) {
        return tempContext;
      }
      return options.fn()
        .then(function(data) {
          if (!data) {
            return tempContext;
          }
          var compData = JSON.parse(data);
          return _.assign(tempContext, compData);
        });
    }).then(function(tempContext) {
      return dataProvider.getCompData(path, tempContext)
        .then(function(dataResult) {
        if (dataResult) {
          var mockContext = {
            _DATA_: _.omit(dataResult, '_SERVICES_')
          };
          if (_.isObject(dataResult._SERVICES_)) {
            _.assign(mockContext, dataResult._SERVICES_);
          }
          _.assign(tempContext, mockContext);
        }
        return new handlebars.SafeString(render.renderComponent(path, tempContext));
      })
      .catch(function(error) {
        debug('path render error', error)
      })
    })
});

handlebars.registerHelper('component', function(className, options) {
  return new handlebars.SafeString('<div class=\"' + className + '\" data-comp-path=\"' + this[render.CONST.COMP_PATH] + '\">' + (options.fn(this)) + '</div>');
});

promisedHandlebars.registerHelper("designPart", function() {
  let params = arguments;
  return Promise.resolve()
    .then(function() {
      var options = _.last(params);
      if (options.fn) {
        return options.fn(this);
      }
    });
});

promisedHandlebars.registerHelper('partial', function(name, options) {
  var block = blocks[name];
  if (!block) {
    block = blocks[name] = [];
  }
  block.push(options.fn(this));
});

promisedHandlebars.registerHelper('block', function(name, options) {
  return Promise.resolve()
    .then(function() {
      var block = blocks[name] || [];
      if (block.length === 0) {
        if (options.fn) {
          return options.fn(this);
        }
        return '';
      }
      blocks[name] = [];
      return block.join('\n');
    });
});

config.extraHelpers.forEach(function(helperPath) {
  try {
    require(helperPath)(handlebars);
  } catch (error) {
    console.error('error when load extra helper file: ' + helperPath, error);
  }
});
