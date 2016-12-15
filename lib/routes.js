var _ = require('lodash');
var express = require('express');

var debug = require('debug')('zcyjiggly:router');
var utils = require('./utils');
var render = require('./handlebars/render');
var dataProvider = require('./data_provider');

module.exports = function(app) {
  var router = express.Router();
  app.use('/', router);

  dataProvider.getAllUrlData()
  .then(function(urlsData) {
    _.forEach(urlsData, function(val, url) {
      // 如果是function，则默认为get方法
      if (_.isFunction(val)) {
        router.get(url, function(req, res, next) {
          var result = val(req.query, res);
          res.status(200).send(utils.toString(result));
        });
      }
      // 如果是object，则将所有的key值作为method初始化路由
      _.forEach(val, function(routeFn, method) {
        router[method](url, function(req, res, next) {
          var result = {};
          if (_.isFunction(routeFn)) {
            result = utils.toString(routeFn(req.query, res));
          } else if (_.isObject(routeFn)) {
            result = routeFn;
          }
          res.status(200).send(result);
        });
      });
    });
  })
  .then(function() {
    // 其他的作为页面的渲染
    app.get(/^([^\.]+)$/, function(req, res, next) {
      dataProvider.getGlobalData()
        .then(function(golbalData) {
          var reqPath = req.path;
          var context = _.assign(golbalData, req.query);
          return render.renderFile(reqPath, context);
        })
        .then(function(result) {
          if (result) {
            res.status(200).send(result);
          } else {
            next();
          }
        }).catch(function(err) {
          debug('render view:' + req.path, err);
        });
    });

    // 均找不到则返回404
    app.all('/*', function(req, res) {
      dataProvider.proxyHttp(req, res)
        .then(function() {
        })
        .catch(function() {
          res.sendStatus(404);
        })
    })
  })
  .catch(function(err) {
    console.info('init router error', err);
  })
}