
var fs = require('fs');
var _ = require('lodash')
var path = require('path')
var Promise = require('bluebird')
var java = require('js-to-java')

var request = require('request');

var vm = require('vm')
var mu = require('module')

var debug = require('debug')('zcyjiggly:interfaces');

var Oauth = require('../remote/oauth')
var config = require('../../config');

var interfaceObj = {}

function getFunctionFromFileName(filename) {
  return _.split(filename, '.')[0]
}

module.exports = {
  init: function() {
    if (!config || !config.dubbo) {
      return Promise.resolve()
    }

    if (!config.dubbo.base) {
      debug('config.dubbo.base is required!');
      return Promise.reject()
    }

    return new Promise(function(resolve, reject) {
      request.getAsync({
        uri: config.dubbo.base,
        strictSSL: false
      })
      .then(function(res) {
        vm.runInThisContext(mu.wrap(res.body))(exports, require, module, __filename, __dirname)
        interfaceObj = module.exports
        if (config.dubbo.extra) {
          var extraPath = path.resolve(process.cwd(), config.dubbo.extra);
          _.assignIn(interfaceObj, require(extraPath))
        }
        resolve()
      })
    })
  },

  getHandler: function(service, functionName, params) {
    var interService = interfaceObj[service]
    if (!interService) {
      // 默认不配置，直接传当前user
      return Oauth.getLoginUser()
        .then(function(user) {
          return [user]
        })
    }
    var handler = interService[functionName]
    if (!handler) {
      // 默认不配置，直接传当前user
      return Oauth.getLoginUser()
        .then(function(user) {
          return [user]
        })
    }
    var result = handler(params)(java)
    if (!result || !result.args) {
      result = {args: []}
    }
    if (!result.user) {
      return Promise.resolve(result.args)
    }

    return Oauth.getLoginUser()
      .then(function(user) {
        var len = result.user.index
        if (len) {
          var leftArray = _.take(result.args, len)
          var rightArray = _.drop(result.args, len)
          result.args = _.concat(leftArray, [user], rightArray)
        } else {
          result.args.unshift(user)
        }
        return result.args
      })
  }
}