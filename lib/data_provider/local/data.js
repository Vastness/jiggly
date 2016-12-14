
var _ = require('lodash');
var fs = require('../../promise').fs;
var Promise = require('bluebird');
var config = require('../../config');

// 是否已经有扫描数据文件
var hasScan = false;

// 存储多个数据
var urlData = {};
var compData = {};
var globalData = {};

function loadData(filePath) {
  return fs.statAsync(filePath)
    .then(function(stat) {
      if (!stat) {
        return;
      }

      // 清除原本的cache缓存，不然不会更新数据
      delete require.cache[require.resolve(filePath)];

      var data = require(filePath);
      urlData = _.assign(urlData, data.urls);
      compData = _.assign(compData, data.comps);
      globalData = _.assign(globalData, data.globals);
    });
};

/**
 * 初始化本地数据
 * 数据获取时以本地为准，本地没有的数据才尝试从远端获取
 *
 * @returns
 */
function scanDataFiles() {
  return Promise.each(config.dataFiles, loadData)
    .then(function() {
      hasScan = true;
    });
}

module.exports = {

  init: scanDataFiles,

  reloadFile: function(filePath) {
    return loadData(filePath);
  },

  getUrlsData: function() {
    if (hasScan) {
      return Promise.resolve(urlData);
    }

    return scanDataFiles()
      .then(function() {
        return urlData;
      });
  },

  getCompsData: function() {
    if (hasScan) {
      return Promise.resolve(compData);
    }

    return scanDataFiles()
      .then(function() {
        return compData;
      });
  },

  getGlobalData: function() {
    if (hasScan) {
      return Promise.resolve(globalData);
    }

    return scanDataFiles()
      .then(function() {
        return globalData;
      });
  }
}