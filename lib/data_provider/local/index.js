var _ = require('lodash');
var Promise = require('bluebird');

var Data = require('./data');

module.exports = {

  init: Data.init,

  getCompData: function(path, params) {
    return Data.getCompsData()
      .then(function(compData) {
        if (!_.has(Data.compData, path)) {
          return;
        }

        var data = Data.compData[path];
        return _.isFunction(data) ? data(params) : data;
      });
  },

  reloadFile: Data.reloadFile,

  getGlobalData: Data.getGlobalData,

  getUrlsData: Data.getUrlsData
};
