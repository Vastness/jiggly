var _ = require("lodash");
var express = require('express')

var render = require("./handlebars/render");
var dataProvider = require("./data_provider");

function forceToString(val) {
  if (_.isUndefined(val)) {
    return '';
  }
  if (_.isNumber(val)) {
    return val + '';
  }
  if (_.isString(val) || _.isObject(val)) {
    return val;
  }
  return '';
}

module.exports = function(app) {
  var router = express.Router();
  app.use('/', router);

  var urlsData = dataProvider.getAllUrlData();
  _.forEach(urlsData, function(val, url) {
    /* is function, router all to function recall */
    if (_.isFunction(val)) {
      router.get(url, function(req, res, next) {
        var result = val(req.query, res);
        res.send(forceToString(result));
      });
    }
    // is object, router key as method
    _.forEach(val, function(routeFn, method) {
      router[method](url, function(req, res, next) {
        var result = {};
        if (_.isFunction(routeFn)) {
          result = forceToString(routeFn(req.query, res));
        } else if (_.isObject(routeFn)) {
          result = routeFn;
        }
        res.send(result);
      });
    });
  });

  /* route views page and render */
  app.get(/^([^\.]+)$/, function(req, res, next) {
    var reqPath = req.path;
    var context = _.assign(dataProvider.getGlobalData(), req.query);
    var result = render.renderFile(reqPath, context);
    if (result) {
      res.send(result);
    } else {
      next();
    }
  });

  app.all('/*', function(req, res) {
    res.sendStatus(404);
  })
}