
var crypto = require('crypto');
var _ = require('lodash');

module.exports = {
  md5: function(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  },

  homePath: function() {
    return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
  },

  jsonParse: function(data) {
    try {
      return JSON.parse(data)
    } catch (e) {
      return {}
    }
  },

  /**
   * 转成string
   */
  toString: function(val) {
    if (_.isUndefined(val)) {
      return '';
    }
    if (_.isNumber(val)) {
      return val + '';
    }
    if (_.isString(val) || _.isObject(val)) {
      return val;
    }
    return '';
  }
};
