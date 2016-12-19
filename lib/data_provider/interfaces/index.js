
var fs = require('fs');
var _ = require('lodash')
var path = require('path')
var Promise = require('bluebird')
var java = require('js-to-java')

var request = require('request');

var debug = require('debug')('zcyjiggly:interfaces');

var Oauth = require('../remote/oauth')

var interfaceObj = {}

function getFunctionFromFileName(filename) {
  return _.split(filename, '.')[0]
}

module.exports = {
  init: function() {
    var interfacePath = path.resolve(process.cwd(), 'interfaces.js');
    return new Promise(function(resolve, reject) {
      request.get({
        uri: 'https://120.27.160.167/ZCY/zcy-web-lib/raw/master/jiggly-dubbos/index.js',
        strictSSL: false
      })
      .pipe(fs.createWriteStream(interfacePath))
      .on('finish', function(error) {
        if (error) {
          debug('pipe interfaces file error', error)
          return reject()
        }
        interfaceObj = require(interfacePath);
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