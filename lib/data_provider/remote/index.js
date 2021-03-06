
var _ = require('lodash')

var NZD = require('./dubbo');
var Yaml = require('./yaml');
var Oauth = require('./oauth');

var request = require('../../promise').request;

var debug = require('debug')('zcyjiggly:remote');

var httpProxy = require('http-proxy');
var Promise = require('bluebird');
var proxy = httpProxy.createProxyServer();

var config = require('../../config');

module.exports = {

  init: NZD.init,

  // 获取组件的数据
  getCompData: function(path, params) {
    // 不服务器模拟
    if (!config.dubbo) {
      return Promise.resolve({})
    }

    return NZD.getEntry()
      .then(function(nzdEntry) {
        return Yaml.getService(nzdEntry, path, params)
      })
      .then(function(result) {
        debug('request component done', path)
        if (!result) {
          return
        }
        var _SERVICES_ = _.assign(_.omit(result, '_DATA_'), {
          _USER_: Oauth.getCurrentUser()
        })
        return _.assign(result._DATA_, {
          _SERVICES_: _SERVICES_
        })
      }).catch(function(err) {
        debug('getCompData error: ' + path, err)
      })
  },

  // 代理http请求
  proxyRequest: function(req, res) {
    return new Promise(function(resolve, reject) {
      var uriPath = req.path;
      if (uriPath == '/') {
        resolve(false);
        return;
      }
      var domainUrl = Oauth.getProxyTarget(req.path);
      if (!domainUrl) {
        resolve(false);
        return;
      }

      debug('start proxy http', domainUrl)
      proxy.on('error', function(error) {
        debug('proxy error:' + domainUrl, error);
        reject();
      });

      return Oauth.getAuthorization()
        .then(function(authorizationValue) {
          proxy.web(req, res, {target: domainUrl});

          proxy.on('proxyReq', function(proxyReq, req, res, options) {
            proxyReq.setHeader('Authorization', authorizationValue);
          });
          return true
      });
    });
  },

  isComponent: Yaml.isComponent

};