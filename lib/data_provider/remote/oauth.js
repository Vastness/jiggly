
var _ = require('lodash');
var request = require('request');
let java = require('js-to-java');
var Promise = require('bluebird');
Promise.promisifyAll(request);

var config = require('../../config');
var utils = require('../../utils')

var debug = require('debug')('zcyjiggly:oauth');

var authStr = new Buffer('zcyadmin:vK6olR5IzoceCP8u').toString('base64')
var baseAuthStr = 'Basic ' + authStr; // 基础接口对接的校验参数
var authorizationValue = '';  // 调用接口时的校验参数
var refreshToken = ''         // 刷新token的参数

var loginUser
var currentUser


function getUaaHostpath() {
  var proxyConfig = config.proxy;
  var targetDomain = proxyConfig.domain
  if (!targetDomain || !proxyConfig.uaa) {
    throw new Error('uaa模块必须配置')
  }
  debug('uaa hostpath:', targetDomain + ':' + proxyConfig.uaa.port)
  return targetDomain + ':' + proxyConfig.uaa.port
}

function getModuleHostpath(moduleConfig) {
  var targetDomain = config.proxy.domain
  debug('module hostpath:', targetDomain + ':' + moduleConfig.port)
  return targetDomain + ':' + moduleConfig.port
}

/**
 *
 * http://121.40.120.65:18081/oauth/token?grant_type=password&username=test9@test.com&password=test123456
 *
 * @param {any} name
 * @param {any} password
 * @returns
 */
function getOauthUri(name, password) {
  return getUaaHostpath() + '/oauth/token?grant_type=password&username=' + name + '&password=' + password;
}

function getRefreshTokenUri() {
  return getUaaHostpath() + '/oauth/token?grant_type=refresh_token&state=' + Math.random().toString(36).substr(2);
}

/**
 * 获取当前的登陆用户java对象
 * @returns
 */
function getLoginUser() {
  if (loginUser) {
    return Promise.resolve(loginUser);
  }

  var proxyConfig = config.proxy;
  var userInfoUrl = getUaaHostpath() + '/userinfo';
  return request.getAsync({
    uri: userInfoUrl,
    headers: {
      Authorization: authorizationValue
    }
  }).then(function(res, body) {
    var user = utils.jsonParse(res.body)
    currentUser = _.clone(user)
    /**
     * 由于dubbo调用时user为序列化，
     * 从node调用java时，需要先进行一次序列化，针对特殊类型单独处理
     */
    _.assign(user, {
      id: java.long(user.id),
      mainId: java.long(user.mainId),
      orgId: java.long(user.orgId),
      depId: java.long(user.depId),
      posts: java.array.String(user.posts),
      entrustId: java.long(user.entrustId),
      shopId: java.long(user.shopId)
    })
    loginUser = java('com.dtdream.vanyar.user.dto.EcpLoginUser', user)
    return loginUser
  })
}

function getCurrentUser() {
  return currentUser || {};
}

function getAuthorization() {
  // 已经存在，直接返回
  if (authorizationValue) {
    return Promise.resolve(authorizationValue)
  }

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
    return authorizationValue
  })
}

function getProxyTarget(path) {
  var proxyConfig = config.proxy;
  if (!proxyConfig) {
    return;
  }

  var domainUrl = '';
  _.forEach(proxyConfig, function(moduleConfig, key) {
    if (moduleConfig.apis && _.some(moduleConfig.apis, function(api) {
      // \\开头的为正则表达式
      if (_.startsWith(api, '\\')) {
        return new RegExp(api).test(path);
      }
      return api == path;
    })) {
      domainUrl = getModuleHostpath(moduleConfig);
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

module.exports = {
  getProxyTarget: getProxyTarget,

  refreshTokenInterval: refreshTokenInterval,

  getAuthorization: getAuthorization,

  getLoginUser: getLoginUser,

  getCurrentUser: getCurrentUser
}
