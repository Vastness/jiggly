
var _ = require('lodash');
var request = require('request');
var Promise = require('bluebird');
Promise.promisifyAll(request);
var httpProxy = require('http-proxy');
var http = require('http');

var config = require('./config');
var utils = require('./utils')

var proxy = httpProxy.createProxyServer();

var authStr = new Buffer('zcyadmin:vK6olR5IzoceCP8u').toString('base64')
var baseAuthStr = 'Basic ' + authStr; // 基础接口对接的校验参数
var authorizationValue = '';  // 调用接口时的校验参数
var refreshToken = ''         // 刷新token的参数

/**
 *
 * http://121.40.120.65:18081/oauth/token?grant_type=password&username=test9@test.com&password=test123456
 *
 * @param {any} name
 * @param {any} password
 * @returns
 */
function getOauthUri(name, password) {
  var proxyConfig = config.proxy;
  if (!proxyConfig.uaa) {
    throw new Error('uaa模块必须配置')
  }
  return proxyConfig.uaa.domain + '/oauth/token?grant_type=password&username=' + name + '&password=' + password;
}

function getRefreshTokenUri() {
  var proxyConfig = config.proxy;
  return proxyConfig.uaa.domain + '/oauth/token?grant_type=refresh_token&state=' + Math.random().toString(36).substr(2);
}

function getAuthorization() {
  var proxyAuth = config.proxyAuth;
  if (!proxyAuth || !proxyAuth.name) {
    return;
  }
  var oauthUri = getOauthUri(proxyAuth.name, proxyAuth.password)
  return request.postAsync({
    uri: oauthUri,
    headers: {
      Authorization: baseAuthStr
    }
  })
  .then(function(res) {
    var data = utils.jsonParse(res.body)
    var tokenType = data.token_type;
    var accessToken = data.access_token;
    refreshToken = data.refresh_token;
    authorizationValue = tokenType + ' ' + accessToken;
  })
  .then(function() {
    // 一小时执行
    setTimeout(refreshTokenInterval, 60*60*1000);
    // setTimeout(refreshTokenInterval, 10000);
  })
}

function getProxyTarget(path) {
  var proxyConfig = config.proxy;
  if (!proxyConfig) {
    return;
  }

  var domainUrl = '';
  _.forEach(proxyConfig, function(moduleConfig, key) {
    if (_.some(moduleConfig.apis, function(api) {
      // \\开头的为正则表达式
      if (_.startsWith(api, '\\')) {
        return new RegExp(api).test(path);
      }
      return api == path;
    })) {
      domainUrl = moduleConfig.domain;
      return false
    }
  })
  return domainUrl;
}

/**
 * 刷新token
 *
 * @returns
 */
function refreshTokenInterval() {
  // console.info('start refreshTokenInterval', refreshToken)
  if(!refreshToken) {
    return Promise.reject('refreshToken is not exist');
  }

  return request.postAsync({
    uri: getRefreshTokenUri(),
    form: {
      refresh_token: refreshToken
    },
    headers: {
      Authorization: baseAuthStr
    }
  })
  .then(function(resp) {
    console.info('refreshTokenInterval', resp.body)
    var data = utils.jsonParse(resp.body);
    if (!data.token_type || !data.access_token) {
      // 5分钟后尝试
      setTimeout(refreshTokenInterval, 5*60*1000)
      return;
    }
    authorizationValue = data.token_type + '' + data.access_token
  })
  .catch(function(error) {
    // 5分钟后尝试
    console.warn('refresh_token error', error)
    setTimeout(refreshTokenInterval, 5*60*1000)
  })
}

// 先初始化，避免多次请求数据
getAuthorization()

module.exports = function(req, res, next) {
  var uriPath = req.path;
  if (uriPath == '/') {
    next();
    return;
  }
  var domainUrl = getProxyTarget(req.path);
  if (!domainUrl) {
    next();
    return;
  }

  if (authorizationValue) {
    proxy.web(req, res, {target: domainUrl});
  } else {
    getAuthorization()
      .then(function() {
        proxy.web(req, res, {target: domainUrl});
      }).catch(function() {

      })
  }
  proxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('Authorization', authorizationValue);
  });
  proxy.on('error', function(error) {
    console.info('proxy ' + domainUrl, error);
    next()
  });
}