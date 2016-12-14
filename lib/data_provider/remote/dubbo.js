
const _ = require('lodash');
const Promise = require('bluebird');
const nzd = require('node-zookeeper-dubbo');

const Yaml = require('./yaml');

/**
 * 初始化dubbo服务
 * 启动完成，需要在dubbo server init done输出结束才能开始执行，所以不能同步执行。
 * 由于正常是调用是异步的，所以执行时没有问题
 */
const opt = {
  application: { name: 'dubbo'},
  register: '120.26.80.23:2181',
  dubboVer: '2.5.3.6'
}

var nzdEntry;

module.exports = {

  init: function() {
    return Yaml.getDubboDependencies()
      .then(function(dependencies) {
        nzdEntry = new nzd(_.assign(opt, {
          dependencies: dependencies
        }));
      });
  },

  getEntry: function() {
    if (nzdEntry) {
      return Promise.resolve(nzdEntry);
    }
    return Yaml.getDubboDependencies()
      .then(function(dependencies) {
        nzdEntry = new nzd(_.assign(opt, {
          dependencies: dependencies
        }));
        return nzdEntry;
      });
  }
};
