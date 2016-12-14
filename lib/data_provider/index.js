
var Promise = require('bluebird');

var Local = require('./local');
var Remote = require('./remote');
var interfaces = require('./interfaces')

module.exports = {

  init: function() {
    return Local.init()
      .then(Remote.init)
      .then(interfaces.init)
  },

  /**
   * 重新加载数据文件
   */
  reloadDataFile: Local.reloadFile,


  isComponent: Remote.isComponent,

  /**
   * 获取组件的编译值
   *
   * return {Promise}
   */
  getCompData: function(path, params) {
    return Local.getCompData(path, params)
      .then(function(result) {
        if (result) {
          return result;
        }

        return Remote.getCompData(path);
      });
  },

  /**
   * 获取全局配置的值
   *
   * return {Promise}
   */
  getGlobalData: function() {
    return Promise.resolve(Local.getGlobalData());
  },

  /**
   * 获取所有的url，用于初始化默认路由
   *
   * return {Promise}
   **/
  getAllUrlData: Local.getUrlsData,

  /**
   * 代理http请求
   *
   * return {Promise}
   */
  proxyHttp: Remote.proxyRequest

}