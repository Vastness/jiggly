
const yaml = require('js-yaml');
const fs   = require('../../promise').fs;
const path = require('path');
const _    = require('lodash');
const Promise = require('bluebird');

var debug = require('debug')('zcyjiggly:yaml');

var Oauth = require('./oauth')
var interfaceHandler = require('../interfaces')
var config = require('../../config');
var filesHome = config.filesHome;

var scanFrontFile = false;
var scanBackFile = false;
// 后端服务的调用对象
var compServiceMap = {};
var serviceMap = {};
// 保存所有的bubbo服务依赖，用于初始化
var dubboDep = {};

/**
 * {
 *   category:
 *   name:
 *   service:
 *   services: [{
 *     _TODO_CNT_: countBacklogT
 *   }]
 * }
 */
function initFrontConfig() {
  var frontConfigYaml = path.join(filesHome, 'front_config.yaml')
  return fs.readFileAsync(frontConfigYaml, 'utf8')
    .then(function(content) {
      var frontConfig = yaml.safeLoad(content);

      _.each(frontConfig.components, function(component, compPath) {
        compServiceMap[compPath] = {
          service: component.service,
          services: component.services
        }
      })
    })
    .then(function() {
      scanFrontFile = true;
    })
}

/**
 * 全局存储配置文件的service
 *
 * 访问时，根据component path，
 *   得到service，值填入_DATA_
 *   得到services，对应各个dubbo服务名名称
 */


/**
 * 解析uri，得到service路径和service名，function名
 *   将service路径的最后一个词，作为dubbo服务名称，用于初始化dubbo client
 * com.dtdream.vanyar.privilege.service.ResourcePrivilegeReadService:getEnvHref
 *
 * @param {String} uri
 * @returns {Array}
 */
function getServiceFromUri(uri) {
  if (!uri) {
    return
  }
  // 冒号分割，得到service名和function名
  var services = uri.split(':')
  // 不是2，格式异常
  if (services.length != 2) {
    return;
  }

  var servicePath = services[0]
  var functionName = services[1]
  var pkgArray = servicePath.split('.')
  // 数组最好一个为service名
  var serviceName = _.last(pkgArray)
  return {
    path: servicePath,
    name: serviceName,
    call: functionName
  };
}

/**
 * 获取dubbo服务的注册格式
 * {
      interface: 'com.dtdream.vanyar.user.service.UserReadService',
      version: '1.0.0',
      timeout: 6000
    }
 *
 * @param {String} path
 * @returns
 */
function getDubboServiceObject(path) {
  return {
    interface: path,
    version: '1.0.0',
    timeout: 6000
  }
}

/**
 * back_config.yaml
 *
 *  services:
 { getEnvHref:
    { type: 'SPRING',
      uri: 'com.dtdream.vanyar.privilege.service.ResourcePrivilegeReadService:getEnvHref' },
    getCommonData:
    { type: 'SPRING',
      uri: 'com.dtdream.vanyar.privilege.service.ResourcePrivilegeReadService:getCommonData' },
    getMenus:
    { type: 'SPRING',
      uri: 'com.dtdream.vanyar.privilege.service.ResourcePrivilegeReadService:getMenuTree' },
*
*/

/**
 * 得到后端的dubbo的服务
 * function作为key，value为{service, fun}
 * }
 *
 * 调用时使用
 *  xxx.ServiceName.Call
 */
function initBackConfig() {
  if (scanBackFile) {
    return Promise.resolve();
  }

  var backConfigYaml = path.join(filesHome, 'back_config.yaml');
  return fs.readFileAsync(backConfigYaml, 'utf8')
    .then(function(content) {
      var backConfigJson = yaml.safeLoad(content);

      _.each(backConfigJson.services, function(descJson, functionName) {
        var serviceObj = getServiceFromUri(descJson.uri);
        var ServiceName = serviceObj.name;
        if (!dubboDep[ServiceName]) {
          dubboDep[ServiceName] = getDubboServiceObject(serviceObj.path);
        }
        serviceMap[functionName] = serviceObj;
      })

      scanBackFile = true;
    })
}

/**
 *
 * Dubbo.User
  .getUserDetailInfo({'$class': 'java.lang.Long', '$': 1})
  .then(console.log)
 *
 * @param {Object} nzd
 * @param {String} name
 * @param {Object} params
 * @returns
 */
function getServiceByFunctionName(nzd, name, params) {
  var service = serviceMap[name];
  return Oauth.getLoginUser()
    .then(function(loginUser) {
      var functionName = service.call
      var serviceName = service.name
      return interfaceHandler.getHandler(service.path, functionName, params)
       .then(function(javaParams) {
         debug('start request content:', serviceName, functionName)
         var caller = nzd[serviceName][functionName]
         return caller && caller.apply(this, javaParams);
       }).then(function(data) {
         if (data && data.success) {
           debug('start request content success:', serviceName, functionName)
           return data.result;
         }
       }).catch(function(err) {
         debug('getService error', functionName, err)
       })
    })
}

/**
 * 通过组件路径获取数据服务
 *
 * @param {String} comPath
 */
function getServiceByCompPath(nzd, comPath, params) {
  if (!nzd) {
    return Promise.reject('zk连接异常');
  }
  return Promise.resolve()
    .then(function() {
      if (!scanFrontFile) {
        return initFrontConfig();
      }
    })
    .then(function() {
      if (!scanBackFile) {
        return initBackConfig();
      }
    })
    .then(function() {
      var serviceConfig = compServiceMap[comPath];
      // 没有对应的组件服务
      if (!serviceConfig) {
        return;
      }
      var dataFunName = serviceConfig.service;
      var services = serviceConfig.services;
      if (!dataFunName && !services) {
        return;
      }

      var promiseCallObj = {};
      if (dataFunName) {
        promiseCallObj['_DATA_'] = getServiceByFunctionName(nzd, dataFunName, params);
      }
      _.forEach(services, function(funName, key) {
        promiseCallObj[key] = getServiceByFunctionName(nzd, funName, params);
      })

      return Promise.props(promiseCallObj)
    })
}

/**
 * 判断路径是否是组件
 *
 * @param {String} path
 */
function isComponent(path) {
  return !!compServiceMap[path];
}


module.exports = {

  getService: getServiceByCompPath,

  isComponent: isComponent,

  getDubboDependencies: function() {
    return initBackConfig()
      .then(function() {
        return dubboDep;
      });
  }
}
