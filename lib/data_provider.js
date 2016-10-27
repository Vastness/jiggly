var fs = require("fs");
var _ = require("lodash");

var config = require("./config");

var urlData = {};
var compData = {};
var globalData = {};

function loadData(dataFilePath) {
  if (fs.existsSync(dataFilePath)) {
    var data = require(dataFilePath);
    urlData = _.assign(urlData, data.urls);
    compData = _.assign(compData, data.comps);
    return globalData = _.assign(globalData, data.globals);
  }
};
// init data, include component data, url data and global data
_.each(config.dataFiles, loadData);

module.exports = {

  loadData: loadData,

  getCompData: function(path, params) {
    if (!_.has(compData, path)) {
      return {
        found: false
      };
    }
    var data = compData[path];
    return {
      found: true,
      result: _.isFunction(data) ? data(params) : data
    };
  },

  getGlobalData: function() {
    return globalData;
  },

  getAllUrlData: function() {
    return urlData;
  }
};
