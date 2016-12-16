
var fs = require('../../promise').fs;
var _ = require('lodash')
var path = require('path')
var Promise = require('bluebird')
let java = require('js-to-java')

var debug = require('debug')('zcyjiggly:interfaces');

var Oauth = require('../remote/oauth')

var interfacePath = path.join(__dirname, './../../../interfaces')
var interfaceObj = {}

function getFunctionFromFileName(filename) {
  return _.split(filename, '.')[0]
}

function readDirectory(dir, service){
  var files = fs.readdirSync(dir) || [];
  return Promise.each(files, function(filename) {
    var filepath = path.join(dir, filename)
    if (fs.statSync(filepath).isDirectory()) {
      if (!interfaceObj[filename]) {
        interfaceObj[filename] = {}
      }
      return readDirectory(filepath, filename)
    } else {
      var functionName = getFunctionFromFileName(filename)
      interfaceObj[service][functionName] = require(filepath)
    }
  })
}

module.exports = {
  init: function() {
    return readDirectory(interfacePath)
      .then(function() {
        debug('interfaces', interfaceObj)
      })
  },

  getHandler: function(service, functionName, params) {
    var interService = interfaceObj[service]
    if (!interService) {
      return Promise.resolve()
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